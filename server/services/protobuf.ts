import { TCPSocket } from '@kenote/protobuf'
import { TcpSocketConnectOpts } from 'net'
import { omit } from 'lodash'
import logger from './logger'

export interface Configure {
  /**
   * TCPSocket 配置
   */
  TcpSocket: TCPSocket.Configure
  /**
   * 服务器列表
   */
  Server: Array<TcpSocketConnectOpts & { key: string }>
  /**
   * 设置白名单
   */
  whitelist?: string
}

/**
 * 封装 TCP 请求
 * @param msgtype 
 * @param payload 
 * @param requestType 
 */
export function request<T> (msgtype: number, payload: Record<string, any>, requestType?: string) {
  return async (options: Configure, tag?: string) => {
    options.TcpSocket.logger = logger
    let { TcpSocket, Server } = options
    let client = new TCPSocket(TcpSocket)
    if (tag) {
      let connectOpts = Server.find( r => r.key.toLowerCase() === tag.toLowerCase() )
      if (connectOpts) {
        client.connect(omit(connectOpts, ['key']))
      }
    }
    logger.info(payload)
    try {
      let result = await client.encode(msgtype, payload, requestType!).send<T>(true)
      logger.info(result)
      return result
    } catch (error) {
      logger.error(error?.message)
    }
  }
}