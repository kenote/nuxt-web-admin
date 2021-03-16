import { Component, mixins, Provide } from 'nuxt-property-decorator'
import BaseMixin from './base'
import { HttpClientOptions } from '@/utils/http-client'

@Component<PageMixin>({
  name: 'page-mixin',
  created () {
    this.httpOptions = {
      token: this.token
    }
  }
 })
 export default class PageMixin extends mixins(BaseMixin) {
 
   @Provide()
   loading: boolean = false

   @Provide()
   times: number = 0

   @Provide()
   httpOptions: HttpClientOptions = {}

   sendWait (step: number) {
     this.times = step
     let timer: NodeJS.Timeout | null = setInterval(() => {
       this.times --
       if (this.times <= 0) {
         clearTimeout(timer!)
         timer = null
       }
     }, 1000)
   }
   
 }