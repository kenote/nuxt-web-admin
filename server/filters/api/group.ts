import { Context, NextHandler } from '@kenote/core'
import { CreateGroupDocument } from '@/types/services/db'
import { isArray, compact, pick, merge } from 'lodash'
import { filterData, FilterData } from 'parse-string'
import { loadConfig } from '@kenote/config'

export async function createGroup (ctx: Context, next: NextHandler) {
  let { nextError } = ctx.service
  let filters = loadConfig<Record<string, FilterData.options[]>>('config/filters/api/group', { mode: 'merge' })
  try {
    let result = filterData(filters.create)(ctx.body)
    let document = getGroupDocument(result)
    ctx.payload = document
    ctx.filterUserLevel(document.level, 9998)
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
  
}

function getGroupDocument (body: Record<string, any>): CreateGroupDocument {
  let { name, description, level, download_type, upload_type } = body
  let user: CreateGroupDocument = {
    name,
    description,
    level,
    store: {
      download_type,
      upload_type
    }
  }
  return user
}