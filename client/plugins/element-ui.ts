import Vue from 'vue'
import {
  Button,
  Carousel,
  CarouselItem,
  Col,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Form,
  FormItem,
  Input,
  Loading,
  Menu,
  MenuItem,
  Message, 
  MessageBox,
  RadioButton,
  RadioGroup,
  Row,
  Submenu
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'

export default () => {
  Vue.use(Button)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(Col)
  Vue.use(DatePicker)
  Vue.use(Dropdown)
  Vue.use(DropdownItem)
  Vue.use(DropdownMenu)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)
  Vue.use(Loading.directive)
  Vue.use(Menu)
  Vue.use(MenuItem)
  Vue.use(RadioButton)
  Vue.use(RadioGroup)
  Vue.use(Row)
  Vue.use(Submenu)

  Vue.component(CollapseTransition.name, CollapseTransition)

  Vue.prototype.$message = Message
  Vue.prototype.$msgbox = MessageBox
  Vue.prototype.$alert = MessageBox.alert
  Vue.prototype.$confirm = MessageBox.confirm
  Vue.prototype.$prompt = MessageBox.prompt
  Vue.prototype.$loading = Loading.service
}