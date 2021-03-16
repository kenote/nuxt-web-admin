import Vue from 'vue'
import {
  Button,
  Carousel,
  CarouselItem,
  Form,
  FormItem,
  Input,
  Message,
  Notification
} from 'element-ui'

export default () => {
  Vue.use(Button)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)

  Vue.prototype.$message = Message
  Vue.prototype.$notify = Notification
}