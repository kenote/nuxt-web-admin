import { Component, Vue } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { oc } from 'ts-optchain'
import { ResponseUserDocument } from '@/types/proxys/user'
import { MetaPropertyCharset, MetaPropertyEquiv, MetaPropertyName, MetaPropertyMicrodata, MetaPropertyProperty } from 'vue-meta'


@Component<LayoutMixin>({
  head () {
    return {
      title: this.name,
      meta: this.metas
    }
  },
})
export default class LayoutMixin extends Vue {

  @Store.Auth.State auth!: ResponseUserDocument
  @Store.Auth.Getter token!: string
  @Store.Auth.Getter authLevel!: number

  @Store.Setting.State name!: string
  @Store.Setting.State metas!: Array<MetaPropertyCharset | MetaPropertyEquiv | MetaPropertyName | MetaPropertyMicrodata | MetaPropertyProperty>

  oc = oc
}