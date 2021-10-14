import { Context, NextHandler } from '@kenote/core'
import { loadConfig } from '@kenote/config'
import { AlicloudConfigure } from '@/types/config'
import ruleJudgment from 'rule-judgment'
import { filterData, formatData } from 'parse-string'
import { get, set } from 'lodash'
import { APIOptions, NextPayload } from '@/types/config/alicloud'

export async function request (ctx: Context, next: NextHandler) {
  let { nextError, httpError, ErrorCode, parseProps } = ctx.service
  let { endpoint, action } = ctx.params
  let { t } = ctx.query
  try {
    ctx.filterUserLevel(0, 9998)
    if (!t) {
      throw httpError(ErrorCode.ERROR_CUSTOMIZE_DATA, ['缺少 Tag 标记'])
    }
    let config = loadConfig<AlicloudConfigure>('config/alicloud', { mode: 'merge' })
    let accessKey = config.accessKeys.find (  ruleJudgment({ key: t }) )
    if (!accessKey) {
      throw httpError(ErrorCode.ERROR_CUSTOMIZE_DATA, ['AccessKey', `[${t}]`, '不存在'])
    }
    let sdk = config.sdks.find( ruleJudgment({ key: endpoint }) )
    if (!sdk) {
      throw httpError(ErrorCode.ERROR_CUSTOMIZE_DATA, ['Endpoint', `[${endpoint}]`, '不存在'])
    }
    let apiOptions = loadConfig<APIOptions>(`project/alicloud/api/${sdk.key}/${action}.yaml`, { mode: 'merge' })
    if (!apiOptions) {
      throw httpError(ErrorCode.ERROR_CUSTOMIZE_DATA, ['Action', `[${action}]`, '不存在'])
    }
    let result = filterData(apiOptions.filter)(ctx.body)
    let { props, sortOptions, resultProps } = apiOptions
    let payload = parseProps(props)(result)
    // 处理排序
    if (sortOptions) {
      let [ orderByKey, orderByType ] = get(payload, sortOptions.name, [])
      for (let item of sortOptions.fields) {
        let val = ''
        if (item.key === 'orderByKey') {
          val = orderByKey
        }
        else if (item.key === 'orderByType') {
          val = formatData(item.format ?? [])(orderByType)
        }
        set(payload, item.name, val)
      }
    }
    let nextPayload: NextPayload = {
      accessKey: t,
      sdk: endpoint,
      action,
      options: { resultProps },
      payload
    }
    ctx.payload = nextPayload
    return next()
  } catch (error) {
    nextError(error, ctx, next)
  }
}