import Vue from 'vue'
import Fragment from 'vue-fragment'
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import '~/assets/scss/perfect-scrollbar.scss'
import Clipboard from 'v-clipboard'
import Cropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'

export default () => {
  Vue.use(Fragment.Plugin)
  Vue.use(PerfectScrollbar)
  Vue.use(Clipboard)
  Vue.component('Cropper', Cropper)
}