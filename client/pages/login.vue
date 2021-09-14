<template>
  <page>
    <div class="landing-activity">
      <!-- <el-carousel indicator-position="outside" arrow="never" height="180px" >
        <el-carousel-item>
          <p class="main-title">简洁至上</p>
          <p class="secondary-title">最大程度上帮助应用在 web 开发中提升可维护性和扩展性，在这一系列的增强下，开发者无需关注对象创建和销毁，把注意力集中在真正复杂的业务中。</p>
        </el-carousel-item>
        <el-carousel-item>
          <p class="main-title">面向未来</p>
          <p class="secondary-title">享受 Typescript 的开发体验，增强的语法和各种面向接口编程，让用户提前享受到便利。通过装饰器和依赖注入的通用能力，让应用开发变的流畅自然，便于多人沟通协作，可以专注业务逻辑编码，减少依赖错误。</p>
        </el-carousel-item>
      </el-carousel> -->
      <p class="main-title">新一代的企业中台</p>
      <p class="main-title">使用 Node.js 与 Typescript 构建</p>
      <p class="secondary-title">JSON Web Token (JWT) & 服务端渲染(Server Side Render)</p>
    </div>
    <div class="landing-body">
      <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" label-position="top" hide-required-asterisk :disabled="loading || times>0">
        <el-form-item prop="username" :rules="rules.username" label="用户名：">
          <el-input placeholder="账号/邮箱/手机号" v-model="values.username" />
        </el-form-item>
        <el-form-item prop="password" :rules="rules.password" label="密码：">
          <el-input type="password" placeholder="密码" v-model="values.password" />
        </el-form-item>
        <el-form-item>
          <el-button v-if="times === 0" type="primary" native-type="submit" :loading="loading">登 录</el-button>
          <el-button v-else type="info" :loading="loading" disabled>(等待 {{ times }} 秒后) 提交</el-button>
        </el-form-item>
        <p class="service-terms">
          <nuxt-link to="/lostpass">忘记密码</nuxt-link>
          <nuxt-link to="/register" class="ng-hide">立即注册</nuxt-link>
          <!-- <span class="ng-hide">|</span>
          <nuxt-link to="/login-verify" class="ng-hide">验证码登录</nuxt-link> -->
        </p>
      </el-form>
    </div>
  </page>
</template>

<script lang="ts">
import { Component, mixins, Provide, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { FilterData } from 'parse-string'
import { Form as ElForm } from 'element-ui'
import { HttpResult } from '@/types/client'
import { UserDocument } from '@/types/services/db'
import { Account } from '@/types/account'

@Component<LoginPage>({
  name: 'login-page',
  // middleware: [ 'authenticated' ],
  layout: 'account',
  mounted () {
    if (this.auth) {
      let { url_callback } = this.$route.query
      this.$router.push(url_callback as string ?? '/dashboard')
    }
  }
})
export default class LoginPage extends mixins(PageMixin) {
  
  @Provide() 
  values: Account.login = {}

  @Provide()
  rules: Record<string, FilterData.rule[]> = {
    username: [
      { required: true, message: '请输入账号/邮箱/手机号' }
    ],
    password: [
      { required: true, message: '请输入密码' }
    ]
  }

  @Provide()
  uuidResult: Account.uuidResult<UserDocument[]> | null = null

  @Watch('auth')
  onAuthChange (auth) {
    if (auth) {
      let { url_callback } = this.$route.query
      this.$router.push(url_callback as string ?? '/dashboard')
    }
  }

  handleSubmit () {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate(valid => {
      if (valid) {
        this.loading = true
        setTimeout(async () => {
          try {
            let result = await this.$httpClient().post<HttpResult<UserDocument | Account.uuidResult<UserDocument[]>>>(`/api/account/login`, this.values)
            if (result?.error) {
              this.sendWait(3)
              this.$notify.warning({ title: '警告', message: result.error })
            }
            else {
              if ('uuid' in result?.data!) {
                // 
                this.uuidResult = result?.data as Account.uuidResult<UserDocument[]>
                
              }
              else if (result?.data) {
                // 
                this.$store.commit(this.types.auth.AUTH, result.data)
              }
              theForm.resetFields()
            }
          } catch (error) {
            this.$notify.error({ title: '错误', message: error.message })
          }
          this.loading = false
        }, 300)
        
      }
      else {
        return false
      }
    })
  }

  async handleSelectLogin (_id: string) {
    try {
      let result = await this.$httpClient().put<HttpResult<UserDocument>>('', { uuid: this.uuidResult?.uuid, result: _id })
      if (result?.error) {
        console.error(result.error)
        return
      }
    } catch (error) {
      
    }
  }
}
</script>