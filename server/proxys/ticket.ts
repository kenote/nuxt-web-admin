import { QueryOptions, MongooseDao, autoNumber } from 'kenote-mongoose-helper'
import __Models from '~/models'
import __ErrorCode from '~/utils/error/code'
import { loadError, ErrorState } from '~/utils/error'
import { TicketOptions, ResponseTicketDocument } from '@/types/proxys/ticket'
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import { format } from 'util'
import * as PassportAPI from '@/types/apis/passport'

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

  public async valid (cdkey: string, options: TicketOptions): Promise<ResponseTicketDocument> {
    let { ErrorInfo } = this.errorState
    let filters = [
      {
        key: options.key,
        rules: [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_TICKET_REQUIRED, [ options.name ], true) }
        ],
        value: cdkey
      }
    ] as Filter[]
    let data = await asyncFilterData(filters) as PassportAPI.ticket
    let ticket = await this.Dao.findOne({ cdkey: data.cdkey, type: options.type }) as ResponseTicketDocument
    if (!ticket) {
      throw ErrorInfo(__ErrorCode.ERROR_VALID_TICKET_NULL, [ options.name ])
    }
    let { last_at, used } = ticket
    if (last_at.getTime() <= Date.now()) {
      throw ErrorInfo(__ErrorCode.ERROR_VALID_TICKET_EXPIRED, [ options.name ])
    }
    if (used) {
      throw ErrorInfo(__ErrorCode.ERROR_VALID_TICKET_USED, [ options.name ])
    }
    return ticket
  }
}

export default (errorState?: ErrorState) => new TicketProxy(errorState || loadError('zh-cn'))