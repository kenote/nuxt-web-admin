import { QueryOptions, MongooseDao, autoNumber, UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'
import __Models from '~/models'
import __ErrorCode from '~/utils/error/code'
import { loadError, ErrorState } from '~/utils/error'
import * as PassportAPI from '@/types/apis/passport'
import { ResponseUserDocument, SafeUserDocument, RegisterUserDocument, CreateUserDocument } from '@/types/proxys/user'
import { pick, omit } from 'lodash'
import * as passportUtil from '~/utils/passport'
import * as Mail from 'nodemailer/lib/mailer'
import mailer, { mailSender, parseMailUser } from '~/utils/mailer'
import { site_name, site_url, options as serverOptins } from '~/config'
import { MailerContext } from '@/types/mailer'
import verifyProxy from './verify'
import ticketProxy from './ticket'
import { Register, Security } from '@/types/restful'
import { ResponseTicketDocument } from '@/types/proxys/ticket'
import { ResponseVerifyDocument } from '@/types/proxys/verify'

const Model = __Models.userModel
const options: QueryOptions = {
  name: 'user',
  populate: [
    {
      path: 'group',
      select: [ 'id', 'name', 'level', 'description', 'store', 'platform', 'access' ],
      populate: {
        path: 'store',
        select: [ 'upload_type', 'download_type' ]
      }
    },
    {
      path: 'teams',
      select: [ 'id', 'name', 'description', 'platform', 'access', 'rtsps' ]
    }
  ]
}

// tslint:disable-next-line: max-line-length
export const userBaseField = [ '_id', 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'binds', 'group', 'teams', 'access', 'create_at', 'update_at', 'jw_token' ]

@autoNumber({})
class UserDao extends MongooseDao {}

class UserProxy {

  public Dao = new UserDao(Model, options)

  private errorState: ErrorState

  constructor (errorState: ErrorState) {
    this.errorState = errorState
  }

  public async login (doc: PassportAPI.login): Promise<ResponseUserDocument> {
    let { ErrorInfo } = this.errorState
    let conditions = {
      $or: [
        { username  : doc.username },
        { email     : doc.username },
        { mobile    : doc.username }
      ]
    }
    let user = await this.Dao.findOne(conditions) as SafeUserDocument
    if (!user) {
      throw ErrorInfo(__ErrorCode.ERROR_LOGINVALID_FAIL)
    }
    let valide = passportUtil.bcrypt.compare(doc.password!, user.encrypt, user.salt)
    if (!valide) {
      throw ErrorInfo(__ErrorCode.ERROR_LOGINVALID_FAIL)
    }
    return pick(user, userBaseField) as ResponseUserDocument
  }

  public async resetPwd (doc: PassportAPI.resetPwdDocument, type: PassportAPI.verifyUserType): Promise<UpdateWriteResult> {
    // let { hash: encrypt, salt } = passportUtil.bcrypt.hash(doc.password || '')
    // let result = await this.Dao.updateOne({ [type]: doc.name }, { encrypt, salt })
    let result = await this.setPassword({ [type]: doc.name }, pick(doc, ['password']) as Security.setPassword)
    return result
  }

  public async create (doc: RegisterUserDocument): Promise<ResponseUserDocument> {
    let { ErrorInfo } = this.errorState
    let isUsername = await this.Dao.findOne({ username: doc.username }) as ResponseUserDocument
    if (isUsername) {
      throw ErrorInfo(__ErrorCode.ERROR_VALID_USERNAME_UNIQUE)
    }
    let isEmail = await this.Dao.findOne({ email: doc.email }) as ResponseUserDocument
    if (isEmail) {
      throw ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_UNIQUE)
    }
    let password = passportUtil.bcrypt.hash(doc.password)
    let _doc: CreateUserDocument = {
      ...omit(doc, ['password']),
      encrypt: password.hash,
      salt: password.salt
    }
    let user = await this.Dao.insert(_doc) as ResponseUserDocument
    return user
  }

  public async register (doc: RegisterUserDocument, setting: Register.config, ticket?: ResponseTicketDocument | null): Promise<Partial<ResponseUserDocument>>{
    let user = await this.create(doc)
    if (setting.invitation && ticket) {
      let used: boolean = ticket.stint <= ticket.uses + 1
      await ticketProxy(this.errorState).Dao.updateOne({ _id: ticket._id }, { $inc: { uses: 1}, used })
    }
    await this.sendEmailVerify(user, setting.email_verify.timeout)
    return omit(user, ['encrypt', 'salt'])
  }

  public async sendEmailVerify (user: ResponseUserDocument, timeout: number = 43200): Promise<void> {
    let verify = await verifyProxy(this.errorState).create({ type: 'email', user: user._id })
    let mail: Mail.Options = {
      from: mailSender,
      to: parseMailUser(user),
      subject: `${site_name}邮箱验证`
    }
    let content: MailerContext.emailVerify = {
      site_name: site_name!,
      username: user.username,
      email_verify_url: `${site_url}/security/email_verify?token=${verify.token}&id=${verify.id}`,
      timeout: timeout / 3600
    }
    mailer.sendMail('email_verify.mjml', mail, content)
  }

  public async sendNewUser (user: ResponseUserDocument, password: string): Promise<void> {
    let mail: Mail.Options = {
      from: mailSender,
      to: parseMailUser(user),
      subject: `${site_name}新用户`
    }
    let content: MailerContext.newUser = {
      site_name: site_name!,
      site_url: site_url!,
      username: user.username,
      password
    }
    mailer.sendMail('create_user.mjml', mail, content)
  }

  public async sendPassword (user: ResponseUserDocument, password: string): Promise<void> {
    let mail: Mail.Options = {
      from: mailSender,
      to: parseMailUser(user),
      subject: `${site_name}修改密码`
    }
    let content: MailerContext.newUser = {
      site_name: site_name!,
      site_url: site_url!,
      username: user.username,
      password
    }
    mailer.sendMail('set_pass.mjml', mail, content)
  }

  public async verifyEmailMobile (document: PassportAPI.verifyDocument, warnings: PassportAPI.verifyWarning, setting: Register.config): Promise<ResponseVerifyDocument> {
    let { ErrorInfo } = this.errorState
    let VerifyProxy = verifyProxy(this.errorState)
    let { type } = document
    let verify = await VerifyProxy.Dao.findOne(document) as ResponseVerifyDocument
    if (verify) {
      let difftime: number = Date.now() - verify.create_at.getTime()
      let timeout: number = setting.email_verify.timeout * 1000
      if (difftime > timeout) {
        throw ErrorInfo(warnings[type].timeout)
      }
      if (verify.approved) {
        throw ErrorInfo(__ErrorCode.ERROR_VERIFY_TOKEN_VERIFIED)
      }
      await VerifyProxy.Dao.updateOne({ _id: verify._id }, { approved: true })
      await this.Dao.updateOne({ _id: verify.user._id }, { binds: Array.from(new Set([ ...verify.user.binds, type ])) })
    }
    return verify
  }

  public async setPassword (conditions: any, doc: Security.setPassword): Promise<UpdateWriteResult> {
    let { hash: encrypt, salt } = passportUtil.bcrypt.hash(doc.password || '')
    let result = await this.Dao.updateOne(conditions, { encrypt, salt })
    return result
  }

  public async remove (conditions: any): Promise<DeleteWriteResult> {
    let query = await this.Dao.remove(conditions)
    return query
  }
  
}

export default (errorState?: ErrorState) => new UserProxy(errorState || loadError('zh-cn'))