
import jsYaml from 'js-yaml'
import { IncomingHttpHeaders } from 'http'
import { merge, isString } from 'lodash'
import { WebSocketMessage } from '@/types/services/http'

class WebSocketClient {

  private __client: WebSocket
  private __headers: IncomingHttpHeaders = {}

  constructor (url: string) {
    let client = new WebSocket(url)
    this.__client = client
    this.init()
  }

  set headers (value: any) {
    this.__headers = value
  }

  get headers () {
    return this.__headers
  }

  private init () {
    let client = this.__client
    // 接收消息
    client.onmessage = evt => {
      if (isString(evt.data)) {
        this.onMessage(jsYaml.load(evt.data))
      }
      else {
        this.onMessage(evt.data)
      }
      
    }
    // 监听错误
    client.onerror = evt => {
      console.log('error', evt)
    }
    // 监听关闭连接
    client.onclose = evt => {
      console.log('close', evt)
    }
  }

  /**
   * 发送数据
   * @param path 
   * @param data 
   */
  send (path: string, data: Record<string, any>) {
    let client = this.__client
    client.onopen = evt => {
      // 连接成功
      if (client.readyState === client.OPEN) {
        // client.send
        let info = jsYaml.dump({
          headers: merge(this.__headers, { path }),
          payload: data
        })
        client.send(info)
      }
    }
  }

  /**
   * 接收数据
   * @param data 
   */
  onMessage (data: WebSocketMessage.Response) {
    // return data
  }

  /**
   * 关闭连接
   */
  close () {
    let client = this.__client
    client.close()
  }
}

export const webSocketClient = (url: string) => new WebSocketClient(url)