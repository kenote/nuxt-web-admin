import { QueryOptions, MongooseDao, autoNumber } from 'kenote-mongoose-helper'
import __Models from '~/models'

const Model = __Models.storeModel
const options: QueryOptions = {
  name: 'store'
}

@autoNumber({})
class StoreDao extends MongooseDao {}

class StoreProxy {

  public Dao = new StoreDao(Model, options)
}

export default new StoreProxy()