<template>
  <dashboard v-loading="initinal">
    <web-form
      name="人民币大写转换"
      :columns="columns"
      :rules="rules"
      :default-values="defaultValues"
      submit-name="转换大写金额"
      :submit-options="submitOptions"
      @submit="handleSubmit"
      @reset="handleSubmit"
      />
    <div class="form-container">
      <el-tooltip v-if="digitsCN" content="点击复制" placement="top">
        <el-link class="digitsCN" v-clipboard="handleClipboard(digitsCN)" :underline="false">{{ digitsCN }}</el-link>
      </el-tooltip>
      <div v-else class="el-link digitsCN"><span class="placeholder">大写人民币展示区</span></div>
      <el-alert
        class="digits-message"
        type="success"
        :closable="false">
        <div slot="title">
          <p>人民币金额用到的中文大写汉字如下：</p>
          <p>零、壹、贰、叁、肆、伍、陆、柒、捌、玖、拾、佰、仟、万、亿。</p>
        </div>
      </el-alert>
      <el-alert
        class="digits-message"
        type="success"
        :closable="false">
        <div slot="title">
          <p>人民币符号为：¥</p>
          <p>书写顺序为先写大写字母“Y”，再在竖划上加上二横，即为“¥”，读音为：yuán（音：元）。</p>
          <p>在阿拉伯数字金额首位之前加一个“¥”符号，既可防止在金额前填加数字，又可表明是人民币的金额数量。由于“¥”本身表示人民币的单位“元”，所以，凡是在金额前加了“¥ ”符号的，金额后就不需要再加“元”字。</p>
          <p>忘记怎么打的时候可以来这里复制噢~</p>
        </div>
      </el-alert>
    </div>
  </dashboard>
</template>

<script lang="ts">
import { Component, mixins, Provide } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import { Channel, Verify } from '@/types/client'
import { parseDigital } from '@/utils/number-to-chinese'

interface Values {
  digits   ?: string
}

@Component<HomePage>({
  name: 'homepage',
  middleware: [ 'authenticated' ],
  layout: 'dashboard',
})
export default class HomePage extends mixins(PageMixin) {
  
  @Provide()
  columns: Channel.FormItem[] = [
    {
      key: 'digits',
      name: '小写金额',
      type: 'input',
      suffix: '元',
      options: {
        clearable: true
      }
    }
  ]

  @Provide()
  defaultValues: Values = {}

  @Provide()
  rules: Record<string, Array<Verify.Rule>> = {
    digits: [
      { required: true, message: '请输入小写金额' },
      { validator: [ 'validateDecimal' ] }
    ]
  }

  @Provide()
  digitsCN: string = ''

  @Provide()
  submitOptions: Channel.SubmitOptions = {
    reset: '重置'
  }

  handleSubmit (values: Values) {
    let { digits } = values
    this.digitsCN = parseDigital(digits!)
  }

  handleClipboard (value: string) {
    return value
  }
}
</script>

<style lang="scss" scoped>
.digitsCN {
  font-size: x-large;
  font-family: auto;
  padding: 10px;
  min-width: 500px;
  border: 1px #666 dashed;
  margin-left: 150px;
  height: 55px;
  background-color: #eee;

  .placeholder {
    color: #c8c6c6;
  }
}

.digits-message {
  margin-top: 40px;
  margin-left: 50px;
  width: 780px;
}
</style>