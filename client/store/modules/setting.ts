import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from '~/store'
import { Channel } from '@/types/channel'
import { Register, SinglePage } from '@/types/restful'

export const name: string = 'setting'

export const types = {
  SETNAME          : 'SETNAME',
  SELECTCHANNEL    : 'SELECTCHANNEL',
  CHANNELS         : 'CHANNELS',
  //
  REGISTER         : 'REGISTER',
  SINGLEPAGES      : 'SINGLEPAGES'
}

export interface State {
  name            ?: string
  channelId        : number
  channels         : Channel.element[]
  //
  register        ?: Register.config
  singlepages     ?: SinglePage.item[]
}

export const namespaced: boolean = true

export const state = (): State => ({
  name             : undefined,
  channelId        : 1,
  channels         : []
})

export const getters: GetterTree<State, RootState> = {
  selectedChannel: state => {
    let p: Channel.element = state.channels?.find( o => o.id === state.channelId )!
    return p
  },
}

export interface Actions<S, R> extends ActionTree<S, R> {
  selectChannel(context: ActionContext<S, R>, channelId: number): void
}

export const actions: Actions<State, RootState> = {
  selectChannel ({ commit }, channelId) {
    commit(types.SELECTCHANNEL, channelId)
  }
}

export const mutations: MutationTree<State> = {
  [types.SETNAME] (state: State, name: string): void {
    state.name = name
  },
  [types.SELECTCHANNEL] (state: State, channelId: number): void {
    state.channelId = channelId
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
  }
}