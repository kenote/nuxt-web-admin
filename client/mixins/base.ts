import { Component, Vue, Provide } from 'nuxt-property-decorator'
import { Store, Types } from '~/store'
import { UserDocument } from '@/types/services/db'

@Component<BaseMixin>({
 name: 'base-mixin'
})
export default class BaseMixin extends Vue {

  @Store.Auth.State 
  auth!: UserDocument | null

  @Store.Auth.State 
  timestamp!: number

  @Store.Auth.Getter 
  token!: string

  @Store.Auth.Getter 
  level!: number

  @Store.Setting.State 
  site_url!: string

  @Provide()
  types = Types
  
}