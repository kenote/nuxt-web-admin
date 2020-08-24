import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'
import { ResponseUserDocument } from '@/types/proxys/user'
import { oc } from 'ts-optchain'
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import { filterUserLevel } from '~/middleware/auth'
import { isYaml } from '@/utils'
import { UpdateDithsDocument, DitchGrouping } from '@/types/proxys/ditch'
import validator from 'validator'

class DitchFilter {

  public async getlist (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    console.log(req.params)
    let auth = req.user as ResponseUserDocument
    let conditions: any = {
      channel
    }
    if (auth.group.level < 9000) {
      conditions.teams = {
        $elemMatch: { $in: auth.teams }
      }
    }
    return next(conditions)
  }

  public async update (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
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
      let document = await asyncFilterData(filters) as UpdateDithsDocument
      document.channel = channel
      return next(document)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async allot (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let { team, ditchs } = req.body
    if (!validator.isMongoId(team)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      return next({ channel, team, ditchs })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async addGrouping (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let { key, name, ditchs } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    let auth = req.user as ResponseUserDocument
    try {
      filterUserLevel(auth, 0, 9000, ErrorInfo)
      let document: DitchGrouping = { key, name, ditchs }
      return next({ channel, document })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export default new DitchFilter()