import { Plugin } from '@nuxt/types'
import { httpClient, getEscode } from '@/utils/http-client'
import FileSaver from 'file-saver'
import { webSocketClient } from '@/utils/websocket'

const httpClientPlugin: Plugin = (ctx, inject) => {
  inject('httpClient', httpClient)
  inject('getEscode', getEscode)
  inject('fileSave', FileSaver.saveAs)
  inject('websocket', webSocketClient)
}

export default httpClientPlugin

declare module 'vue/types/vue' {
  interface Vue {
    $httpClient: typeof httpClient
    $getEscode: typeof getEscode
    $fileSave: typeof FileSaver.saveAs
    $websocket: typeof webSocketClient
  }
}