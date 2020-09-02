import Vue from 'vue'
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'

export default () => {
  Vue.component('VueCropper', VueCropper)
}