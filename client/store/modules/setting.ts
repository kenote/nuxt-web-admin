import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from '~/store'
import { Channel } from '@/types/channel'
import { Register, SinglePage, PageFlag, DashboardOptions } from '@/types/restful'
import { Maps } from 'kenote-config-helper'
import { orderBy } from 'lodash'
import { oc } from 'ts-optchain'
import { MetaPropertyCharset, MetaPropertyEquiv, MetaPropertyName, MetaPropertyMicrodata, MetaPropertyProperty } from 'vue-meta'

export const name: string = 'setting'

export const types = {
  SETNAME          : 'SETNAME',
  SELECTCHANNEL    : 'SELECTCHANNEL',
  CHANNELS         : 'CHANNELS',
  //
  REGISTER         : 'REGISTER',
  SINGLEPAGES      : 'SINGLEPAGES',
  FLAGS            : 'FLAGS',
  LOADING          : 'LOADING',
  DASHBOARD        : 'DASHBOARD',
  RTSPS            : 'RTSPS',
  METAS            : 'METAS'
}

export interface State {
  name            ?: string
  channelId        : number
  channels         : Channel.element[]
  //
  register        ?: Register.config
  singlepages     ?: SinglePage.item[]
  flags            : Maps<PageFlag.item>
  loading          : Maps<boolean>
  dashboardOpts    : DashboardOptions
  rtsps            : Maps<string[]>
  metas           ?: Array<MetaPropertyCharset | MetaPropertyEquiv | MetaPropertyName | MetaPropertyMicrodata | MetaPropertyProperty>
}

export const namespaced: boolean = true

export const state = (): State => ({
  name             : undefined,
  channelId        : 1,
  channels         : [],
  flags            : {},
  loading          : { channel: false },
  dashboardOpts    : { disableMode: 'disable' },
  rtsps            : {}
})

export const getters: GetterTree<State, RootState> = {
  selectedChannel: state => {
    let p = state.channels?.find( o => o.id === state.channelId )
    return p || { id: 0, name: '仪表盘' }
  },
  projectChannels: state => orderBy(state.channels?.filter( o => o.id > 1000 && o.id < 2000 )!, ['id'], ['asc']),
  rtsps: state => {
    let p = state.channels?.find( o => o.id === state.channelId )
    return p ? oc(state).rtsps[p.label]([]) : []
  }
}

export interface Actions<S, R> extends ActionTree<S, R> {
  selectChannel(context: ActionContext<S, R>, channelId: number): Promise<void>
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
  [types.SETNAME] (state: State, name: string): void {
    state.name = name
  },
  [types.SELECTCHANNEL] (state: State, channelId: number): void {
    state.channelId = channelId
    state.loading.channel = false
  },
  [types.CHANNELS] (state: State, channels: Channel.element[]): void {
    state.channels = channels
  },
  //
  [types.REGISTER] (state: State, register: Register.config): void {
    state.register = register
  },
  [types.SINGLEPAGES] (state: State, singlepages: SinglePage.item[]): void {
    state.singlepages = singlepages
  },
  [types.FLAGS] (state: State, flags: Maps<PageFlag.item>): void {
    state.flags = flags
  },
  [types.LOADING] (state: State, key: string): void {
    state.loading[key] = true
  },
  [types.DASHBOARD] (state: State, options: DashboardOptions): void {
    state.dashboardOpts = options
  },
  [types.RTSPS] (state: State, rtsps: Maps<string[]>): void {
    state.rtsps = rtsps
  },
  [types.METAS] (state: State, metas?: Array<MetaPropertyCharset | MetaPropertyEquiv | MetaPropertyName | MetaPropertyMicrodata | MetaPropertyProperty>): void {
    state.metas = metas
  }
}