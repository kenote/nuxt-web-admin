import { FilterQuery, Model, Document, QueryOptions } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { NotificationDocument, AccoutNotificationDocument } from '@/types/services/db'
import * as userDB from './user'
import { map, pick } from 'lodash'

export const Dao = modelDao<NotificationDocument>(models.Notification as unknown as Model<Document, {}>, {
  populate: [
    {
      path: 'receiver',
      select: [ 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams' ],
      model: models.User
    }
  ]
})

/**
 * 获取接收用户
 * @param _id 
 */
export async function receiver (_id: string) {
  let notification = await Dao.findOne({ _id })
  if (!notification) return []
  
  let result = await userDB.Dao.find({ _id: { $in: map(notification.receiver ?? [], '_id') } }, {
    select: [ 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams' ]
  })
  return result
}

export const find = (conditions?: FilterQuery<NotificationDocument> | null, options?: QueryOptions) => Dao.find(conditions, options)
export const counts = (conditions?: FilterQuery<NotificationDocument> | null) => Dao.counts(conditions)

/**
 * 格式化消息通知
 * @param data 
 * @param ctx 
 * @param detail 
 */
export function formatAccoutNotification (data: NotificationDocument, userId: string, detail: string[] = []) {
  if (!data) return null
  let info = pick(data, ['_id', 'id', 'title', 'type', 'update_at', ...detail]) as AccoutNotificationDocument
  info.readed = data.readed.includes(userId)
  return info
}