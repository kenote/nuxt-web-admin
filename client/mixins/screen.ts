import { Component, Vue, Provide, Watch } from 'nuxt-property-decorator'
import { Route } from 'vue-router'

@Component<ScreenMixin>({
  name: 'screen-mixin',
  mounted () {
    let { t } = this.$route.query
    if (t) {
      setTimeout(() => {
        this.handleProjectChange(t as string)
      }, 500)
    }
  }
})
export default class ScreenMixin extends Vue {

  @Provide() projectTag: string = ''

  @Watch('$route')
  onRouteChange (val: Route, oldVal: Route): void {
    let { t } = val.query
    if (t) {
      this.handleProjectChange(t as string)
    }
  }

  handleProjectChange (value: string): void {
    this.projectTag = value
  }
}