import { ModuleTree } from 'vuex'
import { namespace } from 'nuxt-property-decorator'
import { cloneDeep } from 'lodash'
import * as root from './root'
import * as setting from './modules/setting'

interface ModulesStates extends Record<string, any> {}

export const Store = {
  Setting  : namespace(setting.name)
}

export type RootState = root.State & ModulesStates

export const modules: ModuleTree<ModulesStates> = {
  [setting.name]    : setting
}

export const state = () => root.state()

export const getters = root.getters

export const mutations = root.mutations

export const actions = root.actions

export const Types = {
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