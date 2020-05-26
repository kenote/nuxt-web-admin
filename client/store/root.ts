import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'
import { HTTPServer } from '@/types/restful'
import * as setting from '~/store/modules/setting'

export interface State extends Record<string, any> {}

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {}

export interface Actions<S, R> extends ActionTree<S, R> {
  nuxtServerInit(context: ActionContext<S, R>, server: HTTPServer): void
}

export const actions: Actions<State, RootState> = {
  nuxtServerInit({ commit }, { req }) {
    commit(`${setting.name}/${setting.types.SETNAME}`, req.__name)
    commit(`${setting.name}/${setting.types.CHANNELS}`, req.__channels)
  }
}

export const mutations: MutationTree<State> = {}