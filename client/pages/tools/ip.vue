<template>
  <dashboard v-loading="initinal">
    <web-form v-if="defaultValues.ips"
      :columns="columns"
      :rules="rules"
      :default-values="defaultValues"
      submit-name="查 询"
      :submit-options="submitOptions"
      @submit="handleSubmit"
      @reset="handleSubmit"
      :loading="loading"
      :inline="true"
      :env="env"
      />
    
    <web-table
      :columns="tableColumns"
      :data="ipInfo"
      :loading="loading"
      :pagination="false"
      />
  </dashboard>
</template>

<script lang="ts">
import { Component, mixins, Provide } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Channel, HttpResult, Verify } from '@/types/client'
import { IPInfo, IPInfoResponse } from '@/types/services/qqwry'
import { get, merge } from 'lodash'

interface Values {
  ips   ?: string
}

@Component<IPPage>({
  name: 'IP-page',
  middleware: [ 'authenticated' ],
  layout: 'dashboard',
  mounted () {
    this.getIPInfo()
  }
})
export default class IPPage extends mixins(PageMixin) {
  
  @Provide()
  columns: Channel.FormItem[] = [
    {
      key: 'ips',
      name: 'IP地址',
      type: 'input',
      placeholder: 'IP地址/域名',
      width: 400,
      options: {
        clearable: true
      }
    }
  ]

  @Provide()
  defaultValues: Values = {}

  @Provide()
  rules: Record<string, Array<Verify.Rule>> = {
    ips: [
      { required: true, message: '请填写IP地址或域名' }
    ]
  }

  @Provide()
  name: string = ''

  @Provide()
  submitOptions: Channel.SubmitOptions = {
    reset: '重置',
    emit: [
      {
        key: 'name',
        name: '{{name}}',
        type: 'button',
        style: 'success'
      },
      {
        key: 'version',
        name: '{{version}}',
        type: 'button',
        style: 'warning'
      }
    ]
  }

  @Provide()
  ipInfo: IPInfo[] = []

  @Provide()
  tableColumns: Channel.TableColumn[] = [
    {
      key: 'ip',
      name: 'IP 地址',
      width: 160,
      align: 'left',
      fixed: 'left',
      sortable: true
    },
    {
      key: 'int',
      name: 'IP Long',
      width: 160,
      align: 'left'
    },
    {
      key: 'addr',
      name: '地址信息',
      width: 160,
      align: 'left'
    },
    {
      key: 'info',
      name: '描述信息',
      align: 'left',
      minWidth: 300
    },
    {
      key: 'begIp',
      name: 'IP段（开始）',
      width: 160,
      align: 'left',
      fixed: 'right'
    },
    {
      key: 'endIp',
      name: 'IP段（结束）',
      width: 160,
      align: 'left',
      fixed: 'right'
    },
  ]

  handleSubmit (values: Values) {
    this.getIPInfo(values.ips)
  }

  getIPInfo (value?: string) {
    let query = value ? `?s=${value}` : ''
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await this.$httpClient(this.httpOptions).GET<HttpResult<IPInfoResponse>>(`/api/tools/ip${query}`)
        if (result?.error) {
          this.$message.error(result.error)
        }
        else {
          let { info, name, version } = result?.data!
          if  (!value) {
            this.defaultValues = { ips: get(info, ['0', 'ip'], '') }
          }
          this.env = merge(this.env, { name, version })
          this.ipInfo = info
        }
      } catch (error) {
        this.$message.error(get(error, 'message'))
      }
      this.loading = false
    }, 500)
  }
  
}
</script>