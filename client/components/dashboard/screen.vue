<template>
  <fragment>
    <slot v-if="projectTag"></slot>
    <el-row v-else :gutter="12">
      <el-col :span="6" v-for="(item, key) in projects" :key="key">
        <el-card shadow="hover">
          <div @click="handleChange(item.label)" style="cursor:pointer;">
            <span>[{{ item.id }}] {{ item.name }}</span>
            <div class="box">{{ item.description }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 底部操作区 -->
    <dashboard-footer-bar v-if="showFooter" :visible="showFooter">
      <el-select v-model="projectTag" placeholder="请选择项目" style="margin-right: 10px" @change="handleChange">
        <el-option
          v-for="item in projects"
          :key="item.label"
          :label="`[${item.id}] ${item.name}`"
          :value="item.label">
        </el-option>
      </el-select>
      <slot name="footer"></slot>
    </dashboard-footer-bar>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Channel } from '@/types/channel'

@Component<DashboardScreen>({
  name: 'dashboard-screen',
  created () {
    if (!this.footerOpen) return
    setTimeout(() => {
      this.showFooter = true
    }, 800)
  }
})
export default class DashboardScreen extends Vue {
  
  @Prop({ default: [] }) projects!: Channel.element[]
  @Prop({ default: undefined }) tag!: string
  @Prop({ default: true }) footerOpen!: boolean

  @Provide() showFooter: boolean = false
  @Provide() projectTag: string = ''

  @Watch('tag')
  onTagChange (val: string, oldVal: string): void {
    if (val != this.projectTag) {
      this.projectTag = val
    }
  }

  @Watch('footerOpen')
  onFooterOpenChange (val: boolean, oldVal: boolean): void {
    // if (!val) return
    // setTimeout(() => {
      this.showFooter = val
    // }, 800)
  }

  handleChange (value) {
    if (value != this.projectTag) {
      this.projectTag = value
    }
    this.$emit('change', value)
  }
}
</script>

<style lang="scss" scoped>
.box {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #999;
  height: 70px;
  border-top: 1px solid #ccc;
  padding-top: 8px;
  margin-top: 8px;
}
</style>