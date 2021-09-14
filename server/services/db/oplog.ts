import { FilterQuery, UpdateQuery, Model, Document } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { OplogDocument, CreateOplogDocument, Oplog } from '@/types/services/db'
import uuid from 'uuid'
import { merge, pick } from 'lodash'
import { filterData, FilterData } from 'parse-string'
import { ErrorCode, httpError, ErrorMessage } from '~/services/error'
import { Context, NextHandler } from '@kenote/core'
import { APIConfigure } from '@/types/config'
import { getAPIInfo } from '~/services'

export const Dao = modelDao<OplogDocument>(models.Oplog as unknown as Model<Document, {}>, {
  
})


export async function create (response: Oplog.Response, node: APIConfigure.NodeItem, ctx: Context) {
  await Dao.create({
    type: node.type,
    content: node.name,
    ip: ctx.clientIP,
    api: getAPIInfo(response, ctx),
    user: ctx.user?._id
  })
}