import { Controller, Context, NextHandler, Post } from '@kenote/core'
import * as filter from '~/filters/api'
import { get, set } from 'lodash'
import { NextPayload } from '@/types/config/alicloud'
import { authenticate } from '~/plugins/passport'

@Controller('alicloud')
export default class AlicloudController {
  
  @Post('/:endpoint/:action', { filters: [ ...authenticate, filter.alicloud.request ] })
  async request (ctx: Context, next: NextHandler) {
    let { nextError, alicloud } = ctx.service
    let { accessKey, sdk, action, payload, options } = ctx.payload as NextPayload
    try {
      let result = await alicloud.request(action, { ...payload })({ accessKey, sdk })
      // 解析数据
      let { resultProps } = options
      if (resultProps) {
        let info = {}
        for (let [key, val] of Object.entries(resultProps)) {
          set(info, key, get(result, val as any))
        }
        result = info
      }
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}