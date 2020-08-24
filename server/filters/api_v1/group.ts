import { Request, Response, NextFunction } from 'express'
import { IResponse } from '~/middleware/restful'
import { Maps } from 'kenote-config-helper'
import { CreateGroupDocument, EditGroupDocument, ResponseGroupDocument } from '@/types/proxys/group'
import { oc } from 'ts-optchain'
import { filterUserLevel } from '~/middleware/auth'
import { loadError } from '~/utils/error'
import __ErrorCode from '~/utils/error/code'
import { language } from '~/config'
import { ResponseUserDocument } from '@/types/proxys/user'
import { CreateStoreDocument } from '@/types/proxys/store'
import validator from 'validator'
import { UpdateDocument, RemoveOptions, QueryDocument } from '@/types/proxys'
import groupProxy from '~/proxys/group'

class GroupFilter {

  public async create (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let document =  getGroupDocument(req.body)
    let lang = oc(req).query.lang('') as string || language
    let { ErrorInfo, CustomError } = loadError(lang)
    let auth = req.user as ResponseUserDocument
    try {
      filterUserLevel(auth, oc(req).body.level(0), 9998, ErrorInfo)
      return next(document)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async edit (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    if (!validator.isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let auth = req.user as ResponseUserDocument
    let doc: UpdateDocument<EditGroupDocument> = {
      conditions: { _id },
      data: getGroupDocument(req.body)
    }
    let GroupProxy = groupProxy(errorState)
    try {
      let group = await GroupProxy.Dao.findOne(doc.conditions) as ResponseGroupDocument
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
      }
      filterUserLevel(auth, group.level, 9998, ErrorInfo)
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async remove (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { move } = req.body
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    if (!validator.isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let auth = req.user as ResponseUserDocument
    let doc: QueryDocument<RemoveOptions> = {
      conditions: { _id },
      options: { move }
    }
    let GroupProxy = groupProxy(errorState)
    try {
      let group = await GroupProxy.Dao.findOne(doc.conditions) as ResponseGroupDocument
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
      }
      filterUserLevel(auth, group.level, 9998, ErrorInfo)
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async authority (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id, authority } = req.params
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    let { ErrorInfo, CustomError } = errorState
    if (!validator.isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let auth = req.user as ResponseUserDocument
    let doc: UpdateDocument<EditGroupDocument> = {
      conditions: { _id },
      data: {
        [authority]: oc(req).body[authority]([])
      }
    }
    let GroupProxy = groupProxy(errorState)
    try {
      let group = await GroupProxy.Dao.findOne(doc.conditions) as ResponseGroupDocument
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
      }
      filterUserLevel(auth, group.level, 9998, ErrorInfo)
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export default new GroupFilter()

function getGroupDocument (body: any): CreateGroupDocument {
  let name = String(body.name || '')
  let level = Number(body.level || 0)
  let description = String(body.description || '')
  let download_type: string | string[] = oc(body).download_type([])
  let upload_type: string | string[] = oc(body).upload_type([])
  let store: CreateStoreDocument = {
    download_type: Array.isArray(download_type) ? download_type : (download_type || '').split(','),
    upload_type: Array.isArray(upload_type) ? upload_type : (upload_type || '').split(',')
  }
  let payload: CreateGroupDocument = { name, level, description, store }
  return payload
}