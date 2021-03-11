import { FilterQuery, UpdateQuery } from 'mongoose'
import { modelDao } from '@kenote/mongoose'
import { models } from '~/models'
import { VerifyDocument, CreateVerifyDocument } from '@/types/services/db'
import { isArray, merge, cloneDeep } from 'lodash'
import Verify from '~/models/verify'
import uuid from 'uuid'

export const Dao = modelDao<VerifyDocument>(models.Verify, {
  populate: {
    path: 'user',
    select: [ 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'binds', 'group', 'teams', 'access', 'create_at', 'update_at', 'jw_token' ]
  }
})

export async function create (doc: CreateVerifyDocument) {
  if (doc.type === 'email') {
    doc.token = uuid.v4().replace(/\-/g, '')
  }
  else {
    doc.token = Math.random().toFixed(6).replace(/^(0\.)/i, '')
  }
  let result = await Dao.create(doc)
  return result
}