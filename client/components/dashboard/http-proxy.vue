<template>
  <div>
    <el-dialog :title="title" :close-on-click-modal="false" :modal-append-to-body="true" :modal="false" :visible.sync="dialogVisible" @close="$emit('close')">
      <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" label-width="100px">
        <el-form-item label="服务器" :rules="rules.host" prop="host">
          <el-input v-model="values.host" placeholder="请输入服务器" style="width: 80%" >
            <el-select v-model="values.protocol" slot="prepend" placeholder="请选择" style="width:110px">
              <el-option label="HTTP" value="http"></el-option>
              <el-option label="HTTPS" value="https"></el-option>
              <el-option label="SOCKS5" value="socks5"></el-option>
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item label="端口" :rules="rules.port" prop="port">
          <el-input-number v-model="values.port" controls-position="right" :min="1" :max="99999" style="width: 180px" />
        </el-form-item>
        <el-form-item label="使用账号" :rules="rules.auth" prop="auth">
          <el-switch v-model="values.auth" />
        </el-form-item>
        <el-form-item label="用户名" :rules="rules.username" prop="username">
          <el-input v-model="values.username" placeholder="请输入用户名" style="width: 300px" :disabled="!values.auth" />
        </el-form-item>
        <el-form-item label="密 码" :rules="rules.password" prop="password">
          <el-input :type="passwordType" v-model="values.password" placeholder="请输入密码" style="width: 300px" :disabled="!values.auth" >
            <i slot="suffix" class="el-input__icon el-icon-view" @click="handlePasswordType"></i>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Maps, Rule } from 'kenote-config-helper'
import { AxiosProxyConfig } from 'axios'
import { oc } from 'ts-optchain'
import { Form as ElForm } from 'element-ui'
import { username } from '@/utils/rules'
import { urlToProxyConfig, proxyConfigToUrl} from '@/utils'
import { set, cloneDeep } from 'lodash'

interface Values {
  host        ?: string
  port        ?: number
  auth        ?: boolean
  username    ?: string
  password    ?: string
  protocol    ?: string
}

@Component<DashboardHttpProxy>({
  name: 'dashboard-http-proxy',
  created () {
    this.dialogVisible = this.visible
  }
})
export default class DashboardHttpProxy extends Vue {

  @Prop({ default: '设置代理' }) title!: string
  @Prop({ default: false }) visible!: boolean
  @Prop({ default: undefined }) defaultValues!: AxiosProxyConfig | false

  @Provide() dialogVisible: boolean = false
  @Provide() values: Values = {
    host: '',
    port: 8080,
    protocol: 'http',
    auth: false,
    username: '',
    password: ''
  }
  @Provide() rules: Maps<Rule[]> = {
    
  }
  @Provide() passwordType: 'text' | 'password' = 'password'

  oc = oc

  @Watch('visible')
  onVisibleChange (val: boolean, oldVal: boolean): void {
    this.dialogVisible = val
    if (val) {
      this.initData()
    }
  }

  @Watch('dialogVisible')
  onDialogVisibleChange (val: boolean, oldVal: boolean): void {
    if (val != this.visible) {
      this.$emit('visible-change', val)
    }
  }

  @Watch('defaultValues')
  onDefaultValuesChange (val: AxiosProxyConfig | false, oldVal: AxiosProxyConfig | false): void {
    this.initData()
  }

  initData (): void {
    let values: Values = {
      host: '',
      port: 8080,
      protocol: 'http',
      auth: false,
      username: '',
      password: ''
    }
    if (this.defaultValues) {
      let { protocol, host, port, auth } = this.defaultValues
      values = {
        protocol,
        host,
        port,
        auth: auth ? true : false,
        username: oc(auth).username(''),
        password: oc(auth).password('')
      }
    }
    this.values = { ...values }
    let theForm = this.$refs['theForm'] as ElForm
    theForm && theForm.resetFields()
  }

  handlePasswordType (): void {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text'
  }

  handleSubmit (): void {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        let { protocol, host, port, auth, username, password } = this.values
        let values: AxiosProxyConfig | false = {
          protocol,
          host: host!,
          port: port!
        }
        if (auth && values) {
          set(values, 'auth', { 
            username: username || '', 
            password: password || ''
          })
        }
        this.$emit('submit', urlToProxyConfig(proxyConfigToUrl(values)))
      }
      else {
        return false
      }
    })
  }
  
}
</script>