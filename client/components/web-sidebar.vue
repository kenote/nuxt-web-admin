<template>
  <fragment>
    <div v-if="title" class="header">
      <i v-if="icon" v-bind:class="icon"></i>
      <span>{{ title }}</span>
    </div>
    <perfect-scrollbar :options="{ suppressScrollX: true }" style="height: calc(100% - 56px);">
      <el-menu
        :default-active="defaultActive"
        :background-color="'#444c54'"
        :text-color="'#ffffff'"
        :active-text-color="'#ffd04b'"
        :router="true"
        :unique-opened="false"
        :collapse="false"
        :default-openeds="defaultOpeneds" >
        <sidebar-item v-for="(item, key) in data"
          :key="key"
          :name="item.name"
          :icon="item.icon"
          :index="item.route || item.key"
          :children="item.children"
          />
      </el-menu>
    </perfect-scrollbar>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { map } from 'lodash'
import { Channel } from '@/types/client'

@Component<Sidebar>({
  name: 'sidebar',
  created () {
    this.defaultOpeneds = map(this.data, 'key')
  }
})
export default class Sidebar extends Vue {

  @Prop({ default: '' })
  title!: string

  @Prop({ default: '' })
  icon!: string

  @Prop({ default: '' })
  defaultActive!: string

  @Prop({ default: undefined })
  data!: Channel.DataNode[]

  @Provide()
  defaultOpeneds: string[] = []

  @Watch('data')
  onDataChange (val: Channel.DataNode[], oldVal: Channel.DataNode[]) {
    if (val === oldVal) return
    this.defaultOpeneds = map(val, 'key')
  }
}

</script>

<style lang="scss" >
.el-menu {
  border: 0!important;

  .el-menu-item.is-active {
    background-color: #373d41!important;
    font-weight: 600;
  }
}
.header {
  color: #e0e0e0;
  padding: 0 20px;
  transition: border-color .3s,background-color .3s,color .3s;
  box-sizing: border-box;
  height: 56px;
  line-height: 56px;
  background-color: #3c444a;
  text-align: center;
  border-bottom: 1px solid #373737;

  i {
    margin-right: 6px;
  }

  span {
    font-size: 15px;
    font-weight: 600;
  }
}
</style>