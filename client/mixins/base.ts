import { Component, Vue, Provide } from 'nuxt-property-decorator'
import { Store, Types } from '~/store'
import { UserDocument } from '@/types/services/db'
import { parseProps } from '@/utils'
import { Channel, EditorConfig } from '@/types/client'

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

  @Store.Setting.State
  channels!: Channel.DataNode[]

  @Store.Setting.State
  channelId!: string | null

  @Store.Setting.State
  editorConfig!: EditorConfig

  @Store.Setting.Getter
  selectedChannel!: Channel.DataNode

  @Store.Setting.Action
  selectChannel!: (key?: string | null) => Promise<void>

  @Provide()
  types = Types

  parseProps = parseProps
  JSON = JSON
  
}