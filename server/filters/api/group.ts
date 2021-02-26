import { Context, NextHandler } from '@kenote/core'
import { CreateGroupDocument } from '@/types/services/db'
import { isArray, compact } from 'lodash'

export async function createGroup (ctx: Context, next: NextHandler) {
  let { ErrorCode, httpError, nextError } = ctx.service
  let document = getGroupDocument(ctx.body)
  ctx.payload = document
  return next()
}

function getGroupDocument (body: Record<string, any>): CreateGroupDocument {
  let { name, description, level, download_type, upload_type } = body
  let user: CreateGroupDocument = {
    name: String(name ?? ''),
    description: String(description ?? ''),
    level: Number(level ?? 0),
    store: {
      download_type: compact(isArray(download_type) ? download_type : String(download_type ?? '').split(',')),
      upload_type: compact(isArray(upload_type) ? upload_type : String(upload_type ?? '').split(','))
    }
  }
  return user
}