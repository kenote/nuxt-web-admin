import Vue from 'vue'
import {
  Backtop,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  Carousel,
  CarouselItem,
  Cascader,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Col,
  DatePicker,
  Dialog,
  Drawer,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Form,
  FormItem,
  Icon,
  Input,
  InputNumber,
  Loading,
  Menu,
  MenuItem,
  Message, 
  MessageBox,
  Option,
  Pagination,
  Popover,
  Progress,
  Radio,
  RadioButton,
  RadioGroup,
  Row,
  Select,
  Step,
  Steps,
  Submenu,
  Switch,
  Table,
  TableColumn,
  TabPane,
  Tabs,
  Tag,
  Tooltip,
  Transfer,
  Tree
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'
import Scrollbar from 'element-ui/lib/scrollbar'

export default () => {
  Vue.use(Backtop)
  Vue.use(Breadcrumb)
  Vue.use(BreadcrumbItem)
  Vue.use(Button)
  Vue.use(Card)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(Cascader)
  Vue.use(Checkbox)
  Vue.use(CheckboxButton)
  Vue.use(CheckboxGroup)
  Vue.use(Col)
  Vue.use(DatePicker)
  Vue.use(Dialog)
  Vue.use(Drawer)
  Vue.use(Dropdown)
  Vue.use(DropdownItem)
  Vue.use(DropdownMenu)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Icon)
  Vue.use(Input)
  Vue.use(InputNumber)
  Vue.use(Loading.directive)
  Vue.use(Menu)
  Vue.use(MenuItem)
  Vue.use(Option)
  Vue.use(Pagination)
  Vue.use(Popover)
  Vue.use(Progress)
  Vue.use(Radio)
  Vue.use(RadioButton)
  Vue.use(RadioGroup)
  Vue.use(Row)
  Vue.use(Scrollbar)
  Vue.use(Select)
  Vue.use(Step)
  Vue.use(Steps)
  Vue.use(Submenu)
  Vue.use(Switch)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(TabPane)
  Vue.use(Tabs)
  Vue.use(Tag)
  Vue.use(Tooltip)
  Vue.use(Transfer)
  Vue.use(Tree)

  Vue.component(CollapseTransition.name, CollapseTransition)

  Vue.prototype.$message = Message
  Vue.prototype.$msgbox = MessageBox
  Vue.prototype.$alert = MessageBox.alert
  Vue.prototype.$confirm = MessageBox.confirm
  Vue.prototype.$prompt = MessageBox.prompt
  Vue.prototype.$loading = Loading.service
}