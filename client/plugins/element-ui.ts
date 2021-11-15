import Vue from 'vue'
import {
  Alert,
  Autocomplete,
  Avatar,
  Backtop,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  Card,
  Carousel,
  CarouselItem,
  Cascader,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Col,
  ColorPicker,
  DatePicker,
  Dialog,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Empty,
  Form,
  FormItem,
  Icon,
  Image,
  Input,
  InputNumber,
  Link,
  Loading,
  Menu,
  MenuItem,
  Message,
  MessageBox,
  Notification,
  Option,
  OptionGroup,
  Pagination,
  Popover,
  Radio,
  RadioButton,
  RadioGroup,
  Rate,
  Row,
  Select,
  Slider,
  Step,
  Steps,
  Submenu,
  Switch,
  Table,
  TableColumn,
  Tabs,
  TabPane,
  Tag,
  TimePicker,
  Tooltip,
  Transfer,
  Tree,
  Upload
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'
import CascaderPanel from 'element-ui/lib/cascader-panel'

export default () => {
  Vue.use(Alert)
  Vue.use(Autocomplete)
  Vue.use(Avatar)
  Vue.use(Backtop)
  Vue.use(Badge)
  Vue.use(Breadcrumb)
  Vue.use(BreadcrumbItem)
  Vue.use(Button)
  Vue.use(ButtonGroup)
  Vue.use(Card)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(Cascader)
  Vue.use(CascaderPanel)
  Vue.use(Checkbox)
  Vue.use(CheckboxButton)
  Vue.use(CheckboxGroup)
  Vue.use(Col)
  Vue.use(ColorPicker)
  Vue.use(DatePicker)
  Vue.use(Dialog)
  Vue.use(Divider)
  Vue.use(Dropdown)
  Vue.use(DropdownItem)
  Vue.use(DropdownMenu)
  Vue.use(Empty)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Icon)
  Vue.use(Image)
  Vue.use(Input)
  Vue.use(InputNumber)
  Vue.use(Link)
  Vue.use(Loading.directive)
  Vue.use(Menu)
  Vue.use(MenuItem)
  Vue.use(Option)
  Vue.use(OptionGroup)
  Vue.use(Pagination)
  Vue.use(Popover)
  Vue.use(Radio)
  Vue.use(RadioButton)
  Vue.use(RadioGroup)
  Vue.use(Rate)
  Vue.use(Row)
  Vue.use(Select)
  Vue.use(Slider)
  Vue.use(Step)
  Vue.use(Steps)
  Vue.use(Submenu)
  Vue.use(Switch)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(Tabs)
  Vue.use(TabPane)
  Vue.use(Tag)
  Vue.use(TimePicker)
  Vue.use(Tooltip)
  Vue.use(Transfer)
  Vue.use(Tree)
  Vue.use(Upload)

  Vue.component(CollapseTransition.name, CollapseTransition)

  Vue.prototype.$message = Message
  Vue.prototype.$notify = Notification
  Vue.prototype.$msgbox = MessageBox
  Vue.prototype.$alert = MessageBox.alert
  Vue.prototype.$confirm = MessageBox.confirm
  Vue.prototype.$prompt = MessageBox.prompt
  Vue.prototype.$loading = Loading.service
}