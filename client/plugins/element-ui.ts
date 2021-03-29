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
  Loading,
  Menu,
  MenuItem,
  Message,
  Notification,
  Row,
  Submenu
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'

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
  Vue.use(Loading.directive)
  Vue.use(Menu)
  Vue.use(MenuItem)
  Vue.use(Row)
  Vue.use(Submenu)

  Vue.component(CollapseTransition.name, CollapseTransition)

  Vue.prototype.$message = Message
  Vue.prototype.$notify = Notification
}