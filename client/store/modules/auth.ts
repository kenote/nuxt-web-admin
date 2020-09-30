import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { RootState } from '../'
import { ResponseUserDocument } from '@/types/proxys/user'
import { Bookmark } from '@/types/proxys/plan'
import { oc } from 'ts-optchain'
import { map } from 'lodash'

export const name: string = 'auth'

export const types = {
  AUTH             : 'AUTH',
  EMAIL            : 'EMAIL',
  MOBILE           : 'MOBILE',
  TIMESTAMP        : 'TIMESTAMP',
  BOOKMARKS        : 'BOOKMARKS'
}

export interface State {
  auth             : ResponseUserDocument | null
  timestamp        : number
  defaultAvatar    : string
  bookmarks        : Bookmark[]
}

export const namespaced: boolean = true

export const state = (): State => ({
  auth             : null,
  timestamp        : 0,
  defaultAvatar    : 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  bookmarks        : []
})

export const getters: GetterTree<State, RootState> = {
  token: state => oc(state).auth.jw_token(),
  authLevel: state => oc(state).auth.group.level(),
  teams: state => map(oc(state).auth.teams([]), 'name')
}

export interface Actions<S, R> extends ActionTree<S, R> {
  
}

export const actions: Actions<State, RootState> = {
  
}

export const mutations: MutationTree<State> = {
  [types.AUTH] (state: State, user: ResponseUserDocument | null): void {
    state.auth = user
    state.timestamp = Date.now()
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
    
  },
  [types.TIMESTAMP] (state: State): void {
    state.timestamp = Date.now()
  },
  [types.BOOKMARKS] (state: State, bookmarks: Bookmark[]): void {
    state.bookmarks = bookmarks
  }
}