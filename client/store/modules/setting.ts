import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from '~/store'
import { NavMenu, Channel } from '@/types/client'
import ruleJudgment from 'rule-judgment'
import { MetaInfo } from 'vue-meta'

export const name = 'setting'

export const types = {
  SITEURL         : 'SITEURL',
  DASHBOARD       : 'DASHBOARD',
  CHANNELS        : 'CHANNELS',
  SELECTCHANNEL   : 'SELECTCHANNEL',
  LOADING         : 'LOADING',
  METAINFO        : 'METAINFO'
}

export interface State {
  site_url       ?: string
  dashboard       : NavMenu.Configure
  channels        : Channel.DataNode[]
  loading         : Record<string, boolean>
  channelId      ?: string | null
  metaInfo       ?: MetaInfo
}

export const namespaced: boolean = true

export const state: () => State = () => ({
  dashboard: {
    navmenu: [],
    authpanel: {}
  },
  channels: [],
  loading: { channel: false },
  channelId: '0'
})

export const getters: GetterTree<State, RootState> = {
  selectedChannel: state => {
    return state.channels.find( ruleJudgment({ key: state.channelId })) ?? {}
  }
}

export interface Actions<S, R> extends ActionTree<S, R> {
  selectChannel(context: ActionContext<S, R>, channelId?: string | null): Promise<void>
}

export const actions: Actions<State, RootState> = {
  async selectChannel ({ commit }, channelId) {
    commit(types.LOADING, 'channel')
    setTimeout(() => {
      commit(types.SELECTCHANNEL, channelId)
      Promise.resolve(null)
    }, 300)
  }
}

export const mutations: MutationTree<State> = {
  [types.SITEURL] (state, site_url: string) {
    state.site_url = site_url
  },
  [types.DASHBOARD] (state, dashboard: NavMenu.Configure) {
    state.dashboard = dashboard
  },
  [types.CHANNELS] (state, channels: Channel.DataNode[]) {
    state.channels = channels
  },
  [types.LOADING] (state: State, key: string) {
    state.loading[key] = true
    if (key === 'channel') {
      state.channelId = '0'
    }
  },
  [types.SELECTCHANNEL] (state: State, channelId?: string | null) {
    state.channelId = channelId
    state.loading.channel = false
  },
  [types.METAINFO] (state: State, metaInfo?: MetaInfo) {
    state.metaInfo = metaInfo
  }
}