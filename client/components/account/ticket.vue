<template>
  <div class="landing-body">
    <h3>{{ title }}</h3>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="handleSubmit" >
      <el-form-item prop="cdkey" :rules="rules.cdkey">
        <el-input :placeholder="`请输入您的${title}`" v-model="values.cdkey" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">下一步</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Emit } from 'nuxt-property-decorator'
import { Account } from '@/types/account'
import { Verify } from '@/types/client'
import { validateCDKey } from '@/utils/validate'
import { Form as ElForm } from 'element-ui'

@Component<Ticket>({
  name: 'account-ticket'
})
export default class Ticket extends Vue {

  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: '' })
  title!: string

  @Provide()
  values: Account.ticket = {}

  @Provide()
  rules: Record<string, Array<Verify.Rule>> = {
    cdkey: [
      { required: true, message: `请输入${this.title}` },
      { validator: validateCDKey(this.title) }
    ]
  }

  @Emit('submit')
  submit (value: Account.ticket) {}

  handleSubmit () {
    let theForm = this.$refs['theForm'] as ElForm
    theForm.validate( valid => {
      if (valid) {
        this.submit(this.values)
      }
      return false
    })
  }
  
}
</script>