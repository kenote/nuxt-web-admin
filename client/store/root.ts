import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'
import { HTTPServer } from '@/types/restful'
import * as setting from '~/store/modules/setting'
import { HeaderOptions } from '@/utils/http'
import * as auth from '~/store/modules/auth'
import * as api from '~/api'

export interface State extends Record<string, any> {}

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {}

export interface Actions<S, R> extends ActionTree<S, R> {
  nuxtServerInit(context: ActionContext<S, R>, server: HTTPServer): void
}

export const actions: Actions<State, RootState> = {
  async nuxtServerInit({ commit }, { req }) {
    commit(`${setting.name}/${setting.types.SETNAME}`, req.__name)
    commit(`${setting.name}/${setting.types.CHANNELS}`, req.__channels)
    //
    commit(`${setting.name}/${setting.types.REGISTER}`, req.__register)
    commit(`${setting.name}/${setting.types.SINGLEPAGES}`, req.__singlePages)
    commit(`${setting.name}/${setting.types.FLAGS}`, req.__flags)
    commit(`${setting.name}/${setting.types.DASHBOARD}`, req.__dashboard)
    commit(`${setting.name}/${setting.types.RTSPS}`, req.__rtsps)
    
    let token = req.cookies['token'] as string
    if (!token) return
    let options: HeaderOptions = {
      token
    }
    try {
      let result = await api.accesstoken(options, req.__proxyhost)
      if (result.error === 0) {
        commit(`${auth.name}/${auth.types.AUTH}`, result.data)
        return
      }
      console.warn(result.message)
    } catch (error) {
      console.error(error!.message)
    }
  }
}

export const mutations: MutationTree<State> = {}