import { ModuleTree } from 'vuex'
import { namespace } from 'nuxt-property-decorator'
import * as root from '~/store/root'
import * as setting from '~/store/modules/setting'

export const Stote = {
  Setting: namespace(setting.name)
}

interface ModulesStates extends Record<string, any> {}

export type RootState = root.State & ModulesStates

export const modules: ModuleTree<ModulesStates> = {
  [setting.name]: setting
}

export const state = () => root.state()

export const getters = root.getters

export const mutations = root.mutations

export const actions = root.actions
