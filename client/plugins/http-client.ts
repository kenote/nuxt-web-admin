import { Plugin } from '@nuxt/types'
import { httpClient } from '@/utils/http-client'

const httpClientPlugin: Plugin = (ctx, inject) => {
  inject('httpClient', httpClient)
}

export default httpClientPlugin

declare module 'vue/types/vue' {
  interface Vue {
    $httpClient: typeof httpClient
  }
}