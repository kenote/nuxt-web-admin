import { FilterQuery, Model, Document } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { VerifyDocument, CreateVerifyDocument, EditVerifyDocument, UserDocument } from '@/types/services/db'
import uuid from 'uuid'
import { VerifyGenerateOptions, UpdateVerifyResult } from '@/types/services/db/verify'
import { ErrorCode, httpError } from '~/services/error'
import mailer, { mailSender, parseMailUser, siteName, sendMailNext } from '~/services/mailer'
import Mail from 'nodemailer/lib/mailer'

export const Dao = modelDao<VerifyDocument>(models.Verify as unknown as Model<Document, {}>, {
  populate: {
    path: 'user',
    select: [ 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'binds', 'group', 'teams', 'access', 'create_at', 'update_at', 'jw_token' ]
  }
})

/**
 * 创建验证码/校验码
 * @param doc 
 */
export async function create (doc: CreateVerifyDocument) {
  if (doc.type === 'email') {
    doc.token = uuid.v4().replace(/\-/g, '')
  }
  else {
    doc.token = Math.random().toFixed(6).replace(/^(0\.)/i, '')
  }
  doc.create_at = new Date()
  doc.update_at = new Date()
  let result = await Dao.create(doc)
  return result
}

/**
 * 更新验证码/校验码
 * @param conditions 
 * @param doc 
 */
export async function update (conditions: FilterQuery<VerifyDocument>, doc: EditVerifyDocument): Promise<UpdateVerifyResult> {
  let token = Math.random().toFixed(6).replace(/^(0\.)/i, '')
  let update_at = new Date()
  let result = await Dao.updateOne(conditions, { ...doc, token, update_at })
  return { ...result, token, _id: conditions._id }
}

/**
 * 生成验证码/校验码
 * @param conditions 
 * @param step 
 * @param options 
 */
export async function generate (conditions: EditVerifyDocument | null, step: number, options?: VerifyGenerateOptions) {
  let { verify_id, name } = options ?? {}
  if (conditions) {
    if (verify_id) {
      conditions = { _id: verify_id }
    }
    let verify: VerifyDocument = await Dao.findOne<VerifyDocument>({ ...conditions, type: 'code' })
    if (verify_id && !verify) {
      throw httpError(ErrorCode.ERROR_VERIFY_ID_REQUIRED)
    }
    if (verify) {
      let updateTime = verify_id ? verify.update_at : verify.create_at
      let difftime = Date.now() - updateTime.getTime()
      let timeout = step * 1000
      if (difftime < timeout) {
        throw httpError(ErrorCode.ERROR_SEND_MAILPHONE_STEP)
      }
      !verify_id && await Dao.remove({ _id: verify._id })
    }
  }
  if (verify_id) {
    return await update({ _id: verify_id }, { application: name })
  }
  else  {
    return await create({ type: 'code', user: conditions?.user })
  }
}

/**
 * 发送验证码邮件
 * @param title 
 * @param user 
 * @param code 
 * @param timeout 
 */
export function sendMail (title: string, user: UserDocument, code: string, tpl: string, timeout: number = 3600) {
  let mailOptions: Mail.Options = {
    from: mailSender,
    to: parseMailUser(user),
    subject: `${siteName}${title}`
  }
  let content = {
    title,
    site_name: siteName,
    username: user.username,
    code,
    timeout: timeout / 60
  }
  // 发送模版邮件
  mailer.sendMail(tpl, content)(mailOptions, sendMailNext)
}

/**
 * 校验验证码
 * @param doc 
 * @param step 
 * @param verify_id 
 */
export async function check (doc: Partial<Record<'code' | 'user' | 'verify_id', string>>, step: number, verify_id?: string | null) {
  let { code, user } = doc
  let conditions: FilterQuery<EditVerifyDocument & Document> = { type: 'code', user }
  if (verify_id) {
    conditions._id = verify_id
  }
  else {
    conditions.token = code
    if (doc.verify_id) {
      conditions._id = doc.verify_id
    }
  }
  let verify = await Dao.findOne(conditions)
  if (!verify) {
    throw httpError(verify_id ? ErrorCode.ERROR_VERIFY_ID_FAILED : ErrorCode.ERROR_VERIFY_CODE_FAILED)
  }
  let difftime = Date.now() - verify.create_at.getTime()
  let timeout = step * 1000
  if (difftime > timeout) {
    throw httpError(verify_id ? ErrorCode.ERROR_VERIFY_ID_TIMEOUT : ErrorCode.ERROR_VERIFY_CODE_TIMEOUT)
  }
  return verify
}