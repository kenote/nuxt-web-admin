<template>
  <el-popover placement="top-start" trigger="click" popper-class="task-poller">

    <div class="poller" slot="reference">
      
      <el-link @click="handleTabClick('upload')"><i class="iconfont icon-upload"></i> <span>0/0</span></el-link>
      <el-link @click="handleTabClick('download')"><i class="iconfont icon-Clouddownload-Filled"></i> <span>0/0</span></el-link>
    </div>

    <div>
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="上传" name="upload">
          <template slot="label">
            <i class="iconfont icon-upload"></i>
            上传 <el-tag type="info">0/0</el-tag>
          </template>
        </el-tab-pane>
        <el-tab-pane label="下载" name="download">
          <template slot="label">
            <i class="iconfont icon-Clouddownload-Filled"></i>
            下载 <el-tag type="info">0/0</el-tag>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-popover>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'nuxt-property-decorator'

/**
 * 多任务轮询器
 */
@Component<TaskPoller>({
  name: 'task-poller'
})
export default class TaskPoller extends Vue {

  @Provide()
  activeName: string = 'upload'

  handleTabClick (value: string) {
    this.activeName = value
  }

  handleClick () {

  }
  
}
</script>

<style lang="scss">
.poller {
  border: 1px solid #dcdfe6;
  background-color: #fbfbfb;
  display: inline-flex;
  align-self: center;
  height: 28px;
  border-radius: 2px;
  position: fixed;
  bottom: 10px;
  right: 20px;
  // width: 100px;
  padding: 0 10px;
  justify-content: center;
  align-items: center;
  z-index: 4;

  .el-link {
    font-size: 10px;
    margin: 0 5px;

    i {
      font-size: 14px;
    }
  }
}

.task-poller {
  width: 680px;
  min-height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .popper__arrow {
    display: block!important;
  }

  .el-tag {
    border: 0;
    border-radius: 10px;
    background-color: #999;
    height: 20px;
    line-height: 20px;
    color: #fff;
    font-size: xx-small;
  }

  .el-tabs__item {
    color: #999;

    &.is-active {
      color: #409EFF;
    }
  }
}
</style>