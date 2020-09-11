import Vue from 'vue'
import Fragment from 'vue-fragment'
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import '~/assets/scss/perfect-scrollbar.scss'

export default () => {
  Vue.use(Fragment.Plugin)
  Vue.use(PerfectScrollbar)
}