<template>
  <dashboard-page v-loading="initinal">
    <div class="security-container" v-if="!auth.binds.includes('email')" v-loading="refresh">
      <div class="main-content">
        <p>您的邮箱尚未被激活，请尽快激活；</p>
        <el-form>
          <el-form-item style="padding-left: 60px;">
            <el-button v-if="times === 0" type="primary" :loading="loading" @click="handleSendEmailVerify">发送激活邮件</el-button>
            <el-button v-else type="primary" disabled style="width: auto;">({{ times }} 秒) 发送激活邮件</el-button>
            <el-button @click="handleRefreshAuth">刷新状态</el-button>
          </el-form-item>
        </el-form>
        <div class="footer">
          <h2>激活邮箱</h2>
          <p>1、如未收到激活邮件可点击上方发送激活邮件按钮。</p>
          <p>2、如已经激活邮箱，请刷新本页面。</p>
        </div>
      </div>
    </div>
    <transition-group name="el-zoom-in-top" v-else>
      <security-password v-if="viewtype === 'password'" 
        key="password"
        :user="auth"
        :active="active"
        :times="times"
        :options="{ step: register.mailphone_step, timeout: register.lost_pass.timeout }"
        :lodaing="loading"
        @sendcode="handleSendcode"
        @verifycode="handleVerifycode"
        @submit="handleSubmitPassword"
        @close="handleClose" >
        <i class="el-icon-success" />
        <h2>密码修改成功</h2>
        <p>结果已经提交到服务器，并且已经生效。</p>
      </security-password>
      <security-email v-else-if="viewtype === 'email'" 
        key="email"
        :user="auth"
        :active="active"
        :times="times"
        :options="{ step: register.mailphone_step, timeout: register.lost_pass.timeout }"
        :lodaing="loading"
        :unique="handleUnique"
        @sendcode="handleSendcode"
        @verifycode="handleVerifycode"
        @submit="handleSubmitEmail"
        @close="handleClose" >
        <i class="el-icon-success" />
        <h2>邮箱设置成功</h2>
        <p>结果已经提交到服务器，并且已经生效。</p>
      </security-email>
      <security-mobile v-else-if="viewtype === 'mobile'" 
        key="mobile"
        :user="auth"
        :active="active"
        :times="times"
        :options="{ step: register.mailphone_step, timeout: register.lost_pass.timeout }"
        :lodaing="loading"
        :unique="handleUnique"
        @sendcode="handleSendcode"
        @verifycode="handleVerifycode"
        @submit="handleSubmitMobile"
        @close="handleClose" >
        <i class="el-icon-success" />
        <h2>手机设置成功</h2>
        <p>结果已经提交到服务器，并且已经生效。</p>
      </security-mobile>
      <div v-else class="security-container" key="overview">
        <div class="panel" v-for="(item, key) in overview" :key="key">
          <div class="panel-body">
             <div class="panel-content">
               <h4>
                {{ item.name }}
                <i :class="item.icon" />
              </h4>
              <p v-if="item.data">{{ item.data.name }}：{{ format(item) }}</p>
              <p v-if="isString(item.description)">{{ item.description }}</p>
              <template v-else-if="isArray(item.description)">
                <p v-for="(p, k) in item.description" :key="k">{{ p }}</p>
              </template>
              <template v-else-if="isObject(item.description)">
                <h4>{{ item.description.title }}</h4>
                <ul class="row-inline">
                  <li v-for="(c, k) in item.description.content" :key="k">{{ c }}</li>
                </ul>
              </template>
             </div>
            <div class="panel-sidebar">
              <el-button v-if="item.type === 'success'" type="success" size="medium" @click="item.click && item.click()">修改</el-button>
              <el-button v-else-if="item.type === 'info'" type="warning" size="medium" @click="item.click && item.click()">设置</el-button>
              <el-button v-else type="danger" size="medium" @click="item.click && item.click()" :disabled="auth && auth.group.level > 1000">注销</el-button>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch, mixins } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Store } from '~/store'
import { Register, Security } from '@/types/restful'
import { ResponseUserDocument } from '@/types/proxys/user'
import * as api from '~/api'
import * as auth from '~/store/modules/auth'
import { clone, isString, isArray, isObject } from 'lodash'
import { oc } from 'ts-optchain'
import * as PassportAPI from '@/types/apis/passport'

