import { Component, Vue, Provide } from 'nuxt-property-decorator'
import { Store } from '~/store'

@Component<BaseMixin>({
 name: 'base-mixin'
})
export default class BaseMixin extends Vue {

  @Store.Setting.State site_url!: string
}