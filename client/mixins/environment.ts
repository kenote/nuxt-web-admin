import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { isString, isPlainObject, assign } from 'lodash'
import { FilterQuery } from '@kenote/common'
import ruleJudgment from 'rule-judgment'
import jsYaml from 'js-yaml'
import { parseTemplate } from '@/utils'

@Component<EnvironmentMixin>({
  name: 'environment-mixin'
})
export default class EnvironmentMixin extends Vue {

  @Prop({ default: undefined })
  env!: Record<string, any>

  isFilter (conditions: FilterQuery<any> | string, props?: Record<string, any>) {
    if (!conditions) return true
    let query = conditions
    let data = assign(this.env, props)
    if (isString(conditions)) {
      query = jsYaml.safeLoad(parseTemplate(conditions, data)) as FilterQuery<any>
      if (!isPlainObject(query)) return true
    } 
    let filter = ruleJudgment(query as FilterQuery<any>)
    return filter(data)
  }

  isDisabled (disabled: boolean | FilterQuery<any> | string, props?: Record<string, any>) {
    if (!disabled) return false
    let query = disabled
    let data = assign(this.env, props)
    if (isString(disabled)) {
      query = jsYaml.safeLoad(parseTemplate(disabled, data)) as FilterQuery<any>
      if (!isPlainObject(query)) return false
    } 
    if (isPlainObject(query)) {
      let filter = ruleJudgment(query as FilterQuery<any>)
      return filter(data)
    }
    return disabled
  }
}