import { FilterQuery, UpdateQuery } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { UserDocument, SafeUserDocument, RegisterDocument, CreateUserDocument } from '@/types/services/db'
import { isArray, merge, cloneDeep, omit } from 'lodash'
import User from '~/models/user'
import { ErrorCode, httpError, Bcrypt } from '~/services'

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