import { QueryOptions, MongooseDao, autoNumber, UpdateWriteResult } from 'kenote-mongoose-helper'
import __Models from '~/models'
import __ErrorCode from '~/utils/error/code'
import { loadError, ErrorState } from '~/utils/error'
import { userBaseField } from './user'
import * as uuid from 'uuid'
import { oc } from 'ts-optchain'
import { CreateVerifyDocument, ResponseVerifyDocument, UpdateVerifyResult, VerifyGenerateOptions } from '@/types/proxys/verify'
import * as Mail from 'nodemailer/lib/mailer'
import mailer, { mailSender, parseMailUser } from '~/utils/mailer'
import { ResponseUserDocument } from '@/types/proxys/user'
import { site_name, options as serverOptins } from '~/config'
import { MailerContext } from '@/types/mailer'
import { DYSMS } from '~/utils/sms'
import { SMS } from '@/types/alicloud'
import userProxy from './user'
import * as PassportAPI from '@/types/apis/passport'
import { Security } from '@/types/restful'
import { pick } from 'lodash'

const Model = __Models.verifyModel
const options: QueryOptions = {
  name: 'verify',
  populate: {
    path: 'user',
    select: userBaseField
  }
}

@autoNumber({})
class VerifyDao extends MongooseDao {}

class VerifyProxy {

  public Dao = new VerifyDao(Model, options)

  private errorState: ErrorState

  constructor (errorState: ErrorState) {
    this.errorState = errorState
  }

  public async create (doc: CreateVerifyDocument): Promise<ResponseVerifyDocument> {
    let { type } = doc
    if (type === 'email') {
      doc.token = uuid.v4().replace(/\-/g, '')
    }
    else {
      doc.token = Math.random().toFixed(6).replace(/^(0\.)/i, '')
    }
    let result = await this.Dao.insert(doc) as ResponseVerifyDocument
    return result
  }

  public async update (conditions: any, doc: any): Promise<UpdateVerifyResult> {
    let token = Math.random().toFixed(6).replace(/^(0\.)/i, '')
    let update_at = new Date()
    let result = await this.Dao.updateOne(conditions, { ...doc, token, update_at })
    return { ...result, token }
  }

  public async generate (conditions: any, step: number, options?: VerifyGenerateOptions): Promise<ResponseVerifyDocument | UpdateVerifyResult> {
    let { ErrorInfo } = this.errorState
    let { name, verify_id } = oc(options)({})
    if (verify_id) {
      conditions = { _id: verify_id }
    }
    let verify: ResponseVerifyDocument | UpdateVerifyResult = await this.Dao.findOne({ ...conditions, type: 'code' }) as ResponseVerifyDocument
    if (verify_id && !verify) {
      throw ErrorInfo(__ErrorCode.ERROR_VERIFY_ID_FAILED)
    }
    if (verify) {
      let updateTime = verify_id ? verify.update_at : verify.create_at
      let difftime = Date.now() - updateTime.getTime()
      let timeout = step * 1000
      if (difftime < timeout) {
        throw ErrorInfo(__ErrorCode.ERROR_SEND_MAILPHONE_STEP)
      }
      !verify_id && await this.Dao.remove({ _id: verify._id })
    }
    if (verify_id) {
      verify = await this.update({ _id: verify_id }, { application: name })
    }
    else {
      verify = await this.create({ ...conditions, type: 'code' })
    }
    return verify
  }

  public async check (doc: Security.verifyCode, step: number, verify_id?: string): Promise<ResponseVerifyDocument> {
    let { ErrorInfo } = this.errorState
    let conditions: any = { type: 'code', user: doc.user }
    if (verify_id) {
      conditions = { ...conditions, _id: verify_id }
    }
    else {
      conditions = { ...conditions, token: doc.code }
    }
    let verify = await this.Dao.findOne(conditions) as ResponseVerifyDocument
    if (!verify) {
      throw ErrorInfo(verify_id ? __ErrorCode.ERROR_VERIFY_ID_FAILED : __ErrorCode.ERROR_VERIFY_CODE_FAILED)
    }
    let difftime: number = Date.now() - verify.create_at.getTime()
    let timeout: number = step * 1000
    if (difftime > timeout) {
      throw ErrorInfo(verify_id ? __ErrorCode.ERROR_VERIFY_ID_TIMEOUT : __ErrorCode.ERROR_VERIFY_CODE_TIMEOUT)
    }
    return verify
  }

  public async resetPwd (doc: PassportAPI.resetPwdDocument, type: PassportAPI.verifyUserType, step: number): Promise<UpdateWriteResult> {
    let verify = await this.check(pick(doc, ['user', 'code']) as Security.verifyCode, step)
    let result = await userProxy(this.errorState).resetPwd(doc, type)
    await this.Dao.remove({ _id: verify._id })
    return result
  }

  public sendMail (title: string, user: ResponseUserDocument, code: string, tpl: string, timeout: number = 3600): void {
    let mail: Mail.Options = {
      from: mailSender,
      to: parseMailUser(user),
      subject: `${site_name}${title}`
    }
    let content: MailerContext.sendCode = {
      title,
      site_name: site_name!,
      username: user.username,
      code,
      timeout: timeout / 60
    }
    mailer.sendMail(tpl, mail, content)
  }

  public async sendMobile (phone: string, code: string, tpl: SMS.template) {
    let sms = oc(serverOptins).sms('')
    await new DYSMS(sms).send(phone, tpl, { code })
  }
}

export default (errorState?: ErrorState) => new VerifyProxy(errorState || loadError('zh-cn'))