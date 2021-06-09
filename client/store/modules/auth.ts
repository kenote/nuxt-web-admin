import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from '~/store'
import { UserDocument } from '@/types/services/db'

export const name = 'auth'

export const types = {
  AUTH            : 'AUTH',
  TIMESTAMP       : 'TIMESTAMP',
  AVATAR          : 'AVATAR',
  EMAIL           : 'EMAIL',
  MOBILE          : 'MOBILE',
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
  },
  [types.AVATAR] (state: State, avatar: string) {
    if (!state.auth) return
    state.auth.avatar = avatar
    state.timestamp = Date.now() 
  },
  [types.EMAIL] (state: State, email: string) {
    if (!state.auth) return
    state.auth.email = email
    state.auth.binds = Array.from(new Set([ ...state.auth.binds, 'email' ]))
    state.timestamp = Date.now() 
  },
  [types.MOBILE] (state: State, mobile: string) {
    if (!state.auth) return
    state.auth.mobile = mobile
    state.auth.binds = Array.from(new Set([ ...state.auth.binds, 'mobile' ]))
    state.timestamp = Date.now() 
  }
}