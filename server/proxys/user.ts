import { QueryOptions, MongooseDao, autoNumber, UpdateWriteResult } from 'kenote-mongoose-helper'
import __Models from '~/models'
import __ErrorCode from '~/utils/error/code'
import { loadError, ErrorState } from '~/utils/error'
import * as PassportAPI from '@/types/apis/passport'
import { ResponseUserDocument, SafeUserDocument } from '@/types/proxys/user'
import { pick } from 'lodash'
import * as passportUtil from '~/utils/passport'

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
    let { hash: encrypt, salt } = passportUtil.bcrypt.hash(doc.password || '')
    let result = await this.Dao.updateOne({ [type]: doc.name }, { encrypt, salt })
    return result
  }
  
}

export default (errorState?: ErrorState) => new UserProxy(errorState || loadError('zh-cn'))