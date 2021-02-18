import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from '~/store'

export const name = 'setting'

export const types = {
  SITEURL         : 'SITEURL'
}

export interface State {
  site_url       ?: string
}

export const namespaced: boolean = true

export const state: () => State = () => ({
  
})

export const getters: GetterTree<State, RootState> = {

}

export interface Actions<S, R> extends ActionTree<S, R> {

}

export const actions: Actions<State, RootState> = {

}

export const mutations: MutationTree<State> = {
  [types.SITEURL] (state, site_url: string) {
    state.site_url = site_url
  }
}