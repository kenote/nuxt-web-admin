import { Context, NextHandler } from '@kenote/core'
import { filterData, FilterData } from 'parse-string'
import { loadConfig } from '@kenote/config'
import { Account } from '@/types/account'
import { EditUserDocument, UserDocument } from '@/types/services/db'
import { intersection, map, pick } from 'lodash'

export async function login (ctx: Context, next: NextHandler) {
  let { nextError } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/account', { mode: 'merge' })
  try {
    let result = filterData(filters.login)(ctx.body)
    ctx.payload = result
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export async function loginSelect (ctx: Context, next: NextHandler) {
  let { nextError } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/account', { mode: 'merge' })
  try {
    let result = filterData(filters.loginSelect)(ctx.body) as Account.uuidResult<string>
    ctx.payload = result
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}

export function getUserDocument (body: EditUserDocument, auth: UserDocument) {
  let user: EditUserDocument = {}
  let payload = pick(body, ['avatar', 'nickname', 'sex', 'teams'])
  for (let [key, val] of Object.entries(payload)) {
    if (key === 'teams') {
      user[key] = intersection( map(auth.teams, '_id').map(String), val as string[] ?? [] )
    }
    else {
      user[key] = val
    }
  }
  return user
}