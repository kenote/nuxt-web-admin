
import { Request, Response, NextFunction } from 'express'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { oc } from 'ts-optchain'
import { IResponse } from '~/middleware/restful'
import { authPayload } from '~/middleware/auth'
import { IStroeOptions } from '~/utils/store'
import userProxy from '~/proxys/user'
import { loadError } from '~/utils/error'
import { language } from '~/config'
import { ResponseUserDocument } from '@/types/proxys/user'

class StoreFilter {

  public async setting (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let stores = loadData('config/store') as Record<string, IStroeOptions>
    let store = stores[type || 'default']
    if (!store) {
      return res.notfound()
    }
    store.key = type || 'default'
    return next(store)
  }

  public async upload (options: IStroeOptions, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let user = req.user as ResponseUserDocument
    let { level, store } = user.group
    if (level < 9000 && !store.upload_type.includes(options.key)) {
      return res.status(401).send('Unauthorized')
    }
    if (options.user_dir) {
      options.root_dir = `${options.root_dir}/${user._id}`
    }
    return next(options)
  }

  public async download (options: IStroeOptions, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { download_auth } = options
    let lang = oc(req).query.lang('') as string || language
    let errorState = loadError(lang)
    if (download_auth) {
      let jwToken = oc(req).headers.authorization('').replace(/^(Bearer)\s{1}/, '')
      try {
        let payload = authPayload(jwToken)
        let user = await userProxy(errorState).Dao.findOne({ _id: payload._id, jw_token: jwToken }) as ResponseUserDocument
        if (!user) {
          return res.status(401).send('Unauthorized')
        }
        let { level, store } = user.group
        if (level < 9000 && !store.download_type.includes(options.key)) {
          return res.status(401).send('Unauthorized')
        }
      } catch (error) {
        return res.status(401).send('Unauthorized')
      }
    }
    return next(options)
  }
}

export default new StoreFilter()