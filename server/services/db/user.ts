import { FilterQuery } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { UserDocument, SafeUserDocument, RegisterDocument, CreateUserDocument, VerifyDocument, EditUserDocument } from '@/types/services/db'
import { isArray, merge, omit, get, keys } from 'lodash'
import { ErrorCode, httpError } from '~/services/error'
import * as Bcrypt from '~/services/bcrypt'
import { Account } from '@/types/account'
import * as verifyDB from './verify'
import mailer, { mailSender, parseMailUser, siteName, siteUrl, sendMailNext } from '~/services/mailer'
import Mail from 'nodemailer/lib/mailer'
import { AccountConfigure } from '@/types/config'
import nunjucks from 'nunjucks'
import ruleJudgment from 'rule-judgment'
import { CheckWarning } from '@/types/services/db/user'

export const Dao = modelDao<UserDocument>(models.User, {
  populate: [
    {
      path: 'group',
      select: [ 'id', 'name', 'level', 'description', 'store', 'platform', 'access' ]
    },
    {
      path: 'team',
      select: [ 'id', 'name', 'description', 'platform', 'access', 'rtsps', 'super', 'owner' ]
    }
  ]
})

export const warnings: CheckWarning = {
  username: ErrorCode.ERROR_VALID_USERNAME_UNIQUE,
  email: ErrorCode.ERROR_VALID_EMAIL_UNIQUE,
  mobile: ErrorCode.ERROR_VALID_MOBILE_UNIQUE
}

/**
 * 创建新用户
 * @param doc 
 */
export async function create (doc: RegisterDocument) {
  let { username, email, mobile } = doc
  let isUsername = await Dao.findOne({ username })
  if (isUsername) {
    throw httpError(ErrorCode.ERROR_VALID_USERNAME_UNIQUE)
  }
  let isEamil = await Dao.findOne({ email })
  if (isEamil && doc.email) {
    throw httpError(ErrorCode.ERROR_VALID_EMAIL_UNIQUE)
  }
  let isMobile = await Dao.findOne({ mobile })
  if (isMobile && doc.mobile) {
    throw httpError(ErrorCode.ERROR_VALID_MOBILE_UNIQUE)
  }
  let password = Bcrypt.encode(doc.password)
  let newUser: CreateUserDocument = merge(omit(doc, ['password']), password)
  let result = await Dao.create(newUser)
  return omit(result, ['encrypt', 'salt'])
}

/**
 * 账号登录
 * @param doc 
 */
export async function login (doc: Account.login) {

  let conditions: FilterQuery<UserDocument> = {
    $or: [
      { username  : doc.username },
      { email     : doc.username },
      { mobile    : doc.username }
    ]
  }
  let users = await Dao.find<SafeUserDocument>(conditions)
  if (users.length === 0) {
    throw httpError(ErrorCode.ERROR_LOGINVALID_FAIL)
  }
  let results: UserDocument[] = []
  for (let user of users) {
    let valide = Bcrypt.compare(doc.password!, user.encrypt, user.salt)
    if (valide) {
      await Dao.updateOne({ _id: user._id }, { associate_key: '' })
      let item = merge( omit(JSON.parse(JSON.stringify(user)), [ 'encrypt', 'salt', 'jw_token' ]), { associate_key: '' })
      results.push(item as UserDocument)
    }
  }
  if (results.length === 0) {
    throw httpError(ErrorCode.ERROR_LOGINVALID_FAIL)
  }
  return results.length === 1 ? results[0] : results
}

/**
 * 多账号选择登录
 * @param doc 
 */
export async function loginSlect (doc: Account.uuidResult<string>) {
  let verify = await verifyDB.Dao.findOne<VerifyDocument>({ type: 'login', token: doc.uuid })
  if (!verify) {
    throw httpError(ErrorCode.ERROR_NOT_FOUND_ACCESSKEY, ['登录'])
  }
  let ids = JSON.parse(verify.application ?? [''])
  if (!isArray(ids) || !ids.includes(doc.result)) {
    throw httpError(ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
  }
  await verifyDB.Dao.remove({ type: 'login', token: doc.uuid })
  let result = await Dao.findOne<UserDocument>({ _id: doc.result })
  if (!result) {
    throw httpError(ErrorCode.ERROR_FINDUSER_NOTEXIST)
  }
  return omit(JSON.parse(JSON.stringify(result)), [ 'encrypt', 'salt' ]) as UserDocument
}

/**
 * 发送验证邮件
 * @param user 
 */
export async function sendEmailVerify (user: UserDocument, options: AccountConfigure.emailVerify) {
  let { timeout, url } = options
  await verifyDB.Dao.remove({ type: 'email', user: user._id })
  let verify = await verifyDB.create({ type: 'email', user: user._id })
  let mailOptions: Mail.Options = {
    from: mailSender,
    to: parseMailUser(user),
    subject: `${siteName}邮箱验证`
  }
  let content = {
    site_name: siteName,
    username: user.username,
    email_verify_url: nunjucks.renderString(url, { siteUrl, verify }),
    timeout: timeout / 3600
  }
  // 发送模版邮件
  mailer.sendMail('email_verify.mjml', content)(mailOptions, sendMailNext)
}

/**
 * 更新用户数据
 * @param conditions 
 * @param doc 
 */
export async function upInfo (conditions: FilterQuery<UserDocument>, doc: Partial<RegisterDocument>) {
  let bindKeys = ['email', 'mobile']
  let user = await Dao.findOne(conditions)
  let data: EditUserDocument | CreateUserDocument  = omit(doc, ['password'])
  if (doc.username) {
    let result = await Dao.findOne({ username: doc.username, _id: { $ne: user._id }})
    if (result) {
      throw httpError(warnings.username)
    }
  }
  if (ruleJudgment({ $_in: bindKeys })(keys(doc))) {
    let binds = user.binds
    for (let key of bindKeys) {
      if (get(doc, key)) {
        let result = await Dao.findOne({ [key]: get(doc, key), _id: { $ne: user._id }})
        if (result) {
          throw httpError(warnings[key])
        }
        binds.push(key)
      }
    }
    data.binds = Array.from(new Set(binds))
  }
  if (doc.password) {
    let password = Bcrypt.encode(doc.password)
    data = merge(data, password)
  }
  data.update_at = new Date()
  return await Dao.updateOne(conditions, data)
}

/**
 * 注销账号
 * @param conditions 
 */
export async function remove (conditions: FilterQuery<UserDocument>) {
  // 
  return await Dao.remove(conditions)
}