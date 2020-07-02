import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { PageInfo } from '@/types/restful'
import { toPageInfo } from '~/utils'
import { FindUserType } from '@/types/proxys/user'
import { userBaseField } from '~/proxys/user'
import { oc } from 'ts-optchain'
import { QueryDocument } from '@/types/proxys'
import { QueryOptions } from 'kenote-mongoose-helper'

class UserFilter {

  public async getlist (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { page, limit, skip } = toPageInfo(req.body.page, req.body.size || 15)
    let { create_at, groups, findname, sort } = req.body
    let conditions: any = {}
    if (findname) {
      let findtype = oc(req).body.findtype('username') as FindUserType
      conditions[findtype] = new RegExp(findname)
    }
    if (Array.isArray(groups) && groups.length > 0) {
      conditions.group = { $in: groups }
    }
    if (Array.isArray(create_at)) {
      let [ begin, end ] = create_at
      if (begin && end) {
        conditions.create_at = { $gte: begin, $lt: end }
      }
    }
    let findDocument: QueryDocument<QueryOptions> = {
      conditions,
      options: {
        limit,
        skip,
        select: userBaseField
      }
    }
    let [ prop, order ] = oc(Array.isArray(sort) ? sort : [ sort ])([])
    if (order) {
      findDocument.options.sort = { [prop]: /^(desc)/.test(order) ? -1 : 0 }
    }
    return next(findDocument)
  }
}

export default new UserFilter()