import { Model, Document, FilterQuery, QueryOptions } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { PlanDocument, NotificationDocument } from '@/types/services/db'

export const Dao = modelDao<PlanDocument>(models.Plan as unknown as Model<Document, {}>, {
  populate: {
    path: 'user',
    select: [ 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex' ]
  }
})

export const find = (conditions?: FilterQuery<NotificationDocument> | null, options?: QueryOptions) => Dao.find(conditions, options)