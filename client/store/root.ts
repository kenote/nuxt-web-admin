import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex'
import { RootState, Types } from './'
import { HTTPServer } from '@/types/nuxtServer'
import { compact, trim, fromPairs, get, isFunction } from 'lodash'
  
export interface State extends Record<string, any> {}

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {}

export interface Actions<S, R> extends ActionTree<S, R> {
  nuxtServerInit(context: ActionContext<S, R>, server: HTTPServer): void
}

export const mutations: MutationTree<State> = {}

export const actions: Actions<State, RootState> = {
  async nuxtServerInit ({ commit }, { req }) {
    let { site_url, dashboard, channels, metaInfo, editorConfig, account, getAuthInfo } = req.$__payload ?? {}
    commit(Types.setting.SITEURL, site_url)
    commit(Types.setting.DASHBOARD, dashboard)
    commit(Types.setting.CHANNELS, channels)
    commit(Types.setting.METAINFO, metaInfo)
    commit(Types.setting.EDITORCONFIG, editorConfig)
    commit(Types.setting.ACCOUNT, account)
    
    let jwtoken = getCookie('jwtoken', req.headers.cookie)
    if (!isFunction(getAuthInfo)) return
    try {
      let authInfo = await getAuthInfo(jwtoken)
      commit(Types.auth.AUTH, authInfo?.user)
    } catch (error) {
      console.log(error)
    }
  }
}

function getCookie (name: string, cookie?: string) {
  return get(fromPairs(compact((cookie ?? '').split(/\;/))
      .map(String)
      .map(trim)
      .map( s => s.split(/\=/) )), name)
}