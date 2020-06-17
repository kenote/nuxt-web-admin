import Vue from 'vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Carousel,
  CarouselItem,
  Col,
  DatePicker,
  Drawer,
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
  Radio,
  RadioButton,
  RadioGroup,
  Row,
  Step,
  Steps,
  Submenu,
  Switch
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'

export default () => {
  Vue.use(Breadcrumb)
  Vue.use(BreadcrumbItem)
  Vue.use(Button)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(Col)
  Vue.use(DatePicker)
  Vue.use(Drawer)
  Vue.use(Dropdown)
  Vue.use(DropdownItem)
  Vue.use(DropdownMenu)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)
  Vue.use(Loading.directive)
  Vue.use(Menu)
  Vue.use(MenuItem)
  Vue.use(Radio)
  Vue.use(RadioButton)
  Vue.use(RadioGroup)
  Vue.use(Row)
  Vue.use(Step)
  Vue.use(Steps)
  Vue.use(Submenu)
  Vue.use(Switch)

  Vue.component(CollapseTransition.name, CollapseTransition)

  Vue.prototype.$message = Message
  Vue.prototype.$msgbox = MessageBox
  Vue.prototype.$alert = MessageBox.alert
  Vue.prototype.$confirm = MessageBox.confirm
  Vue.prototype.$prompt = MessageBox.prompt
  Vue.prototype.$loading = Loading.service
}