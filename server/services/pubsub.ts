import IORedis from 'ioredis'
import { isBuffer, isArray } from 'lodash'
import jsYaml from 'js-yaml'

/**
 * 发布订阅器
 */
class PubSub {

  private __sub: IORedis.Redis
  private __pub: IORedis.Redis

  constructor () {
    this.__sub = new IORedis()
    this.__pub = new IORedis()
  }

  /**
   * 发布消息
   * @param message 
   * @param data 
   */
  publish (message: string, data: any) {
    if (isBuffer(data)) {
      return this.__pub.publishBuffer(message, data)
    }
    return this.__pub.publish(message, jsYaml.dump(data))
  }

  /**
   * 订阅消息
   * @param message 
   * @param next 
   */
  subscribe (message: string | string[], next: (message: string, data: any) => void) {
    this.__sub.on('message', (name: string, data: any) => {
      if (isBuffer(data)) {
        return next(name, data)
      }
      return next(name, jsYaml.load(data))
    })
    let args = isArray(message) ? message : [ message ]
    return this.__sub.subscribe(...args)
  }
}

export default new PubSub()