import Vue from 'vue'
import {
  Button,
  Carousel,
  CarouselItem,
  Form,
  FormItem,
  Input
} from 'element-ui'

export default () => {
  Vue.use(Button)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)
}