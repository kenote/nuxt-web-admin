<template>
  <div class="panel">
    <div class="panel-body">
      <div class="panel-content">
        <h4>
          {{ name }}
          <i :class="icon" />
        </h4>
        <p v-if="data">
          {{ data.name }}：
          <template v-if="link">
            <el-tooltip :content="link.tooltip" placement="top">
              <el-button type="text" @click="command(link.command)">{{ value }}</el-button>
            </el-tooltip>
          </template>
          <template v-else>
            {{ value }}
          </template>
        </p>
        <p v-if="isString(description)">{{ description }}</p>
        <template v-else-if="isArray(description)">
          <p v-for="(p, k) in description" :key="k">{{ p }}</p>
        </template>
        <template v-else-if="isPlainObject(description)">
          <h4>{{ description.title }}</h4>
          <ul class="row-inline">
            <li v-for="(c, k) in description.content" :key="k">{{ c }}</li>
          </ul>
        </template>
      </div>
      <div class="panel-sidebar">
        <el-button 
          :type="button.type" 
          size="medium" 
          @click="click"
          :disabled="button.disabled">
          {{ button.name }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Provide, Emit } from 'nuxt-property-decorator'
import { isArray, isString, isPlainObject } from 'lodash'
import { SecurityConfigure } from '@/types/config/account'
import { formatData } from 'parse-string'
import nunjucks from 'nunjucks'
import { FilterQuery } from '@kenote/common'
import ruleJudgment from 'rule-judgment'
import jsYaml from 'js-yaml'
import { isYaml } from '@/utils'

interface ButtonOptions {
  type       ?: string
  disabled   ?: boolean
  name       ?: string
}

interface LinkOptions {
  tooltip    ?: string
  command    ?: string
}

const buttonType = {
  success: 'success',
  info: 'warning',
  warning: 'danger'
}

@Component<SecurityPanel>({
  name: 'security-panel',
  created () {
    this.updateStatus()
  }
})
export default class SecurityPanel extends Vue {
  
  @Prop({ default: '' })
  name!: string

  @Prop({ default: false })
  success!: boolean | FilterQuery<any> | string

  @Prop({ default: undefined })
  buttonName!: string

  @Prop({ default: 0 })
  times!: number

  @Prop({ default: false })
  danger!: boolean

  @Prop({ default: '' })
  description!: SecurityConfigure.Description

  @Prop({ default: undefined })
  data!: SecurityConfigure.Data

  @Prop({ default: false })
  disabled!: boolean | FilterQuery<any> | string

  @Prop({ default: undefined })
  env!: Record<string, any>

  @Provide() 
  icon: string = 'el-icon-info info'

  @Provide()
  status: SecurityConfigure.statusType | string = ''

  @Provide()
  button: ButtonOptions = {}

  @Provide()
  link: LinkOptions | null = null

  @Provide()
  value: string = ''

  @Emit('click')
  click () {}

  @Emit('command')
  command (name: string) {}

  isArray = isArray
  isString = isString
  isPlainObject = isPlainObject

  @Watch('status')
  onStatusChange (val: SecurityConfigure.statusType, oldVal: SecurityConfigure.statusType) {
    this.icon = `el-icon-${val} ${val}`
    this.button = {
      disabled: this.isStatus(this.disabled),
      name: this.buttonName ?? (val === 'success' ? '修改' : '设置'),
      type: buttonType[val]
    }
  }

  @Watch('env')
  onEnvChange (val: Record<string, any>, oldVal: Record<string, any>) {
    if (val === oldVal) return
    this.updateStatus()
  }

  /**
   * 更新状态
   */
  updateStatus () {
    if (this.danger) {
      this.status = 'warning'
    }
    else {
      this.status = this.isStatus(this.success) ? 'success' : 'info'
    }
    if (this.data) {
      let { value, format, link } = this.data
      this.value = formatData(format ?? [])(nunjucks.renderString(value ?? '', this.env) || '--')
      if (link) {
        let { conditions, command, tooltip } = link
        let islink = this.isLink(conditions)
        if (islink) {
          this.link = { tooltip, command }
        }
        else {
          this.link = null
        }
      }
    }
  }

  /**
   * 判断状态
   */
  isStatus (val: boolean | FilterQuery<any> | string): boolean {
    if (!val) return false
    let query = val
    if (isString(val) && isYaml(val)) {
      query = jsYaml.safeLoad(nunjucks.renderString(val, { ...this.env })) as FilterQuery<any>
      if (!isPlainObject(query)) return false
    } 
    if (isPlainObject(query)) {
      let filter = ruleJudgment(query as FilterQuery<any>)
      return ruleJudgment(query as FilterQuery<any>)({ ...this.env })
    }
    return val as boolean
  }

  isLink (val?: FilterQuery<any> | string) {
    if (!val) return false
    let query = val
    if (isString(val) && isYaml(val)) {
      query = jsYaml.safeLoad(nunjucks.renderString(val, { ...this.env })) as FilterQuery<any>
      if (!isPlainObject(query)) return false
    } 
    if (isPlainObject(query)) {
      let filter = ruleJudgment(query as FilterQuery<any>)
      return filter({ ...this.env })
    }
    return false
  }


}
</script>