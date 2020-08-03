<template>
  <div class="dashboard-tag">
    <template v-for="(item, key) in data">
      <div :key="key" class="dashboard-tag-item">
        <span>{{ item }}</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component<DashboardTag>({
  name: 'dashboard-tag'
})
export default class DashboardTag extends Vue {
  
  @Prop({ default: [] }) data!: Array<string | number>


}
</script>

<style lang="scss">
.dashboard-page .el-table .cell .dashboard-tag-item {
  margin-right: 0;
}
.dashboard-tag {
  display: inline;
  padding-right: 8px;
  font-family: Quicksand,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;

  .dashboard-tag-item {
    
    display: inline-block;
    padding: 0 8px;
    font-size: 10px;
    height: 24px;
    border-style: solid;
    border-width: 0;
    border-top-width: 1px;
    border-bottom-width: 1px;
    line-height: 24px;
    margin: 15px 0;

    &:nth-child(2n+1) {
      background-color: #E6A23C;
      border-color: #E6A23C;
      color: #ffffff;
    }

    &:nth-child(2n+2) {
      background-color: #ffffff;
      border-color: #E6A23C;
      color: #E6A23C;
    }

    &:first-child {
      // border-top-left-radius: 4px;
      // border-bottom-left-radius: 4px;
      border-left-width: 1px;
    }

    &:last-child {
      // border-top-right-radius: 4px;
      // border-bottom-right-radius: 4px;
      border-right-width: 1px;
    }
  }
}
</style>