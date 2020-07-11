import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'
import { ResponseUserDocument } from '@/types/proxys/user'
import { oc } from 'ts-optchain'
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import { isYaml } from '@/utils'
import { filterUserLevel } from '~/middleware/auth'
import { UpdateSettingDocument } from '@/types/proto'

class ProtoFilter {

  public async updateSetting (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, tag } = req.params
    let { content } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    let filters = [
      {
        key     : 'content',
        rules   : [
          { required: true, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_REQUIRED, ['内容'], true) },
          { validator: isYaml, ...ErrorInfo(__ErrorCode.ERROR_VALID_NAME_FORMAT, ['内容', 'Yaml'], true)}
        ],
        value   : content
      }
    ] as Filter[]
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      let document = await asyncFilterData(filters) as UpdateSettingDocument
      document.file = `projects/${channel}/${tag}.yml`
      return next(document)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export default new ProtoFilter()