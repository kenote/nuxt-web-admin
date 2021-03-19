import { ModuleTree, Plugin } from 'vuex'
import createLogger from 'vuex/dist/logger'
import { namespace } from 'nuxt-property-decorator'
import { cloneDeep, compact } from 'lodash'
import * as root from './root'
import * as auth from './modules/auth'
import * as setting from './modules/setting'

const isDevelopment = process.env.NODE_ENV !== 'production'

interface ModulesStates extends Record<string, any> {}

export const Store = {
  Auth     : namespace(auth.name),
  Setting  : namespace(setting.name)
}

export type RootState = root.State & ModulesStates

export const modules: ModuleTree<ModulesStates> = {
  [auth.name]       : auth,
  [setting.name]    : setting
}

export const state = () => root.state()

export const getters = root.getters

export const mutations = root.mutations

export const actions = root.actions

export let plugins: Array<Plugin<RootState>> = []
if (isDevelopment) {
  plugins = compact([ createLogger(), ...plugins ])
}

export const Types = {
  auth     : getStoreTypes<typeof auth.types>(auth),
  setting  : getStoreTypes<typeof setting.types>(setting)
}

function getStoreTypes <T extends {}>(store: { name: string, types: Readonly<T> }) {
  let prefix = store.name
  let types = cloneDeep(store.types)
  for (let [key, value] of Object.entries(types)) {
    types[key] = [ prefix, value ].join('/')
  }
  return types
}