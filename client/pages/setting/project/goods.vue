<template>
  <dashboard-page v-loading="initinal">
    <!-- 主屏 -->
    <dashboard-screen :projects="projectChannels" :tag="projectTag" :footer-open="mode === 'list'" @change="handleProjectChange">

      <template v-if="goodsType">
        <!-- 导入配置 -->
        <dashboard-xlsx-import v-if="mode === 'import'"
          :title="title"
          :options="oc(projectOptions)({})"
          @submit="handleSubmit"
          @goback="handleGoback"
          :loading="loading">

        </dashboard-xlsx-import>
        <!-- 配置表 -->
        <dashboard-table v-else
          :columns="oc(projectOptions).columns([])"
          :search-options="oc(projectOptions).search()"
          :data="list"
          :auth-level="authLevel"
          :flag="flag"
          :pagination="true"
          :pagesize="15"
          @getdata="handleList"
          :loading="loading" />
      </template>
      <!-- 底部工具条 -->
      <template slot="footer" v-if="projectTag">
        <el-select v-model="goodsType" placeholder="请选择物品类型" style="margin-right: 10px" >
          <el-option
            v-for="item in goods"
            :key="item.key"
            :label="`${item.name}`"
            :value="item.key">
          </el-option>
        </el-select>
        <el-button type="primary" @click="handleOpenImport" v-if="goodsType">导入配置</el-button>
        <el-dropdown @command="handleCommandExport" style="margin-left:10px" v-if="goodsType">
          <el-button type="success">
            导出配置<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="item in fileTypes" :key="item.key" :command="item.key">{{ item.name }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </dashboard-screen>
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Channel } from '@/types/channel'
import { Maps } from 'kenote-config-helper'
import { oc } from 'ts-optchain'
import * as api from '~/api'
import * as nunjucks from 'nunjucks'
import { clone, cloneDeep, map } from 'lodash'
import { fileTypes, xlsxBlob } from '@/utils/xlsx'
import { Execl } from '@/types'

type ModeType = 'list' | 'import'

@Component<SettingProjectGoodsPage>({
  name: 'setting-project-goods-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class SettingProjectGoodsPage extends mixins(PageMixin) {
  
  @Provide() projectTag: string = ''
  @Provide() projectOptions: Maps<any> = {}
  @Provide() list: Maps<string>[] = []
  @Provide() mode: ModeType = 'list'
  @Provide() title: string = ''
  @Provide() projectName: string = ''

  @Provide() goods: Maps<any>[] = []
  @Provide() goodsType: string = ''
  @Provide() project: Channel.element | undefined

  fileTypes = fileTypes

  @Watch('projectTag')
  onProjectTagChange (val: string, oldVal: string): void {
    this.mode = 'list'
    this.goodsType = ''
    this.project = this.projectChannels.find( o => o.label === val )
    if (this.project) {
      this.goods = oc(this.project).options.goods([]) as Maps<any>[]
      this.projectName = this.project.name
    }
  }

  @Watch('goodsType')
  onGoodsTypeChange (val: string, oldVal: string): void {
    if (!val) {
      this.projectOptions = {}
      this.list = []
      return
    }
    this.projectOptions = oc(this.project).options({})[val] as Maps<any>
    if (oldVal) {
      this.handleList()
    }
  }


  handleProjectChange (value: string): void {
    this.projectTag = value
  }

  handleOpenImport (): void {
    this.mode = 'import'
    let goods = this.goods.find( o => o.key === this.goodsType )
    console.log(goods?.name)
    this.title = `${oc(this.project).name('')} --> ${oc(this.pageSetting).name('')} --> ${goods?.name}`
  }

  handleGoback (): void {
    this.mode = 'list'
    this.title = ''
  }

  handleList (): void {
    let fetch = clone(oc(this.pageSetting).api()) as Partial<Channel.api>
    fetch.url = nunjucks.renderString(fetch.url!, { channel: this.projectTag, goods: this.goodsType })
    fetch.options = this.httpOptions
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.getData(fetch as Channel.api)
        if (result.error === 0) {
          this.list = oc(result).data([])
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

  handleSubmit (content: string): void {
    let fetch = clone(oc(this.pageSetting).api()) as Partial<Channel.api>
    fetch.url = nunjucks.renderString(fetch.url!, { channel: this.projectTag, goods: this.goodsType })
    fetch.method = 'post'
    fetch.params = { content }
    fetch.options = this.httpOptions
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.getData(fetch as Channel.api)
        if (result.error === 0) {
          this.handleGoback()
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

  handleCommandExport (bookType: Execl.BookType): void {
    let goods = this.goods.find( o => o.key === this.goodsType )
    let sheetName = goods?.name
    let columns = oc(this.projectOptions).columns([]) as Channel.columns[]
    let header = map(columns, 'name').filter( o => !!o && o != '操作')
    let data: Array<{}> = []
    for (let item of this.list) {
      let obj: {} = {}
      let keys = Object.keys(item)
      for (let k of keys) {
        let c = columns.find( o => o.key === k )
        if (c) {
          obj[c.name] = item[k]
        }
      }
      data.push(obj)
    }
    xlsxBlob({ sheetName, header, data, filename: `${this.projectName} -- ${sheetName}`, bookType })
  }
  
}
</script>