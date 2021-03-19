import Vue from 'vue'
import {
  Autocomplete,
  Avatar,
  Badge,
  Button,
  Carousel,
  CarouselItem,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Form,
  FormItem,
  Icon,
  Input,
  Message,
  Notification,
  Row
} from 'element-ui'

export default () => {
  Vue.use(Autocomplete)
  Vue.use(Avatar)
  Vue.use(Badge)
  Vue.use(Button)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(Col)
  Vue.use(Dropdown)
  Vue.use(DropdownItem)
  Vue.use(DropdownMenu)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Icon)
  Vue.use(Input)
  Vue.use(Row)

  Vue.prototype.$message = Message
  Vue.prototype.$notify = Notification
}