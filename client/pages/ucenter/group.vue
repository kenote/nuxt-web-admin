<template>
  <page v-loading="initinal">
    <dashboard-breadcrumb :route-path="$route.path" :channel="selectedChannel" />

    <dashboard-table 
      :columns="pageSetting.columns"
      :search-options="pageSetting.search"
      :data="list"
      :auth-level="authLevel"
      @command="handleCommand"
      :loading="loading"
      >
      <el-button type="primary" @click="handleCreate">创建用户组</el-button>
    </dashboard-table>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch, mixins } from 'nuxt-property-decorator'
import { Store } from '~/store'
import { Channel } from '@/types/channel'
import PageMixin from '~/mixins/page'
import * as api from '~/api'
import { ResponseGroupDocument } from '@/types/proxys/group'

@Component<GroupPage>({
  name: 'group-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created () {
    this.handleList()
  },
  mounted () {
    
  }
})
export default class GroupPage extends mixins(PageMixin) {

  @Store.Setting.State channels!: Channel.element[]

  @Provide() list: ResponseGroupDocument[] = []
  @Provide() mode: 'list' | 'create' | 'edit' | 'platform' | 'access' = 'list'

  handleList (): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.groupList(null, 'list', this.httpOptions)
        if (result.error === 0) {
          this.list = result.data as ResponseGroupDocument[]
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
      this.loading = false
    }, 300)
  }

  handleCommand (type: string, row: ResponseGroupDocument): void {
    console.log(type, row.name)
    switch (type) {
      case 'edit':
        
        break
      case 'access':

        break
      case 'platform':

        break
      case 'delete':

        break
      default:
        break
    }
  }

  handleCreate () {

  }
  
}
</script>