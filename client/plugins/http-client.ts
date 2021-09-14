import { Plugin } from '@nuxt/types'
import { httpClient, getEscode } from '@/utils/http-client'
import FileSaver from 'file-saver'



const httpClientPlugin: Plugin = (ctx, inject) => {
  inject('httpClient', httpClient)
  inject('getEscode', getEscode)
  inject('fileSave', FileSaver.saveAs)
}

export default httpClientPlugin

declare module 'vue/types/vue' {
  interface Vue {
    $httpClient: typeof httpClient
    $getEscode: typeof getEscode
    $fileSave: typeof FileSaver.saveAs
  }
}