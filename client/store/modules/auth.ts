import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from '~/store'
import { UserDocument } from '@/types/services/db'

export const name = 'auth'

export const types = {
  AUTH            : 'AUTH',
  TIMESTAMP       : 'TIMESTAMP'
}

export interface State {
  auth            : UserDocument | null
  timestamp       : number
}

export const namespaced: boolean = true

export const state: () => State = () => ({
  auth            : null,
  timestamp       : 0
})

export const getters: GetterTree<State, RootState> = {
  token: state => state.auth?.jw_token,
  level: state => state.auth?.group.level ?? 0
}

export interface Actions<S, R> extends ActionTree<S, R> {

}

export const actions: Actions<State, RootState> = {

}

export const mutations: MutationTree<State> = {
  [types.AUTH] (state, auth: UserDocument | null) {
    state.auth = auth
    state.timestamp = Date.now()
  },
  [types.TIMESTAMP] (state) {
    state.timestamp = Date.now()
  }
}