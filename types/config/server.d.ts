import redis from 'redis'
import mongoose from 'mongoose'

export declare interface ServerConfigure {
  /**
   * 名称
   */
  name                 : string
  /**
   * 服务器IP
   */
  host                 : string
  /**
   * 服务器端口
   */
  port                 : number
  /**
   * secret
   */
  secret               : string
  /**
   * Redis 配置
   */
  redisOpts           ?: redis.ClientOpts
  /**
   * MongoDB 配置
   */
  mongoOpts           ?: ServerConfigure.mongodb
  /**
   * 生产环境下使用 ts-node 运行
   */
  tsnode              ?: true
}

export declare namespace ServerConfigure {
  /**
   * MongoDB 配置
   */
  interface mongodb {
    /**
     * 连接 URI
     */
    uris       : string
    /**
     * 连接选项
     */
    options   ?: mongoose.ConnectionOptions
  }
}