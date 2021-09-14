import { FilterQuery, UpdateQuery, Model, Document } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { GroupDocument, CreateGroupDocument } from '@/types/services/db'
import { isArray, merge, cloneDeep } from 'lodash'
// import Group from '~/models/group'
import { RemoveOptions } from '@/types/services/db/group'
import * as userDB from './user'

export const Dao = modelDao<GroupDocument>(models.Group as unknown as Model<Document, {}>, {

})

/**
 * 获取基础用户组
 */
export const basicGroup = async () => await getGroup('min')

/**
 * 获取创建者用户组
 */
export const creatorGroup = async () => await getGroup('max')

/**
 * 获取最大/最小等级用户组
 * @param tag 
 */
async function getGroup (tag: 'min' | 'max') {
  let [ item ] = await models.Group.aggregate([
    { $group: {
        _id: { _id: '$_id', name: '$name', id: '$id', level: '$level', description: '$description', platform: '$platform', access: '$access', store: '$stroe' },
        [`level_${tag}`]: { [`$${tag}`]: '$level' }
      }
    },
    { $limit: 1 }
  ])
  return item?._id as GroupDocument
}

/**
 * 创建新用户组
 * @param docs 
 */
export function create (docs: CreateGroupDocument | CreateGroupDocument[]) {
  if (isArray(docs)) {
    let _docs = docs.map( doc => {
      doc.store = merge({ download_type: [], upload_type: [] }, doc.store)
      return doc
    })
    return Dao.create(_docs)
  }
  else {
    docs.store = merge({ download_type: [], upload_type: [] }, docs.store)
    return Dao.create(docs)
  }
}

/**
 * 更新用户组
 * @param conditions 
 * @param doc 
 */
export function update (conditions: FilterQuery<GroupDocument> | null, doc: UpdateQuery<GroupDocument>) {
  let _doc = cloneDeep(doc) as GroupDocument
  if (doc.store) {
    _doc.store = merge({ download_type: [], upload_type: [] }, doc.store)
  }
  return Dao.updateMany(conditions, _doc)
}

/**
 * 删除用户组
 * @param conditions 
 */
export async function remove (conditions: FilterQuery<GroupDocument>, options?: RemoveOptions) {
  let group = await Dao.findOne(conditions)
  if (group) {
    if (options?.move) {
      await userDB.Dao.updateMany({ group: group._id }, { group: options.move })
    }
    else {
      await userDB.remove({ group: group._id })
    }
  }
  return Dao.remove(conditions)
}