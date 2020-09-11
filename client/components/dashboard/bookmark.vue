<template>
  <div class="bookmarks">
    <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
    <perfect-scrollbar style="height:calc(100vh - 190px)" :options="{ suppressScrollX: true }">
      <el-tree
        class="filter-tree"
        :data="data"
        :props="{ id: 'key', label: 'name', children: 'children' }"
        default-expand-all
        :filter-node-method="filterNode"
        @node-click="handleSelect"
        ref="tree">
      </el-tree>
    </perfect-scrollbar>
    <div class="footer">
      <el-tooltip effect="dark" content="书签管理">
        <a class="icon"><i class="el-icon-setting"></i></a>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Bookmark } from '@/types/proxys/plan'
import { TreeData } from 'element-ui/types/tree'
import { Tree as ElTree } from 'element-ui'

@Component<DashboardBookmark>({
  name: 'dashboard-bookmark'
})
export default class DashboardBookmark extends Vue {
  
  @Prop({ default: [] }) data!: Bookmark[]

  @Provide() filterText: string = ''

  @Watch('filterText')
  onFilterTextChange (val: string, oldVal: string): void {
    let tree = this.$refs['tree'] as ElTree
    tree.filter(val)
  }

  filterNode (value: string, data: Bookmark): boolean {
    if (!value) return true
    console.log(data)
    return data.name!.indexOf(value) !== -1
  }


  handleSelect (row: Bookmark): void {
    if (row.children) return
    this.$emit('command', row.command)
  }
}
</script>

<style lang="scss" scoped>
.bookmarks {
  margin: 20px;

  .el-input {
    margin-bottom: 15px;
  }

  .footer {
    margin-top: 10px;
    height: 30px;
    display: flex;
    justify-content: flex-end;

    a {
      color: #a8abb1;

      &.icon {
        font-size: 20px;
      }

      &:hover {
        color: #DCDFE6;
      }
    }
  }
}
</style>