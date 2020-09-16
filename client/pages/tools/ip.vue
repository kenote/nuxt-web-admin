<template>
  <dashboard-page v-loading="initinal">

    <dashboard-queryer 
      :default-values="{}"
      :rules="{
        
      }"
      :columns="[
        {
          key: 'ip',
          name: 'IP地址'
        }
      ]"
      @submit="handleSubmit"
      :loading="loading" />

    <dashboard-table 
      :columns="[
        {
          key: 'ip',
          name: 'IP 地址',
          width: 160,
          align: 'left'
        },
        {
          key: 'int',
          name: 'IP Long',
          width: 160,
          align: 'left'
        },
        {
          key: 'begIp',
          name: 'IP段（开始）',
          width: 160,
          align: 'left'
        },
        {
          key: 'endIp',
          name: 'IP段（结束）',
          width: 160,
          align: 'left'
        },
        {
          key: 'addr',
          name: '地址信息',
          width: 240,
          align: 'left'
        },
        {
          key: 'info',
          name: '描述信息',
          align: 'left'
        }
      ]"
      :data="data"
      :auth-level="authLevel"
      :flag="flag"
      :loading="loading" border>
      <dashboard-tag :data="[ name, version ]" />
    </dashboard-table>
    
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import * as api from '~/api'
import { Channel } from '@/types/channel'
import { IPInfoResponse, IPInfo, IPInfoArea } from '@/types/qqwry'
import { isArray, compact, trim } from 'lodash'

interface Velues {
  ip  : string
}

@Component<ToolsIpPage>({
  name: 'tools-ip-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created () {
    this.handleSubmit()
  }
})
export default class ToolsIpPage extends mixins(PageMixin) {

  @Provide() data: IPInfo[] = []
  @Provide() name: string = ''
  @Provide() version: string = ''
  @Provide() code: string = ''
  
  handleSubmit (values?: Velues): void {
    if (values) {
      let { ip } = values
      values.ip = compact(ip.split(/(\,|\s+)/).map(parseString)).join(',').replace(/\s+/g, '')
    }
    this.loading = true
    let fetch: Channel.api = {
      method: 'get',
      url: '/api/v1/tools/ip',
      params: values || null
    }
    setTimeout(async () => {
      try {
        let result = await api.getData(fetch)
        if (result.error === 0) {
          let { name, version, info } = result.data as IPInfoResponse
          this.name = name
          this.version = version
          this.data = info
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
}

function parseString (value: string): string {
  return trim(value).replace(/\,/g, '')
}
</script>

<style lang="scss" scoped>

</style>