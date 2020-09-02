import { Component, Vue, Provide } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { oc } from 'ts-optchain'
import * as api from '~/api'
import { HeaderOptions } from '@/utils/http'
import { ResponseUserDocument } from '@/types/proxys/user'

@Component<ComponentMixin>({
  created () {
    this.httpOptions = {
      token: this.token
    }
  },
})
export default class ComponentMixin extends Vue {

  @Store.Auth.Getter token!: string
  @Store.Auth.State auth!: ResponseUserDocument
  @Store.Auth.State defaultAvatar!: string
  @Store.Auth.State timestamp!: number

  @Provide() httpOptions: HeaderOptions = {}

  oc = oc
  api = api
}