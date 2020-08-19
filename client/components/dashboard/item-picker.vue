<template>
  <fragment>
    <div v-for="(val, key) in values" :key="key">
      <el-select v-model="val.key" placeholder="请选择道具" filterable size="small" @change="handleChangeValue">
        <el-option v-for="item in data" :key="item.key" :label="`[${item.key}] ${item.name}`" :value="item.key" :disabled="isDisabled(item.key)"></el-option>
      </el-select>
      <el-input-number v-model="val.num" size="small" controls-position="right" :min="1" :precision="0" @change="handleChangeValue"></el-input-number>
      <el-button icon="el-icon-close" circle size="mini" style="margin-left:50px" @click="handleRemoveItem(key)"></el-button>
    </div>
    <el-button size="small" @click="handleAddItem" style="width:330px" :disabled="isAddItem()">添加道具</el-button>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Model, Watch } from 'nuxt-property-decorator'
import { KeyMap } from 'kenote-config-helper'
import { map } from 'lodash'

interface Values {
  key   ?: string
  num    : number
}

@Component<DashboardItemPicker>({
  name: 'dashboard-item-picker'
})
export default class DashboardItemPicker extends Vue {

  @Prop({ default: [] }) data!: KeyMap<string>[]

  @Provide() values: Values[] = []

  @Model('update') readonly value!: string[]

  @Watch('value')
  onValueChange (val: string[], oldVal: string[]): void {
    this.values = val.map(parseValue)
  }

  handleAddItem (): void {
    this.values.push({ key: '', num: 1 })
    this.handleChangeValue()
  }

  handleRemoveItem (key: number): void {
    this.values.splice(key, 1)
    this.handleChangeValue()
  }

  isAddItem (): boolean {
    return !!this.values.find( o => !o.key ) || this.values.length === this.data.length
  }

  handleChangeValue (): void {
    let isUpdate = !this.values.find( o => !o.key )
    if (!isUpdate) return
    let values: string[] = this.values.filter( o => o.key ).map( o => Object.values(o).join(',') )
    this.$emit('update', values)
  }

  isDisabled (value: string): boolean {
    return map(this.values, 'key').includes(value)
  }
  
}

function parseValue (data: string): Values {
  let [ key, num ] = data.split(',')
  return {
    key, num: Number(num)
  }
}
</script>