<template>
  <div class="dashboard-footerbar" v-bind:class="show ? 'dashboard-footerbar-open' : ''">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Provide } from 'nuxt-property-decorator'

@Component<DashboardFooterBar>({
  name: 'dashboard-footer-bar',
  mounted () {
    if (this.visible) {
      this.handleShow(this.visible)
    }
  }
})
export default class DashboardFooterBar extends Vue {

  @Prop({ default: false }) visible!: boolean
  @Prop({ default: 800 }) delay!: number

  @Provide() show: boolean = false

  @Watch('visible')
  onVisibleChange (val: boolean, oldVal: boolean): void {
    this.handleShow(val)
  }

  handleShow (visible: boolean) {
    let timer: NodeJS.Timeout | null = setTimeout(() => {
      this.show = visible
      clearTimeout(timer!)
      timer = null
    }, this.delay)
  }
}
</script>

<style lang="scss" scoped>
.dashboard-footerbar {
  position: fixed;
  bottom: -70px;
  width: calc(100vw - 65px);
  margin-left: -20px;
  height: 70px;
  background-color: hsla(0,0%,95.7%,.81);
  border-top: 1px dashed rgba(154,153,153,.4);
  transition: all .3s;
  z-index: 1000;
  padding: 15px 30px;
}

.dashboard-footerbar-open {
  bottom: 0;
}
</style>