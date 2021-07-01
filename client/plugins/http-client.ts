import { Plugin } from '@nuxt/types'
import { httpClient, getEscode } from '@/utils/http-client'

const httpClientPlugin: Plugin = (ctx, inject) => {
  inject('httpClient', httpClient)
  inject('getEscode', getEscode)
}

export default httpClientPlugin

declare module 'vue/types/vue' {
  interface Vue {
    $httpClient: typeof httpClient
    $getEscode: typeof getEscode
  }
}