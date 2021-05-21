import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex'
import { RootState, Types } from './'
import { HTTPServer } from '@/types/nuxtServer'
import { compact, trim, fromPairs, get } from 'lodash'
import { httpClient } from '@/utils/http-client'
import { UserDocument } from '@/types/services/db'
import { HttpClientOptions, HttpResult } from '@/types/client'
  
export interface State extends Record<string, any> {}

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {}

export interface Actions<S, R> extends ActionTree<S, R> {
  nuxtServerInit(context: ActionContext<S, R>, server: HTTPServer): void
}

export const mutations: MutationTree<State> = {}

export const actions: Actions<State, RootState> = {
  async nuxtServerInit ({ commit }, { req }) {
    let { site_url, baseHost, dashboard, channels, metaInfo, editorConfig } = req.$__payload ?? {}
    commit(Types.setting.SITEURL, site_url)
    commit(Types.setting.DASHBOARD, dashboard)
    commit(Types.setting.CHANNELS, channels)
    commit(Types.setting.METAINFO, metaInfo)
    commit(Types.setting.EDITORCONFIG, editorConfig)
    
    let jwtoken = getCookie('jwtoken', req.headers.cookie)
    try {
      let result = await httpClient({ token: jwtoken }).get<HttpResult<UserDocument>>(`${baseHost}/api/account/accesstoken`)
      if (result?.data) {
        commit(Types.auth.AUTH, result.data)
        return
      }
      console.warn(result?.error)
    } catch (error) {
      console.log(error.message)
    }
  }
}


function getCookie (name: string, cookie?: string) {
  return get(fromPairs(compact((cookie ?? '').split(/\;/))
      .map(String)
      .map(trim)
      .map( s => s.split(/\=/) )), name)
}