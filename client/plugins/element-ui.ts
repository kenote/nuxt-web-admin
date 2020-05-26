import Vue from 'vue'
import {
  Button,
  DatePicker,
  Input,
  RadioButton,
  RadioGroup
} from 'element-ui'

export default () => {
  Vue.use(Button)
  Vue.use(DatePicker)
  Vue.use(Input)
  Vue.use(RadioButton)
  Vue.use(RadioGroup)
}