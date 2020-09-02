<template>
  <client-only placeholder="Cropper Loading...">
    <vue-cropper ref="cropper"
      :src="src"
      :containerStyle="containerStyle"
      :imgStyle="{  }"
      :view-mode="options.viewMode"
      :drag-mode="options.dragMode"
      :initial-aspect-ratio="options.initialAspectRatio"
      :aspect-ratio="options.aspectRatio"
      :data="options.data"
      :preview="options.preview"
      :responsive="options.responsive"
      :restore="options.restore"
      :check-cross-origin="options.checkCrossOrigin"
      :check-orientation="options.checkOrientation"
      :modal="options.modal"
      :guides="options.guides"
      :center="options.center"
      :highlight="options.highlight"
      :background="options.background"
      :auto-crop="options.autoCrop"
      :auto-crop-area="options.autoCropArea"
      :movable="options.movable"
      :rotatable="options.rotatable"
      :scalable="options.scalable"
      :zoomable="options.zoomable"
      :zoom-on-touch="options.zoomOnTouch"
      :zoom-on-wheel="options.zoomOnWheel"
      :wheel-zoom-ratio="options.wheelZoomRatio"
      :crop-box-movable="options.cropBoxMovable"
      :crop-box-resizable="options.cropBoxResizable"
      :toggle-drag-mode-on-dblclick="options.toggleDragModeOnDblclick"
      :min-container-width="options.minContainerWidth"
      :min-container-height="options.minContainerHeight"
      :min-canvas-width="options.minCanvasWidth"
      :min-canvas-height="options.minCanvasHeight"
      :min-crop-box-width="options.minCropBoxWidth"
      :min-crop-box-height="options.minCropBoxHeight"
      />
  </client-only>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'nuxt-property-decorator'
import { VueCropperProps, VueCropperMethods, CroppedCanvasOptions } from 'vue-cropperjs'

@Component<DashboardCropper>({
  name: 'dashboard-cropper',
  mounted () {
    this.options = { ...this.options, ...this.cropperOptions }
  }
})
export default class DashboardCropper extends Vue {

  @Prop({ default: '' }) src!: string
  @Prop({ default: undefined }) containerStyle!: Record<string, any>
  @Prop({ default: undefined }) cropperOptions!: Record<string,any>

  @Watch('cropperOptions')
  onCropperOptionsChange (val: Record<string,any>, oldVal: Record<string,any>): void {
    this.options = { ...this.options, ...val }
  }

  @Provide() options: any = {
    
    /**
     * 视图模式
     * - 0 无限制
     * - 1 限制裁剪框不能超出图片的范围
     * - 2 限制裁剪框不能超出图片的范围 且图片填充模式为 cover 最长边填充
     * - 3 限制裁剪框不能超出图片的范围 且图片填充模式为 contain 最短边填充
     */
    viewMode: 0,
    /**
     * 拖拽图片模式
     * - crop 形成新的裁剪框
     * - move 图片可移动
     * - none 什么也没有
     */
    dragMode: 'crop',
    /**
     * 裁剪框宽高比的初始值 默认与图片宽高比相同 只有在aspectRatio没有设置的情况下可用
     */
    initialAspectRatio: 1,
    /**
     * 设置裁剪框为固定的宽高比
     */
    aspectRatio: 1,
    /**
     * 之前存储的裁剪后的数据 在初始化时会自动设置 只有在autoCrop设置为true时可用
     */
    data: null,
    /**
     * 预览 设置一个区域容器预览裁剪后的结果
     * Element, Array (elements), NodeList or String (selector)
     */
    preview: '',
    /**
     * 在窗口尺寸调整后 进行响应式的重渲染 默认true
     */
    responsive: true,
    /**
     * 在窗口尺寸调整后 恢复被裁剪的区域 默认true
     */
    restore: true,
    /**
     * 检查图片是否跨域 默认true 如果是 会在被复制的图片元素上加上属性crossOrigin 并且在src上加上一个时间戳 避免重加载图片时因为浏览器缓存而加载错误
     */
    checkCrossOrigin: true,
    /**
     * 检查图片的方向信息（仅JPEG图片有）默认true 在旋转图片时会对图片方向值做一些处理 以解决IOS设备上的一些问题
     */
    checkOrientation: true,
    /**
     * 是否显示图片和裁剪框之间的黑色蒙版 默认true
     */
    modal: true,
    /**
     * 是否显示裁剪框的虚线 默认true
     */
    guides: true,
    /**
     * 是否显示裁剪框中间的 ‘+’ 指示器 默认true
     */
    center: true,
    /**
     * 是否显示裁剪框上面的白色蒙版 （很淡）默认true
     */
    highlight: true,
    /**
     * 是否在容器内显示网格状的背景 默认true
     */
    background: true,
    /**
     * 允许初始化时自动的裁剪图片 配合 data 使用 默认true
     */
    autoCrop: true,
    /**
     * 设置裁剪区域占图片的大小 值为 0-1 默认 0.8 表示 80%的区域
     */
    autoCropArea: 0.8,
    /**
     * 是否可以移动图片 默认true
     */
    movable: true,
    /**
     * 是否可以旋转图片 默认true
     */
    rotatable: true,
    /**
     * 是否可以缩放图片（可以改变长宽） 默认true
     */
    scalable: true,
    /**
     * 是否可以缩放图片（改变焦距） 默认true
     */
    zoomable: true,
    /**
     * 是否可以通过拖拽触摸缩放图片 默认true
     */
    zoomOnTouch: true,
    /**
     * 是否可以通过鼠标滚轮缩放图片 默认true
     */
    zoomOnWheel: true,
    /**
     * 设置鼠标滚轮缩放的灵敏度 默认 0.1
     */
    wheelZoomRatio: 0.1,
    /**
     * 是否可以拖拽裁剪框 默认true
     */
    cropBoxMovable: true,
    /**
     * 是否可以改变裁剪框的尺寸 默认true
     */
    cropBoxResizable: true,
    /**
     * 是否可以通过双击切换拖拽图片模式（move和crop）默认true 当拖拽图片模式为none时不可切换 该设置必须浏览器支持双击事件
     */
    toggleDragModeOnDblclick: true,
    /**
     * 容器最小宽度
     */
    minContainerWidth: 200,
    /**
     * 容器最小高度
     */
    minContainerHeight: 100,
    /**
     * 图片最小宽度
     */
    minCanvasWidth: 0,
    /**
     * 图片最小高度
     */
    minCanvasHeight: 0,
    /**
     * 裁剪框最小宽度
     */
    minCropBoxWidth: 0,
    /**
     * 裁剪框最小高度
     */
    minCropBoxHeight: 0,
  }

  replace (url: string): void {
    let cropper = this.$refs['cropper'] as unknown as VueCropperMethods
    if (cropper) {
      cropper.replace(url)
    }
  }

  getCroppedCanvas (options?: CroppedCanvasOptions): HTMLCanvasElement | null {
    let cropper = this.$refs['cropper'] as unknown as VueCropperMethods
    if (cropper) {
      return cropper.getCroppedCanvas(options)
    }
    return null
  }

  scale(scaleX: number, scaleY?: number | undefined): void {
    let cropper = this.$refs['cropper'] as unknown as VueCropperMethods
    if (cropper) {
      cropper.scale(scaleX, scaleY)
    }
  }
}
</script>