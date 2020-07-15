import { QueryOptions, MongooseDao, autoNumber } from 'kenote-mongoose-helper'
import __Models from '~/models'
import { loadError, ErrorState } from '~/utils/error'

const Model = __Models.ditchModel
const options: QueryOptions = {
  name: 'ditch',
  populate: {
    path: 'teams',
    select: ['id', 'name', 'description']
  }
}

@autoNumber({})
class DitchDao extends MongooseDao {}

class DitchProxy {

  public Dao = new DitchDao(Model, options)

  private errorState: ErrorState

  constructor (errorState: ErrorState) {
    this.errorState = errorState
  }
}

export default (errorState?: ErrorState) => new DitchProxy(errorState || loadError('zh-cn'))