@Component<SecurityPage>({
  name: 'security-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
  created () {
    this.updateSecurity()
  }
})
export default class SecurityPage extends mixins(PageMixin) {

  @Store.Setting.State register!: Register.config

  @Provide() refresh: boolean = false
  @Provide() times: number = 0
  @Provide() viewtype: Security.viewType = 'overview'
  @Provide() overview: Security.overview[] = []
  @Provide() active: number = 0
  @Provide() verify_id: string | null = null

  isArray = isArray
  isObject = isObject
  isString = isString

  @Watch('auth')
  onAuthChange (val: ResponseUserDocument, oldVal: ResponseUserDocument): void {
    this.httpOptions = {
      token: this.token
    }
  }

  handleSendEmailVerify () {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.sendVerifyEmail(null, this.httpOptions)
        if (result.error === 0) {
          this.mailPhoneStep()
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

  handleRefreshAuth () {
    this.refresh = true
    setTimeout(async () => {
      try {
        let result = await api.accesstoken(this.httpOptions)
        if (result.error === 0) {
          this.$store.commit(`${auth.name}/${auth.types.AUTH}`, result.data)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
      this.refresh = false
    }, 300)
  }

  mailPhoneStep (): void {
    this.times = this.register.mailphone_step
    let timer: NodeJS.Timeout | null = setInterval(() => {
      this.times --
      if (this.times <= 0) {
        clearTimeout(timer!)
        timer = null
      }
    }, 1000)
  }

  format (data: Security.overview): string {
    let item = this.register.security.find( o => o.key === data.key ) as Security.overview
    if (!data.data!.value)  return '--'
    if (!item.data!.format) return data.data!.value!
    let [ searchValue, replaceValue ] = item.data!.format
    return data.data!.value!.replace(searchValue, replaceValue as string)
  }

  updateSecurity (user?: ResponseUserDocument): void {
    let overview = JSON.parse(JSON.stringify(this.register.security)) as Security.overview[]
    for (let item of overview) {
      updateOverviewItem(item, 'email', user || this.auth)
      updateOverviewItem(item, 'mobile', user || this.auth)
      item.click = () => this.handleOverview(item.key)
    }
    this.overview = overview
  }

  handleOverview (key: string): void {
    this.active = 0
    this.viewtype = ['password', 'email', 'mobile'].includes(key) ? key as Security.viewType : 'overview'
  }

  handleClose (): void {
    this.active = 0
    this.viewtype = 'overview'
  }

  async handleSendcode (values: Security.sendCode): Promise<void> {
    if (values.name) {
      values.verify_id = this.verify_id || ''
    }
    try {
      let result = await api.sendCode(values, this.httpOptions)
      if (result.error === 0) {
        this.mailPhoneStep()
        return
      }
      this.$message.warning(result.message)
    } catch (error) {
      this.$message.warning(error.message)
    }
  }

  handleVerifycode (values: Security.verifyCode): void {
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.verifyCode(values, this.httpOptions)
        if (result.error === 0) {
          this.verify_id = oc(result).data._id(null)
          this.active = 1
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

  handleSubmitPassword (values: Security.setPassword) {
    values.verify_id = this.verify_id
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.setPassword(values, this.httpOptions)
        if (result.error === 0) {
          this.active = 3
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

  async handleUnique (name: string, type: PassportAPI.checkUserType): Promise<boolean | undefined> {
    try {
      let result = await api.check({ name }, type, this.httpOptions)
      if (result.error === 0) {
        return result.data as boolean
      }
      return false
    } catch (error) {
      this.$message.warning(error.message)
    }
  }

  handleSubmitEmail (values: Security.setEmail): void {
    values.verify_id = this.verify_id
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.setEmail(values, this.httpOptions)
        if (result.error === 0) {
          this.$store.commit(`${auth.name}/${auth.types.EMAIL}`, values.email)
          let user = { 
            ...this.auth,
            email: values.email,
            binds: Array.from(new Set([ ...this.auth.binds, 'email' ]))
          } as ResponseUserDocument
          this.updateSecurity(user)
          this.active = 3
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

  handleSubmitMobile (values: Security.setMobile): void {
    values.verify_id = this.verify_id
    this.loading = true
    setTimeout(async () => {
      try {
        let result = await api.setMobile(values, this.httpOptions)
        if (result.error === 0) {
          this.$store.commit(`${auth.name}/${auth.types.MOBILE}`, values.mobile)
          let user = { 
            ...this.auth,
            mobile: values.mobile,
            binds: Array.from(new Set([ ...this.auth.binds, 'mobile' ]))
          } as ResponseUserDocument
          this.updateSecurity(user)
          this.active = 3
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

/**
 * 更新视图单元
 */
function updateOverviewItem (item: Security.overview, key: string, user: ResponseUserDocument): void {
  if (item.key === key && item.data) {
    item.data.value = user[key]
    let isBind: boolean = user.binds.indexOf(item.key) > -1
    item.type = isBind ? 'success' : 'info'
    item.icon = isBind ? 'el-icon-success success' : 'el-icon-info info'
  }
}
</script>

<style lang="scss">
.security-container {
  padding: 0 30px;
  font-family: Lantinghei;
  color: #444242;
  max-width: 960px;
  min-width: 960px;
  margin: auto;
  position: relative;

  .panel {
    //min-height: 180px;

    .panel-body {
      display: flex;
      justify-content: space-between;
      //align-items: center;
      min-height: 100px;
      padding: 44px 30px;

      .panel-content {
        padding: 0 20px 0 0;

        h4 {
          height: 26px;
          margin: 0 0 20px;
          line-height: 26px;
          font-size: 18px;
          font-weight: 400;

          i {
            font-size: 20px;

            &.success {
              color: #4CAF50;
            }

            &.info {
              color: #ffc107;
            }

            &.warning {
              color: #FF5722;
            }
          }

          &+p {
            margin-top: 20px;
          }

          &:not(:first-child) {
            margin-top: 20px;
            font-size: 1.2em;
          }
        }

        p {
          color: #747474;
          line-height: 1.8;
          margin: 0 ;
        }

        .row-inline {
          list-style: none;
          display: flex;
          padding: 0;

          &>li {
            margin: 0 30px 10px 0!important;
            color: #747474;

            &:before {
              width: 8px;
              height: 8px;
              background-color: #52acd9;
              color: #52acd9;
              display: inline-block;
              border-radius: 50%;
              margin-right: 5px;
              content: '';
            }
          }
        }
      }

      .panel-sidebar {
        display: flex;
        align-items: flex-end;
        padding: 0 30px 30px 0;

        .el-button {
          border-radius: 0;
        }
      }
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid #ecedf1;
    }
  }
  
  .el-steps {
    margin-top: 80px;
  }

  .main-content {
    margin: auto;
    margin-top: 80px;

    p {
      margin: auto;
      width: 600px;
      border-bottom: 1px solid rgb(153, 153, 153);

      span {
        margin-left: 20px;
      }
    }

    .el-form {
      margin: 40px auto auto;
      width: 600px;

      .el-form-item {
        margin-bottom: 28px;
      }

      .el-form-item__label {
        //font-size: 13px;
        padding-right: 20px;
        color: #777;
      }

      .el-input__inner {
        border-radius: 0;
      }

      .el-button {
        border-radius: 0;
      }

      .el-button--primary {
        width: 150px;
      }
    }

    .footer {
      margin: auto;
      border-top: 1px dashed #e8e8e8;
      width: 700px;
      margin-top: 50px;
      padding: 15px 60px 0;

      h2 {
        font-size: 15px;
        margin-bottom: 16px;
      }

      p {
        line-height: 1.8;
        margin-left: 20px;
        border-bottom: 0;
        width: auto;
      }
    }

    .result {
      margin: 0 auto;
      text-align: center;

      i {
        color: #52c41a;
        font-size: 72px;
        line-height: 72px;
        margin-bottom: 24px;
      }

      h2 {
        font-size: 24px;
      }

      p {
        border-bottom: 0;
      }
    }
  }

  .close_content {
    position: absolute;
    top: -40px;
    right: 0;
    font-size: 24px;

    i {
      cursor: pointer;

      &:hover {
        color: #52acd9;
      }
    }
  }
}
</style>