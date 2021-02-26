import { FilterQuery, UpdateQuery } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { TeamDocument, CreateTeamDocument } from '@/types/services/db'
import { isArray, merge, cloneDeep } from 'lodash'
import Team from '~/models/team'

export const Dao = modelDao<TeamDocument>(models.Team, {
  
})

/**
 * 删除团队
 * @param conditions 
 */
export function remove (conditions: FilterQuery<Team>) {
  // 先移除团队用户
  let { _id } = conditions
  return Dao.remove(conditions)
}