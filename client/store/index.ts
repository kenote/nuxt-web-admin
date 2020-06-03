import { ModuleTree } from 'vuex'
import { namespace } from 'nuxt-property-decorator'
import * as root from '~/store/root'
import * as auth from '~/store/modules/auth'
import * as setting from '~/store/modules/setting'

export const Store = {
  Auth             : namespace(auth.name),
  Setting          : namespace(setting.name)
}

interface ModulesStates extends Record<string, any> {}

export type RootState = root.State & ModulesStates

export const modules: ModuleTree<ModulesStates> = {
  [auth.name]             : auth,
  [setting.name]          : setting,
}

export const state = () => root.state()

export const getters = root.getters

export const mutations = root.mutations

export const actions = root.actions
