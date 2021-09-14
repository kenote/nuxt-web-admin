import { FilterQuery, UpdateQuery, Model, Document } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { TeamDocument, CreateTeamDocument } from '@/types/services/db'
import { isArray, merge, cloneDeep } from 'lodash'
import Team from '~/models/team'
import * as userDB from './user'

export const Dao = modelDao<TeamDocument>(models.Team as unknown as Model<Document, {}>, {
  populate: [
    {
      path: 'owner',
      select: [ 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams' ],
      model: models.User,
      populate: [
        {
          path: 'teams',
          select: [ 'id', 'name', 'description' ]
        }
      ]
    }
  ]
})

/**
 * 获取团队成员
 * @param _id 
 */
export async function peoples (_id: string) {
  let team = await Dao.findOne({ _id })
  let result = await userDB.Dao.find({ teams: _id }, {
    select: [ 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams' ]
  })
  let users = JSON.parse(JSON.stringify(result))
  // tslint:disable-next-line: prefer-for-of
  for (let i:number = 0; i < users.length; i++) {
    users[i].owner = users[i]._id == team?.owner?._id
  }
  return users
}

/**
 * 删除团队
 * @param conditions 
 */
export function remove (conditions: FilterQuery<TeamDocument>) {
  // 先移除团队用户
  let { _id } = conditions
  return Dao.remove(conditions)
}