import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { getAlicloundSetting } from '~/utils/alicloud'
import __ErrorCode from '~/utils/error/code'
import Alicloud from '@/types/alicloud'

class AlicloudFilter {

  public async send (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { endpoint, action } = req.params
    let { t } = req.query
    let { accessKeys, apis } = getAlicloundSetting()
    let api = apis.find( o => o.key === endpoint )
    if (!api) {
      return res.api(null, __ErrorCode.ERROR_NOT_FOUND_API)
    }
    let accessKey = accessKeys.find( o => o.key === t )
    if (!accessKey) {
      return res.api(null, __ErrorCode.ERROR_NOT_FOUND_ACCESSKEY, [ t as string ])
    }
    let document: Alicloud.document = {
      config: {
        accessKeyId       : accessKey.options.accessKeyId,
        accessKeySecret   : accessKey.options.secretAccessKey,
        endpoint          : api.endpoint,
        apiVersion        : api.apiVersion
      },
      action,
      params: req.body
    }
    return next(document)
  }
}

export default new AlicloudFilter()