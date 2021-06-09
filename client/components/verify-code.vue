<template>
  <fragment>
    <el-input :placeholder="placeholder" v-model="values" style="width:200px;" />
    <el-button v-if="times === 0" @click="sendCode" :disabled="!isSendCode">发送验证码</el-button>
    <el-button v-else disabled>({{ times }} 秒后)重新发送</el-button>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Model, Emit, Watch } from 'nuxt-property-decorator'

@Component<VerifyCode>({
  name: 'verify-code',
  created () {
    this.values = this.value
  }
})
export default class VerifyCode extends Vue {

  @Prop({ default: 0 })
  times!: number

  @Prop({ default: false })
  disabled!: boolean

  @Prop({ default: '' })
  placeholder!: string

  @Prop({ default: false })
  isSendCode!: boolean

  @Provide()
  values: string = ''

  @Model('update')
  value!: string

  @Emit('update')
  update (value: string) {}

  @Emit('send-code')
  sendCode (data: any) {}

  @Watch('values')
  onValuesChange (val: string, oldVal: string) {
    if (val === oldVal) return
    this.update(val)
  }
}
</script>