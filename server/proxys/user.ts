import { QueryOptions, MongooseDao, autoNumber } from 'kenote-mongoose-helper'
import __Models from '~/models'
import { loadError, ErrorState } from '~/utils/error'

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
  
}

export default (errorState?: ErrorState) => new UserProxy(errorState || loadError('zh-cn'))