import { Model, Document } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { OplogDocument, Oplog } from '@/types/services/db'
import { Context } from '@kenote/core'
import { APIConfigure } from '@/types/config'
import { getAPIInfo } from '~/services'

export const Dao = modelDao<OplogDocument>(models.Oplog as unknown as Model<Document, {}>, {
  populate: {
    path: 'user',
    select: [ 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex' ]
  }
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