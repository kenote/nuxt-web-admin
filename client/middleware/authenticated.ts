import { Context } from '@nuxt/types'
import { get } from 'lodash'
import { getChannelKey, dataNodeProxy } from '@kenote/common'
import ruleJudgment from 'rule-judgment'
import { isFilter } from '@/utils'
import { Channel } from '@/types/client'

export default async (context: Context) => {
  // 使用 context
  let { store, redirect, route, error } = context
  let auth = get(store.state, 'auth.auth')
  if (!auth) {
    return redirect('/login', { url_callback: route.path })
  }
  let channels = get(store.state, 'setting.channels') as Channel.DataNode[]
  let channelId = getChannelKey(channels, route.path, 'route')
  if (!channelId) {
    error({ statusCode: 404 })
  }
  let channel = channels.find( ruleJudgment({ key: channelId }))
  if (channel) {
    if (
      !ruleJudgment({ $where: item => isFilter(item.conditions, { auth })})(channel)
    ) {
      error({ statusCode: 404 })
    }
    let page = dataNodeProxy<Channel.DataNode>(channel.children ?? []).find({ route: route.path })
    if (page) {
      if (
        !ruleJudgment({ $where: item => isFilter(item.conditions, { auth })})(page)
      ) {
        error({ statusCode: 404 })
      }
    }
  }
}