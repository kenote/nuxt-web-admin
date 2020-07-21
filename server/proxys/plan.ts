import { QueryOptions, MongooseDao, autoNumber } from 'kenote-mongoose-helper'
import __Models from '~/models'
import { loadError, ErrorState } from '~/utils/error'
import { userBaseField } from './user'

const Model = __Models.planModel
const options: QueryOptions = {
  name: 'plan',
  populate: {
    path: 'user',
    select: userBaseField
  }
}

@autoNumber({})
class PlanDao extends MongooseDao {}

class PlanProxy {

  public Dao = new PlanDao(Model, options)

  private errorState: ErrorState

  constructor (errorState: ErrorState) {
    this.errorState = errorState
  }
}

export default (errorState?: ErrorState) => new PlanProxy(errorState || loadError('zh-cn'))