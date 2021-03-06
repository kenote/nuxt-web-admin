import { FilterQuery, UpdateQuery } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { GroupDocument, CreateGroupDocument } from '@/types/services/db'
import { isArray, merge, cloneDeep } from 'lodash'
import Group from '~/models/group'
import { RemoveOptions } from '@/types/services/db/group'
import * as userDB from './user'

export const Dao = modelDao<GroupDocument>(models.Group, {

})

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
export function update (conditions: FilterQuery<Group>, doc: UpdateQuery<Group>) {
  let _doc = cloneDeep(doc) as unknown as Group
  if (doc.store) {
    _doc.store = merge({ download_type: [], upload_type: [] }, doc.store)
  }
  return Dao.updateMany(conditions, _doc)
}

/**
 * 删除用户组
 * @param conditions 
 */
export async function remove (conditions: FilterQuery<Group>, options?: RemoveOptions) {
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