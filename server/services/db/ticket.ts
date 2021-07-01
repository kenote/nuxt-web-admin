import { FilterQuery, UpdateQuery } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { TicketDocument, CreateTicketDocument, TicketOptions } from '@/types/services/db'
import uuid from 'uuid'
import { merge, pick } from 'lodash'
import { filterData, FilterData } from 'parse-string'
import { ErrorCode, httpError, ErrorMessage } from '~/services/error'

export const Dao = modelDao<TicketDocument>(models.Ticket, {
  
})

/**
 * 创建票据
 * @param doc 
 */
export async function create (doc: CreateTicketDocument) {
  let cdkey = uuid.v4()
  let ticket = await Dao.create(merge(doc, { cdkey }))
  return ticket
}

/**
 * 验证票据
 * @param cdkey 
 * @param options 
 */
export async function valid (cdkey: string, options: TicketOptions) {
  let { name, type } = options
  let filter = [
    {
      key: 'cdkey',
      rules: [
        { required: true, ...pick(httpError(ErrorCode.ERROR_VALID_TICKET_REQUIRED, [ name ]), ['code', 'message']) },
      ]
    }
  ] as FilterData.options[]
  let data = filterData(filter)({ cdkey })
  let ticket = await Dao.findOne(merge(data, { type }))
  if (!ticket) {
    throw httpError(ErrorCode.ERROR_VALID_TICKET_NULL, [ name ])
  }
  let { last_at, used } = ticket
  console.log(ticket.last_at)
  if (last_at.getTime() <= Date.now()) {
    throw httpError(ErrorCode.ERROR_VALID_TICKET_EXPIRED, [ name ])
  }
  if (used) {
    throw httpError(ErrorCode.ERROR_VALID_TICKET_USED, [ name ])
  }
  return ticket
}