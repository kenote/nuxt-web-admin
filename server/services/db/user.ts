import { FilterQuery, UpdateQuery } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { UserDocument, SafeUserDocument, RegisterDocument, CreateUserDocument, VerifyDocument } from '@/types/services/db'
import { isArray, merge, cloneDeep, omit, pick, unset } from 'lodash'
import User from '~/models/user'
import { ErrorCode, httpError } from '~/services/error'
import * as Bcrypt from '~/services/bcrypt'
import { Account } from '@/types/account'
import * as verifyDB from './verify'

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
  if (isEamil) {
    throw httpError(ErrorCode.ERROR_VALID_EMAIL_UNIQUE)
  }
  let isMobile = await Dao.findOne({ mobile })
  if (isMobile) {
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