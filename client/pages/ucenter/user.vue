<template>
  <dashboard-page v-loading="initinal">
    <!-- 创建新用户 -->
    <dashboard-form v-if="mode === 'create'"
      name="创建新用户"
      :default-values="getEditDefaultValues()"
      :rules="{
        group: [
          { required: true, message: '请选择用户组/角色' }
        ],
        username: [
          { required: true, message: '用户名不能为空' },
          { validator: validateUsername, trigger: ['blur', 'change'] }
        ],
        nickname: [
          { validator: validateNickname, trigger: ['blur', 'change'] }
        ],
        email: [
          { required: true, message: '请输入邮箱地址' },
          { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com', trigger: ['blur', 'change'] },
          { validator: validateEmail, trigger: ['blur', 'change'] }
        ],
        mobile: [
          { validator: validateMobile, trigger: ['blur', 'change'] }
        ],
      }"
      :columns="[
        {
          key: 'group',
          name: '用户组/角色',
          type: 'select',
          placeholder: '请选择用户组/角色',
          api: {
            method: 'post',
            url: '/api/v1/ucenter/group/lite',
            params: {},
            props: { key: '_id', name: 'name' }
          },
        },
        {
          key: 'username',
          name: '用户名',
          type: 'input',
          placeholder: '请输入用户名称'
        },
        {
          key: 'nickname',
          name: '昵称',
          type: 'input',
          placeholder: '请输入昵称'
        },
        {
          key: 'sex',
          name: '性别',
          type: 'radio',
          data: [
            { key: 0, name: '未知' },
            { key: 1, name: '男' },
            { key: 2, name: '女' },
          ]
        },
        {
          key: 'email',
          name: '电子邮箱',
          type: 'input',
          placeholder: '请输入电子邮箱'
        },
        {
          key: 'mobile',
          name: '手机号码',
          type: 'input',
          placeholder: '请输入手机号码'
        },
        {
          key: 'binds',
          name: '绑定',
          type: 'checkbox',
          data: [
            { key: 'email', name: '电子邮箱' },
            { key: 'mobile', name: '手机号码' },
          ]
        },
      ]"
      @get-data="handleGetData"
      @submit="handleCreate"
      @goback="handleGoback"
      :loading="loading" />
    <!-- 编辑用户信息 -->
    <dashboard-form v-else-if="mode === 'edit'"
      name="编辑用户信息"
      :default-values="getEditDefaultValues()"
      :rules="{
        username: [
          { required: true, message: '用户名不能为空' },
          { validator: validateUsername, trigger: ['blur', 'change'] }
        ],
        nickname: [
          { validator: validateNickname, trigger: ['blur', 'change'] }
        ],
        email: [
          { required: true, message: '请输入邮箱地址' },
          { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com', trigger: ['blur', 'change'] },
          { validator: validateEmail, trigger: ['blur', 'change'] }
        ],
        mobile: [
          { validator: validateMobile, trigger: ['blur', 'change'] }
        ],
      }"
      :columns="[
        selected.group.level === 9999 ? undefined : {
          key: 'group',
          name: '用户组/角色',
          type: 'select',
          placeholder: '请选择用户组/角色',
          api: {
            method: 'post',
            url: '/api/v1/ucenter/group/lite',
            params: {},
            props: { key: '_id', name: 'name' }
          },
        },
        {
          key: 'username',
          name: '用户名',
          type: 'input',
          placeholder: '请输入用户名称'
        },
        {
          key: 'nickname',
          name: '昵称',
          type: 'input',
          placeholder: '请输入昵称'
        },
        {
          key: 'sex',
          name: '性别',
          type: 'radio',
          data: [
            { key: 0, name: '未知' },
            { key: 1, name: '男' },
            { key: 2, name: '女' },
          ]
        },
        {
          key: 'email',
          name: '电子邮箱',
          type: 'input',
          placeholder: '请输入电子邮箱'
        },
        {
          key: 'mobile',
          name: '手机号码',
          type: 'input',
          placeholder: '请输入手机号码'
        },
        {
          key: 'binds',
          name: '绑定',
          type: 'checkbox',
          data: [
            { key: 'email', name: '电子邮箱' },
            { key: 'mobile', name: '手机号码' },
          ]
        },
      ]"
      @get-data="handleGetData"
      @submit="handleEdit"
      @goback="handleGoback"
      :loading="loading" />
    <!-- 用户列表 -->
    <dashboard-table v-else
      :columns="pageSetting.columns"
      :search-options="pageSetting.search"
      :data="list"
      :auth-level="authLevel"
      :flag="flag"
      :footer-bar="true"
      :selection="true"
      @selection="handleSelection"
      @getdata="handleList"
      @command="handleCommand"
      :pagination="true"
      :pagesize="oc(conditions).size(15)"
      :counts="total"
      :pageno="pageno"
      :loading="loading" >
      <dashboard-queryer slot="header" 
        :inline="true"
        :default-values="pick(conditions, ['create_at', 'groups', 'findtype', 'findname'])"
        :rules="{
          
        }"
        :columns="[
          {
            key: 'create_at',
            name: '注册时间',
            type: 'range-picker',
            mode: 'datetimerange'
          },
          {
            key: 'groups',
            name: '用户组/角色',
            type: 'select',
            placeholder: '请选择用户组/角色',
            multiple: true,
            api: {
              method: 'post',
              url: '/api/v1/ucenter/group/lite',
              params: {},
              props: { key: '_id', name: 'name' }
            },
          },
          {
            key: 'findname',
            name: '--',
            type: 'input',
            placeholder: '请输入查询内容',
            label: {
              key: 'findtype',
              options: {
                username: '用户名',
                nickname: '昵称',
                email: '电子邮箱',
                mobile: '手机号'
              },
              value: 'username'
            }
          }
        ]"
        @get-data="handleGetData"
        @command="handleCommand"
        @submit="handleSearch"
        :loading="loading" />
      <el-button type="primary" @click="mode = 'create'" :disabled="authLevel < oc(flag).create(0)">创建新用户</el-button>
      <el-button @click="handleRomoveSelection" :disabled="authLevel < oc(flag).remove(0) || selection.length === 0">删除选中</el-button>
    </dashboard-table>
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, Provide, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { ResponseUserDocument } from '@/types/proxys/user'
import * as api from '~/api'
import * as Ucenter from '@/types/apis/ucenter'
import { ListData } from 'kenote-mongoose-helper'
import { oc } from 'ts-optchain'
import { ElMessageBoxOptions, MessageBoxInputData } from 'element-ui/types/message-box'
import { Maps } from 'kenote-config-helper'
import { Channel } from '@/types/channel'
import { parseProps, randomPassword } from '@/utils'
import { pick, map, isRegExp } from 'lodash'
import * as PassportAPI from '@/types/apis/passport'
import validator from 'validator'
import * as rules from '@/utils/rules'
import { maxPageno } from '@/utils'

