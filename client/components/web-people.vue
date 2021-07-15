<template>
  <web-dialog
    :title="title"
    :env="env"
    @close="submit(null, null, { afterCommand: closeAfter })"
    @submit="submit(null, null, { afterCommand: closeAfter })"
    >
    <!-- 成员列表 -->
    <web-table
      :columns="columns"
      :data="data"
      :pagination="false"
      @command="handleCommand"
      />
    <template slot="tools">
      <el-autocomplete 
        ref="searchBar"
        style="width:400px"
        prefix-icon="el-icon-search" 
        v-model="search" 
        :fetch-suggestions="querySearch"
        @select="handleSelect"
        popper-class="fetch-people-popper"
        placement="top-start"
        placeholder="检索用户" >
        <i v-show="search" class="el-icon-error el-input__icon" slot="suffix" @click="handleClear"></i>
        <div slot-scope="{ item }">
          <div>
            <el-avatar icon="el-icon-user-solid" size="medium" :src="item.avatar"></el-avatar>
            <span class="name">{{ item.username }}</span>
            <span>{{ item.nickname }}</span>
          </div>
          <i class="el-icon-plus"></i>
        </div>
      </el-autocomplete>
    </template>
  </web-dialog>
</template>

<script lang="ts">
import { Component, Vue, mixins, Prop, Emit, Provide, Watch } from 'nuxt-property-decorator'
import EnvironmentMixin from '~/mixins/environment'
import { Channel, Command } from '@/types/client'
import { parseTemplate, parseProps, parseCommand, parseParams } from '@/utils'
import { cloneDeep, set, get } from 'lodash'
import { Autocomplete } from 'element-ui'
import { UserDocument } from '@/types/services/db'

@Component<WebPeople>({
  name: 'web-people',
  created () {
    if (this.request) {
      this.getData(this.request, null, data => {
        this.data = data
      })
    }
  }
})
export default class WebPeople extends mixins(EnvironmentMixin) {

  @Prop({ default: '' })
  title!: string
  
  @Prop({ default: undefined })
  columns!: Channel.TableColumn[]

  @Prop({ default: undefined })
  request!: Channel.RequestConfig

  @Prop({ default: undefined })
  invite!: Channel.RequestConfig

  @Prop({ default: undefined })
  addRequest!: Channel.RequestConfig

  @Prop({ default: undefined })
  removeRequest!: Channel.RequestConfig

  @Prop({ default: undefined })
  ownerRequest!: Channel.RequestConfig

  @Prop({ default: undefined })
  props!: Record<string, string>

  @Prop({ default: undefined })
  closeAfter!: string[]

  @Provide()
  search: string = ''

  @Provide()
  data: UserDocument[] = []

  @Watch('search')
  onSearchChange (val: string, oldVal: string) {
    if (val === oldVal) return
    this.update(val)
  }

  @Emit('update')
  update (value: string) {}

  @Emit('command')
  command (type: string, row?: Record<string, any>, component?: Vue) {}

  @Emit('get-data')
  getData (request: Channel.RequestConfig, options: Record<string,any> | null, next: (data: UserDocument[]) => void) {}

  @Emit('submit')
  submit (values: Record<string, any>, action: Channel.RequestConfig, options: Channel.SubmitOptions) {}

  querySearch (queryString: string, cb: (info: Record<string, any>[]) => void) {
    if (!this.invite) return
    let request = cloneDeep(this.invite)
    request.params = request.params ? parseTemplate(request.params, { name: queryString }) : { name: queryString }
    this.getData(request, null, data => {
      cb(data.map(parseProps(this.props)))
    })
  }

  handleSelect (row: UserDocument) {
    this.search = ''
    if (!this.addRequest) return
    let request = cloneDeep(this.addRequest)
    request.params = request.params ? parseTemplate(request.params, { row }) : { user: row._id }
    this.getData(request, null, data => {
      this.data = data
    })
  }

  handleClear () {
    this.search = ''
    let searchBar = this.$refs['searchBar'] as Autocomplete
    setTimeout(() => {
      searchBar.focus()
    }, 300)
  }

  handleCommand (value: string, row: UserDocument) {
    let { type, path } = parseCommand<'people'>(value, 'people') ?? {}
    if (type != 'people') return
    if (path === 'remove' && this.removeRequest) {
      let request = cloneDeep(this.removeRequest)
      request.params = request.params ? parseTemplate(request.params, { row }) : { user: row._id }
      this.getData(request, null, data => {
        this.data = data
      })
    }
    else if (path === 'owner' && this.ownerRequest) {
      let request = cloneDeep(this.ownerRequest)
      request.params = request.params ? parseTemplate(request.params, { row }) : { user: row._id }
      this.getData(request, null, data => {
        this.data = data
      })
    }
  }
}
</script>