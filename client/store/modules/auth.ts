import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { RootState } from '~/store'
import { ResponseUserDocument } from '@/types/proxys/user'
import { oc } from 'ts-optchain'

export const name: string = 'auth'

export const types = {
  AUTH             : 'AUTH',
  EMAIL            : 'EMAIL',
  MOBILE           : 'MOBILE'
}

export interface State {
  auth             : ResponseUserDocument | null
}

export const namespaced: boolean = true

export const state = (): State => ({
  auth             : null
})

export const getters: GetterTree<State, RootState> = {
  token: state => oc(state).auth.jw_token(),
  authLevel: state => oc(state).auth.group.level()
}

export interface Actions<S, R> extends ActionTree<S, R> {
  
}

export const actions: Actions<State, RootState> = {
  
}

export const mutations: MutationTree<State> = {
  [types.AUTH] (state: State, user: ResponseUserDocument | null): void {
    state.auth = user
  },
  [types.EMAIL] (state: State, email: string): void {
    if (!state.auth) return
    state.auth.email = email
    state.auth.binds = Array.from(new Set([ ...state.auth.binds, 'email' ]))
  },
  [types.MOBILE] (state: State, mobile: string): void {
    if (!state.auth) return
    state.auth.mobile = mobile
    state.auth.binds = Array.from(new Set([ ...state.auth.binds, 'mobile' ]))
  }
}