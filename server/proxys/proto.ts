import { QueryOptions, MongooseDao, autoNumber } from 'kenote-mongoose-helper'
import __Models from '~/models'
import { loadError, ErrorState } from '~/utils/error'
import { userBaseField } from './user'

const Model = __Models.protoModel
const options: QueryOptions = {
  name: 'proto',
  populate: {
    path: 'user',
    select: userBaseField
  }
}

@autoNumber({})
class ProtoDao extends MongooseDao {}

class ProtoProxy {

  public Dao = new ProtoDao(Model, options)

  private errorState: ErrorState

  constructor (errorState: ErrorState) {
    this.errorState = errorState
  }
}

export default (errorState?: ErrorState) => new ProtoProxy(errorState || loadError('zh-cn'))