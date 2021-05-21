<template>
  <fragment>
    <div ref="theDrawer" class="web-drawer" :style="styles" v-bind:class="placement">
      <div v-if="title" class="header"><span>{{ title }}</span></div>
      <slot></slot>
    </div>
    <div ref="theBackDrop" v-show="visible" class="web-drawer-backdrop"></div>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { get } from 'lodash'

@Component<WebDrawer>({
  name: 'web-drawer',
  created () {
    this.getStyles(this.width)
  }
})
export default class WebDrawer extends Vue {

  @Prop({ default: 'right' })
  placement!: 'top' | 'bottom' | 'left' | 'right'

  @Prop({ default: 360 })
  width!: number

  @Prop({ default: false })
  visible!: boolean

  @Prop({ default: false })
  lock!: boolean

  @Prop({ default: undefined })
  title!: string

  @Provide()
  styles: Record<string, string> = {}

  @Watch('width')
  onChangeWidth (val: number, oldVal: number) {
    if (val === oldVal) return
    this.getStyles(val)
  }

  @Watch('visible')
  onChangeVisible (val: boolean, oldVal: boolean) {
    if (val === oldVal) return
    if (this.visible) {
      document.addEventListener('click', this.handleClick, true)
      this.styles = { ...this.styles, [this.placement]: ['top'].includes(this.placement) ? '54px' : '0' }
    }
    else {
      document.removeEventListener('click', this.handleClick, false)
      this.styles = { ...this.styles, [this.placement]: `-${this.width}px` }
    }
  }

  handleClick (evt: MouseEvent) {
    if (this.lock) return
    let drawer = this.$refs['theDrawer'] as HTMLElement
    let paths = get(evt, 'path').map( el =>  el.className )
    if (!paths.includes(drawer?.className ?? '')) {
      this.visible && this.$emit('close', null)
    }
  }

  getStyles (width: number) {
    let size = ['top', 'bottom'].includes(this.placement) ? 'height' : 'width'
    this.styles = {
      [size]: `${width}px`,
      [this.placement]: `-${width}px`
    }
  }
}
</script>

<style lang="scss" >
.web-drawer {
  position: fixed;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  transition: all .5s;
  background-color: #ffffff;
  z-index: 1001;
  display: flex;
  flex-direction: column;

  &.top {
    top: 54px;
    left: 0;
    right: 0;
  }

  &.bottom {
    bottom: 0;
    left: 0;
    right: 0;
  }

  &.left {
    top: 54px;
    bottom: 0;
    left: 0;
  }

  &.right {
    top: 54px;
    bottom: 0;
    right: 0;
  }

  &>.header {
    height: 40px;
    min-height: 40px;
    border-bottom: 1px solid #e4e4e4;
    display: flex;
    justify-content: center;
    background-color: #f4f6f7;
    align-items: center;
    color: #666;

    span {
      font-size: 14px;
    }
  }

  .main {
    flex: 1;
    overflow-y: auto;
  }

  &>.container {
    height: 100%;
    display: flex;
    flex-direction: column;

    .drawer__header {
      height: 50px;
      background-color: transparent;
      color: #545454;
      border: 0;
      text-align: inherit;
      padding: 20px 20px 0;
      line-height: 1;
      // margin-bottom: 20px;

      span {
        font-size: 16px;
        font-weight: 400;
      }
    }

    .drawer__bodyer {
      // height: calc(100% - 70px);
      padding: 15px 20px;
    }
  }
}
.web-drawer-backdrop {
  position: fixed;
  top: 54px;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #000000;
  transition: all .5s;
  opacity: .4;
  z-index: 1000;
}
</style>