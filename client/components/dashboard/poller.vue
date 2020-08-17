<template>
  <el-popover placement="top-start" trigger="click">
    <div class="poller-warpper">
      <div class="poller-head">
        <el-input v-model="keywords" placeholder="请输入关键字检索" size="mini" style="width:180px"></el-input>
        <div class="poller-head-tools">
            <el-tooltip content="执行全部">
              <el-button size="mini" type="info" plain @click="$emit('play')" :disabled="successTasks.length === tasks.length || polling"><i class="iconfont icon-play1"></i></el-button>
            </el-tooltip>
            <el-tooltip content="暂停全部">
              <el-button size="mini" type="info" plain @click="$emit('pause')" :disabled="successTasks.length === tasks.length || !polling"><i class="iconfont icon-music-icon_pause"></i></el-button>
            </el-tooltip>
            <el-tooltip content="清空已完成">
              <el-button size="mini" type="info" plain @click="$emit('clean-success')" :disabled="successTasks.length === 0"><i class="iconfont icon--remove"></i></el-button>
            </el-tooltip>
            <el-tooltip content="清空全部">
              <el-button size="mini" type="danger" plain @click="$emit('clean-all')" :disabled="tasks.length === 0 || polling"><i class="iconfont icon--remove"></i></el-button>
            </el-tooltip>
        </div>
      </div>
      <div class="poller-body">
        <el-scrollbar>
          <ul>
            <li v-for="(item, key) in tasks.filter(filterKeywords)" :key="key">
              <div class="poller-item-body" v-bind:class="isLoading && 'loading'">
                <span>{{ item.name }}</span>
                <span v-if="item.status === 'performed'"><i class="el-icon-loading"></i></span>
                <span v-else>{{ taskStatus[item.status] }}</span>
                <span>{{ bytes(item.size) || '--' }}</span>
                <span>{{ formatTime(item.time) }}</span>
                <el-progress v-if="isLoading" :percentage="100" status="success" :stroke-width="4" :show-text="false"></el-progress>
              </div>
              <div class="poller-item-tools">
                <el-button size="mini" type="info" plain @click="$emit('clean-item', item)" :disabled="polling"><i class="iconfont icon--remove"></i></el-button>
              </div>
            </li>
          </ul>
        </el-scrollbar>
      </div>
    </div>
    <div class="poller" slot="reference">
      <el-button type="text">{{ successTasks.length }} / {{ tasks.length }}</el-button>
    </div>
  </el-popover>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { Maps, KeyMap } from 'kenote-config-helper'
import * as bytes from 'bytes'
import { Poller } from '@/types'

@Component<DashboardPoller>({
  name: 'dashboard-poller',
  mounted () {
    this.update()
  }
})
export default class DashboardPoller extends Vue {

  @Prop({ default: [] }) tasks!: Poller.task[]
  @Prop({ default: false }) isLoading!: boolean
  @Prop({ default: false }) polling!: boolean

  @Provide() unfold: boolean = false
  @Provide() successTasks: Poller.task[] = []
  @Provide() keywords: string = ''
  @Provide() taskStatus = {
    waiting: '等待中',
    success: '完成',
    failure: '失败',
    performed: '进行中'
  }

  bytes = bytes

  @Watch('tasks')
  onTasksChange (val: Poller.task[], oldVal: Poller.task[]): void {
    this.successTasks = [ ...val.filter( task => task.status === 'success' ) ]
  }

  update (): void {
    this.successTasks = [ ...this.tasks.filter( task => task.status === 'success' ) ]
  }

  formatTime (value: number): string {
    if (!value) return '--'
    if (value >= 1000) {
      let val = value / 1000
      return `${val.toLocaleString('zh', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 })} s`
    }
    return `${value} ms`
  }

  filterKeywords (item: Poller.task): boolean {
    return new RegExp(this.keywords.replace(/\\/g, "\\\\")).test(item.name)
  }
  
}
</script>

<style lang="scss">
.poller {
  border: 1px solid #dcdfe6;
  background-color: #ffffff;
  display: inline-flex;
  margin-left: 15px;
  align-self: center;
  height: 40px;
  border-radius: 4px;

  .el-button {
    padding: 4px 20px;
  }

  >div {
    padding: 4px 10px;
    border-left: 1px solid #dcdfe6;

    .el-button {
      padding: 0 0px;
    }
  }
}

.poller-warpper {
  width: 680px;
  min-height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .poller-head {
    border-bottom: 1px #dcdfe6 solid;
    height: 40px;
    display: flex;
    justify-content: space-between;

    .poller-head-tools {
      height: 30px;

      .el-button--mini, .el-button--mini.is-round {
        padding: 5px 6px;
      }

      .el-button+.el-button{
        margin-left: 5px;
      }
    }
  }

  .poller-body {
    height: 400px;

    .el-scrollbar {
      height: inherit;

      .el-scrollbar__wrap {
        overflow-x: hidden;
      }
    }

    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
      margin-right: 15px;

      li {
        border-bottom: 1px dotted #dcdfe6;
        height: 40px;
        display: flex;
        justify-content: space-between;

        .poller-item-tools {
          height: 40px;
          align-items: center;
          display: flex;

          .el-button--mini, .el-button--mini.is-round {
            padding: 3px 4px;
          }

          .el-button+.el-button{
            margin-left: 5px;
          }
        }

        .poller-item-body {
          width: calc(100% - 100px);
          height: 40px;

          span {
            line-height: 40px;
            display: inline-block;
            width: 80px;
            text-align: center;
            color: #999999;

            &:first-child {
              width: 310px;
              text-align: left;
            }
          }

          &.loading span {
            line-height: 30px;
          }
        }
      }
    }
  }
}
</style>