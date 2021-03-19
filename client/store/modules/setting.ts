import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from '~/store'
import { NavMenu } from '@/types/client'

export const name = 'setting'

export const types = {
  SITEURL         : 'SITEURL',
  DASHBOARD       : 'DASHBOARD'
}

export interface State {
  site_url       ?: string
  dashboard       : NavMenu.Configure
}

export const namespaced: boolean = true

export const state: () => State = () => ({
  dashboard: {
    navmenu: [],
    authpanel: {}
  }
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
  },
  [types.DASHBOARD] (state, dashboard: NavMenu.Configure) {
    state.dashboard = dashboard
  }
}