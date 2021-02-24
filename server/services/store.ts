import { loadConfig } from '@kenote/config'
import { UploadStoreOptions, uploadStore, PutStreamFunction, putStream, PutStreamOptions, NextPutResult } from '@kenote/upload'
import { ErrorCode } from '.'
import { BaseInfo } from '@/types/config'
import { IncomingMessage } from 'http'

const errors: Record<'limit' | 'mimetype', number> = {
  limit     : ErrorCode.ERROR_UPLOAD_FILESIZE_LARGEMAX,
  mimetype  : ErrorCode.ERROR_UPLOAD_FILE_MIMETYPE
}


export const getOptions = (name: string = 'default') => {
  let stores = loadConfig<Record<string, UploadStoreOptions<BaseInfo>>>('config/store', { mode: 'merge' })
  
  for (let [key, val] of Object.entries(stores)) {
    stores[key].errors = errors
  }

  return stores[name ?? 'default']
}

export const store = (name: string) => (req: IncomingMessage) => {
  let options = getOptions(name)
  if (!options) {
    return null
  }
  return uploadStore(options, req)
}

export const putStreams: Record<string, PutStreamFunction> = {
  'local': putStream,
  'ali-oss': (stream: NodeJS.ReadStream, options: PutStreamOptions<{ key: string }>, done: NextPutResult) => {
    let { name, urlprefix, root_dir, ossOptions } = options
    // OSS 上传
  }
}

