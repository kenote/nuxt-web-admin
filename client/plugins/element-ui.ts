import Vue from 'vue'
import {
  Button,
  Carousel,
  CarouselItem,
  DatePicker,
  Form,
  FormItem,
  Input,
  Loading,
  Message, 
  MessageBox,
  RadioButton,
  RadioGroup
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'

export default () => {
  Vue.use(Button)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
  Vue.use(DatePicker)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)
  Vue.use(Loading.directive)
  Vue.use(RadioButton)
  Vue.use(RadioGroup)

  Vue.component(CollapseTransition.name, CollapseTransition)

  Vue.prototype.$message = Message
  Vue.prototype.$msgbox = MessageBox
  Vue.prototype.$alert = MessageBox.alert
  Vue.prototype.$confirm = MessageBox.confirm
  Vue.prototype.$prompt = MessageBox.prompt
  Vue.prototype.$loading = Loading.service
}