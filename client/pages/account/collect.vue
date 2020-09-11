<template>
  <dashboard-page v-loading="initinal">
    
    <!-- 编辑收藏 -->
    <div v-if="mode === 'edit'">
      <dashboard-code-editor 
        :title="`编辑收藏  ${oc(selected).name()}`"  
        :content="oc(selected).content('')"
        @submit="handleEdit"
        @goback="handleGoback"
        :loading="loading" />
    </div>
    <dashboard-table v-else
      :columns="[
        {
          key: 'id',
          name: 'ID',
          width: 80,
          fixed: 'left',
          sortable: true
        },
        {
          key: 'name',
          name: '名称',
          width: 180,
          align: 'left'
        },
        {
          key: 'type',
          name: '类型',
          format: {
            maps: { bookmark: '书签', draft: '草稿', ditch: '渠道' }
          },
          width: 100,
        },
        {
          key: 'channel',
          name: '项目',
          format: {
            maps: projectMaps
          },
          width: 100,
        },
        {
          key: 'create_at',
          name: '创建时间',
          width: 170,
          format: {
            function: 'dateFormat',
            options: [ 'YYYY-MM-DD HH:mm:ss' ]
          },
          sortable: true
        },
        {
          key: 'update_at',
          name: '最后更新',
          width: 170,
          format: {
            function: 'dateFormat',
            options: [ 'YYYY-MM-DD HH:mm:ss' ]
          },
          sortable: true
        },
        {},
        {
          key: 'actions',
          name: '操作',
          width: 240,
          align: 'right',
          fixed: 'right',
          emit: [
            {
              key: 'edit',
              name: '编辑',
              type: 'dropdown',
              options: [
                {
                  key: 'clone',
                  name: '克隆一份'
                },
              ]
              
            },
            {
              key: 'delete',
              name: '删除',
              type: 'danger',
              options: {
                confirm: [ '此操作将永久删除该条收藏, 是否继续?', '提示' ]
              },
              conditions: {
                channel: {
                  $ne: 'home'
                }
              }
            }
          ]
        }
      ]"
      :search-options="{ field: 'name' }"
      :data="list"
      :auth-level="authLevel"
      :flag="flag"
      @getdata="handleList"
      @command="handleCommand"
      :loading="loading" >
    </dashboard-table>
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import * as api from '~/api'
import { ResponsePlanDocument, CreatePlanDocument, Bookmark } from '@/types/proxys/plan'
import { parseProps } from '@/utils'
import { zipObject, map } from 'lodash'
import { Maps } from 'kenote-config-helper'
import { oc } from 'ts-optchain'
import { ElMessageBoxOptions, MessageBoxInputData } from 'element-ui/types/message-box'
import * as auth from '~/store/modules/auth'
import * as yaml from 'js-yaml'

type ModeType = 'list' | 'edit'

@Component<CollectPage>({
  name: 'collect-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created () {
    this.projectMaps = { ...zipObject(map(this.projectChannels, 'label'), map(this.projectChannels, 'name')), home: '主书签', spare: '备用书签' }
  },
  mounted () {
    
  }
})
export default class CollectPage extends mixins(PageMixin) {
  
  @Provide() list: ResponsePlanDocument[] = []
  @Provide() projectMaps: Maps<string> = {}
  @Provide() selected: ResponsePlanDocument | null = null
  @Provide() mode: ModeType = 'list'
  @Provide() code: string = ''

  handleList (): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.planList(null, null, this.httpOptions)
        if (result.error === 0) {
          this.list = result.data as ResponsePlanDocument[]
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

  handleCommand (type: string, row: ResponsePlanDocument): void {
    if (['edit'].includes(type)) {
      this.mode = (type as ModeType)
      this.code = row.content
      this.selected = row
    }
    else if (type === 'clone') {
      (async () => {
        let options: ElMessageBoxOptions = {
          confirmButtonText: '确定', 
          cancelButtonText: '取消',
          inputValue: row.name,
          inputPlaceholder: '设置标题名称'
        }
        let result = await this.$prompt(`名称`, `克隆一份`, options) as MessageBoxInputData
        this.handleClone(result.value, row)
      })()
    }
    else if (type === 'delete') {
      this.handleRemove(row._id)
    }
  }

  handleEdit (values: string): void {
    let { _id, name, type, channel } = this.selected!
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.editPlan(_id, { name, content: values }, this.httpOptions)
        if (result.error === 0) {
          if (type === 'bookmark' && channel === 'home') {
            let bookmarks = yaml.load(values) as Bookmark[]
            this.$store.commit(`${auth.name}/${auth.types.BOOKMARKS}`, bookmarks)
          }
          this.mode = 'list'
          this.selected = null
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

  handleClone (name: string, row: ResponsePlanDocument): void {
    let values: CreatePlanDocument = {
      name,
      type: row.type,
      channel: row.type === 'bookmark' ? 'spare' : row.channel,
      content: row.content
    }
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.createPlan(values, this.httpOptions)
        if (result.error === 0) {
          this.handleList()
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

  handleRemove (_id: string | string[]): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.removePlan(_id, this.httpOptions)
        if (result.error === 0) {
          this.handleList()
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

  handleGoback (): void {
    this.mode = 'list'
    this.selected = null
  }
}
</script>