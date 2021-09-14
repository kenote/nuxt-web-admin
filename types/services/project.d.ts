import { Method, FilterQuery, RequestConfig } from '@kenote/common'
import { HttpClientOptions } from '@/types/client'
import { Configure } from '@/server/services/protobuf'
import { TCPSocket } from '@kenote/protobuf'
import { filterData, FilterData, ParseData } from 'parse-string'

export declare namespace Project {

  interface NextPayload {
    tcpSocket            : Configure
    options              : API
    payload             ?: Record<string, any> 
  }

  interface API {
    /**
     * 接口名称
     */
    name                 : string
    /**
     * 接口描述
     */
    description         ?: string
    /**
     * 路由配置
     */
    router               : Router[]
    /**
     * HTTP代理设置
     */
    proxy               ?: HttpProxy
    /**
     * TCPSocket设置
     */
    tcpSocket           ?: TCPSocket.Configure
    /**
     * 消息体选项
     */
    message             ?: MessageOptions
    /**
     * 请求验证器
     */
    payload             ?: FilterData.options[]
    /**
     * 参数映射
     */
    props               ?: Record<string, string> 
    /**
     * 鉴权配置
     */
    authentication      ?: Authentication[]
    /**
     * 数据解析器
     */
    parse               ?: ParseData.parse[]
    /**
     * 指定解析字段
     */
    parseField          ?: string
    /**
     * 使用原生模式
     */
    native              ?: boolean
  }

  /**
   * HTTP代理设置
   */
  interface HttpProxy {
    /**
     * 请求 Method
     */
    method              ?: Method
    /**
     * 请求 URL
     */
    url                  : string
    /**
     * Http 选项
     */
    options             ?: HttpClientOptions
  }

  /**
   * 鉴权配置
   */
  interface Authentication {
    /**
     * 类型
     */
    type                 : 'jwt' | 'sign'
    /**
     * JWT选项
     */
    jwt                 ?: FilterQuery<any>
    /**
     * 验签选项
     */
    sign                ?: SignOptions
  }

  /**
   * 验签选项
   */
  interface SignOptions {
    /**
     * 验签密钥
     */
    token               ?: string
    /**
     * 验签格式
     */
    md5                  : string
    /**
     * 验签字段名称；默认 sign
     */
    field               ?: string
    /**
     * 调试模式
     */
    debug               ?: boolean
  }

  /**
   * 路由配置
   */
  interface Router {
    /**
     * 请求方式
     */
    method               : Method
    /**
     * 请求路径
     */
    path                 : string
  }

  /**
   * 接口消息体选项
   */
  interface MessageOptions {
    /**
     * 消息号
     */
    msgtype              : number
    /**
     * 请求消息类型
     */
    requestType         ?: string
    /**
     * 返回消息类型
     */
    responseType        ?: string
    /**
     * 指定服务器标签
     */
    serverTag           ?: string
  }
}