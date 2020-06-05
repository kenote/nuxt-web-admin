import { QueryOptions, MongooseDao, autoNumber } from 'kenote-mongoose-helper'
import __Models from '~/models'
import { loadError, ErrorState } from '~/utils/error'

const Model = __Models.ticketModel
const options: QueryOptions = {
  name: 'ticket'
}

@autoNumber({})
class TicketDao extends MongooseDao {}

class TicketProxy {

  public Dao = new TicketDao(Model, options)

  private errorState: ErrorState

  constructor (errorState: ErrorState) {
    this.errorState = errorState
  }
}

export default (errorState?: ErrorState) => new TicketProxy(errorState || loadError('zh-cn'))