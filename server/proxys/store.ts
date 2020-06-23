import { QueryOptions, MongooseDao, autoNumber } from 'kenote-mongoose-helper'
import __Models from '~/models'
import __ErrorCode from '~/utils/error/code'
import { loadError, ErrorState } from '~/utils/error'

const Model = __Models.storeModel
const options: QueryOptions = {
  name: 'store'
}

@autoNumber({})
class StoreDao extends MongooseDao {}

class StoreProxy {

  public Dao = new StoreDao(Model, options)

  private errorState: ErrorState

  constructor (errorState: ErrorState) {
    this.errorState = errorState
  }
}

export default (errorState?: ErrorState) => new StoreProxy(errorState || loadError('zh-cn'))