type ModeType = 'list' | 'create' | 'edit' | 'setpwd' | 'verify-email'

@Component<UserPage>({
  name: 'user-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created () {
    this.conditions = { size: 15, findtype: 'username' }
  }
})
export default class UserPage extends mixins(PageMixin) {
  
  @Provide() list: ResponseUserDocument[] = []
  @Provide() mode: ModeType = 'list'
  @Provide() selected: ResponseUserDocument | null = null
  @Provide() selection: ResponseUserDocument[] = []
  @Provide() conditions: Ucenter.findUser | null = null
  @Provide() total: number = 0
  @Provide() pageno: number = 1

  pick = pick

  handleList (conditions?: Ucenter.findUser): void {
    this.loading = true
    this.conditions = { ...this.conditions, ...conditions }
    setTimeout(async () => {
      try {
        let result = await api.userList(this.conditions!, this.httpOptions)
        if (result.error === 0) {
          let { data, counts, limit } = result.data as ListData
          this.list = data as ResponseUserDocument[]
          this.conditions = { ...this.conditions, size: limit }
          let pageno: number = oc(this.conditions).page(1)
          let maxpageno = maxPageno(counts as never, limit)
          this.pageno = pageno > maxpageno ? maxpageno : pageno
          this.total = counts as never
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

  handleSelection (selection: ResponseUserDocument[]): void {
    this.selection = selection
  }

  async handleCommand (type: string, row: ResponseUserDocument): Promise<void> {

    if (['edit'].includes(type)) {
      this.mode = (type as ModeType)
      this.selected = row
    }
    else if (type === 'setpass') {
      let { pattern } = rules.password
      try {
        let options: ElMessageBoxOptions = {
          confirmButtonText: '确定', 
          cancelButtonText: '取消',
          inputValue: randomPassword(),
          inputPattern: isRegExp(pattern) ? pattern : new RegExp(oc(pattern)('/^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/')),
          inputErrorMessage: '密码需要 8 - 20 位的字母、数字和英文符号',
          inputPlaceholder: '设置 8 - 20 位密码'
        }
        let result = await this.$prompt(`新密码`, `设置 ${row.username} 的密码`, options) as MessageBoxInputData
        this.handleSetPass(row._id, { password: result.value })
      } catch (error) {
        this.$message({ type: 'info', message: '取消输入' })
      }
    }
    else if (type === 'verify-email') {
      this.handleVerifyEmail(row._id)
    }
    else if (type === 'delete') {
      this.handleRemove(row._id)
    }
  }

  handleGetData (fetch: Channel.api, next: (data: Maps<any>[]) => void): void {
    fetch.options = this.httpOptions
    setTimeout(async () => {
      try {
        let result = await api.getData(fetch)
        if (result.error === 0) {
          let data = result.data.map( o => parseProps(o, fetch.props!))
          next(data)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  async handleRomoveSelection (): Promise<void> {
    let options: ElMessageBoxOptions = {
      confirmButtonText    : '确定',
      cancelButtonText     : '取消',
      type                 : 'warning'
    }
    try {
      await this.$confirm('此操作将永久删除选中的用户, 是否继续?', '提示', options)
      this.handleRemove(map(this.selection, '_id'))
    } catch (error) {
      this.$message.warning(`您已取消删除操作`)
    }
  }

  handleSearch (values: Ucenter.findUser): void {
    this.handleList({ ...this.conditions, ...values, page: 1 })
  }

  handleCreate (values: Ucenter.createUser): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.createUser(values, this.httpOptions)
        if (result.error === 0) {
          this.mode = 'list'
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

  handleEdit (values: Ucenter.createUser): void {
    let _id = oc(this.selected)._id()!
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.editUser(_id, values, this.httpOptions)
        if (result.error === 0) {
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

  handleSetPass (_id: string, values: Ucenter.setPass): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.setPass(_id, values, this.httpOptions)
        if (result.error === 0) {
          this.$message.success('用户密码已修改！')
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

  handleVerifyEmail (_id: string): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.userVerifyEmail(_id, this.httpOptions)
        if (result.error === 0) {
          this.$message.success('激活邮件已发送！')
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
        let result = await api.removeUser(_id, this.httpOptions)
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

  getEditDefaultValues (): Ucenter.createUser {
    if (!this.selected) return { binds: [], sex: 0 }
    let { username, nickname, email, mobile, binds, sex, group } = this.selected
    return { username, nickname, email, mobile, binds, sex, group: group._id }
  }

  async validateUsername (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> {
    let valid: boolean | undefined = /^[a-zA-Z]{1}[a-zA-Z0-9\_\-]/.test(value)
    if (!valid) {
      return callback('英文字符开头，支持小写英文、数字、下划线和中划线组合')
    }
    if (value.length > 20 || value.length < 5) {
      return callback('账号名限定 5 - 20 位字符')
    }
    valid = await this.handleUnique({ name: value, _id: oc(this.selected)._id() }, 'username')
    if (!valid) {
      return callback('该账号已占用')
    }
    return callback()
  }

  validateNickname (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any {
    if (!value) return callback()
    let valid: boolean = /^[\d\w\u4e00-\u9fa5\-]{2,15}$/.test(value)
    if (!valid) {
      return callback('昵称可以是2-15位的中文,英文,数字,下划线、减号')
    }
    return callback()
  }

  async validateEmail (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> {
    let valid: boolean | undefined = await this.handleUnique({ name: value, _id: oc(this.selected)._id() }, 'email')
    if (!valid) {
      return callback('该邮箱已占用')
    }
    return callback()
  }

  async validateMobile (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> {
    if (!value) return callback()
    let valid: boolean | undefined = validator.isMobilePhone(value, 'zh-CN')
    if (!valid) {
      return callback('请输入正确的手机号码，且不可使用虚拟手机号码')
    }
    valid = await this.handleUnique({ name: value, _id: oc(this.selected)._id() }, 'mobile')
    if (!value) {
      return callback('该邮箱已绑定其他帐号')
    }
    return callback()
  }

  async handleUnique (values: PassportAPI.checkValues, type: PassportAPI.checkUserType): Promise<boolean | undefined> {
    try {
      let result = await api.check(values, type)
      if (result.error === 0) {
        return result.data as boolean
      }
      return false
    } catch (error) {
      this.$message.warning(error.message)
    }
  }
  
}
</script>