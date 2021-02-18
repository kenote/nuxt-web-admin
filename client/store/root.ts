import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex'
import { RootState, Types } from './'
import { HTTPServer } from '@/types/nuxtServer'
 
export interface State extends Record<string, any> {}

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {}

export interface Actions<S, R> extends ActionTree<S, R> {
  nuxtServerInit(context: ActionContext<S, R>, server: HTTPServer): void
}

export const mutations: MutationTree<State> = {}

export const actions: Actions<State, RootState> = {
  async nuxtServerInit ({ commit }, { req }) {
    let { site_url } = req.$__payload ?? {}
    commit(Types.setting.SITEURL, site_url)
  }
}
