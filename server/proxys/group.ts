import { QueryOptions, MongooseDao, autoNumber } from 'kenote-mongoose-helper'
import __Models from '~/models'

const Model = __Models.groupModel
const options: QueryOptions = {
  name: 'group'
}

@autoNumber({})
class GroupDao extends MongooseDao {}

class GroupProxy {

  public Dao = new GroupDao(Model, options)
}

export default new GroupProxy()