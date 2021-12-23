import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { RootState } from '~/store'
import { UserDocument, AccoutNotificationDocument, BookmarkDataNode, PlanDocument } from '@/types/services/db'
import jsYaml from 'js-yaml'
import { isString } from 'lodash'

export const name = 'auth'

export const types = {
  AUTH            : 'AUTH',
  TIMESTAMP       : 'TIMESTAMP',
  AVATAR          : 'AVATAR',
  EMAIL           : 'EMAIL',
  MOBILE          : 'MOBILE',
  NOTIFICATION    : 'NOTIFICATION',
  UNREAD          : 'UNREAD',
  BOOKMARKS       : 'BOOKMARKS',
  DRAFTS          : 'DRAFTS'
}

export interface State {
  auth            : UserDocument | null
  timestamp       : number
  notification    : Array<AccoutNotificationDocument & { link?: string }>
  unread          : number
  bookmarks       : BookmarkDataNode[]
  drafts          : PlanDocument[]
}

export const namespaced: boolean = true

export const state: () => State = () => ({
  auth            : null,
  timestamp       : 0,
  notification    : [],
  unread          : 0,
  bookmarks       : [],
  drafts          : []
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
  },
  [types.NOTIFICATION] (state: State, notification: Array<AccoutNotificationDocument & { link?: string }>) {
    
    state.notification = notification.map( r => {
      return { ...r, link: `router:/account/notification/all?detail=${r._id}` }
    })
  },
  [types.UNREAD] (state: State, unread: number) {
    state.unread = unread
  },
  [types.BOOKMARKS] (state: State, bookmarks: string | BookmarkDataNode[]) {
    state.bookmarks = isString(bookmarks) ? jsYaml.load(bookmarks) : bookmarks
  },
  [types.DRAFTS] (state: State, drafts: PlanDocument[]) {
    state.drafts = drafts
  }
}