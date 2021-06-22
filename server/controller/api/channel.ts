import { Controller, Get, Post, Put, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import { loadConfig } from '@kenote/config'
import { Channel } from '@/types/client'
import { pick } from 'lodash'
import { AccountConfigure } from '@/types/config/account'
import ruleJudgment from 'rule-judgment'

@Controller('/channel')
export default class ChannelController {

  @Post('/:type(list|node)', { filters: [ ...authenticate ] })
  async list (ctx: Context, next: NextHandler) {
    let { ErrorCode, httpError, nextError, db } = ctx.service
    let { type } = ctx.params
    let channels = loadConfig<Channel.DataNode[]>('config/channels', { type: 'array' })
    let { platform } = loadConfig<AccountConfigure>('config/account', { mode: 'merge' })
    try {
      let result = channels.filter(ruleJudgment({ label: { $nin: platform }}))
      if (type === 'list') {
        return ctx.api(result.map( item => ({ key: item.label, name: item.name })))
      }
      return ctx.api(result.filter(ruleJudgment({ label: { $in: ctx.body?.platform ?? [] }})))
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}