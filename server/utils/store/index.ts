import { Store, Connect, localProxy, StroeOptions } from 'kenote-store-helper'
import __ErrorCode from '~/utils/error/code'

// tslint:disable-next-line: interface-name
export interface IStroeOptions extends StroeOptions {
  key                : string
  download_auth     ?: true
}

@Connect({
  proxys: {
    local      : new localProxy()
  },
  errors: {
    mimetype   : __ErrorCode.ERROR_UPLOAD_FILE_MIMETYPE,
    limit      : __ErrorCode.ERROR_UPLOAD_FILESIZE_LARGEMAX
  }
})
export class FileStore extends Store {}

export const previewFile = {
  ['.png']               : 'image/png',
  ['.jpg']               : 'image/jpeg',
  ['.json']              : 'application/json',
  ['.htm']               : 'text/html'
}