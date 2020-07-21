<template>
  <fragment v-if="grouping">
    <template v-if="multiple">
      <el-tabs v-model="activeGroup" @tab-click="handleClickGroup" type="card" style="margin-right: 15px">
        <el-tab-pane v-for="group in data" :key="group.key" :label="group.name" :name="group.key">
          <el-checkbox-group v-model="values" @change="handleCheckChange" style="max-height:120px;overflow-y:auto;">
            <template v-for="item in group.children || []">
              <el-checkbox :label="item.key" :key="item.key" :border="border">{{ item.name }}</el-checkbox>
            </template>
          </el-checkbox-group>
        </el-tab-pane>
      </el-tabs>
    </template>
    <template v-else>
      <el-cascader :props="{ label: 'name', value: 'key' }" :options="data" v-model="values" @change="handleCheckChange" size="small" />
    </template>
  </fragment>
  <fragment v-else>
    <!-- 多选框 -->
    <el-checkbox-group v-if="multiple" v-model="values">
      <el-checkbox v-for="opt in data" :key="opt.key" :label="opt.key" :border="border">{{ opt.name }}</el-checkbox>
    </el-checkbox-group>
    <!-- 单选框 -->
    <el-radio-group v-else v-model="values">
      <el-radio v-for="opt in data" :key="opt.key" :label="opt.key" :border="border">{{ opt.name }}</el-radio>
    </el-radio-group>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Model, Watch } from 'nuxt-property-decorator'
import { Maps } from 'kenote-config-helper'
import { map, compact } from 'lodash'

@Component<DashboardGroupPicker>({
  name: 'dashboard-group-picker',
  created () {
    this.values = this.value
  }
})
export default class DashboardGroupPicker extends Vue {
  
  @Prop({ default: false }) multiple!: boolean
  @Prop({ default: [] }) data!: Maps<any>[]
  @Prop({ default: false }) border!: boolean

  @Provide() grouping: boolean = false
  @Provide() activeGroup: string = ''
  @Provide() values: string[] | string = []

  @Model('update') readonly value!: string[] | string

  @Watch('data')
  onDataChange (val: Maps<any>[], oldVal: Maps<any>[]): void {
    let childrens = compact(map(val, 'children'))
    this.grouping = childrens.length > 0
    if (this.grouping && this.multiple) {
      this.activeGroup = val[0].key
      this.values = !this.values ? [ ] : [ ...this.values ]
    }
    if (this.grouping && !this.multiple) {
      let values = [ this.value ]
      let s = val.find( o => map(o.children, 'key').includes(this.value) )
      values.splice(0, 0, s?.key)
      this.values = values as string[]
    }
  }

  @Watch('value')
  onValueChange (val: string[] | string, oldVal: string[] | string): void {
    if (this.multiple) {
      this.values = val || []
    }
    else if (!val) {
      this.values = [ undefined! ]
    }
  }

  handleClickGroup (group: any, event: MouseEvent): void {
    if (!this.grouping) return
    this.values = []
    this.$emit('update', this.values)
  }

  handleCheckChange (values: string[]): void {
    this.$emit('update', this.multiple ? (values.length > 0 ? values : null) : values[1])
  }
}
</script>