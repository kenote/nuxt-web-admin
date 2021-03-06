import redis from 'redis'
import mongoose from 'mongoose'
import { MetaInfo } from 'vue-meta'
import { RegisterDocument } from '@/types/services/db/user'

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
   * 站点名称
   */
  siteName            ?: string
  /**
   * 站点链接
   */
  siteUrl             ?: string
  /**
   * secret
   */
  secretKey            : string
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
  /**
   * MetaInfo
   */
  metaInfo            ?: MetaInfo
  /**
   * 可查看文件类型表
   */
  previewTypes       ?: ServerConfigure.FileType[]
  /**
   * 
   */
  initialAccount      : RegisterDocument
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

  interface FileType {
    type       : string
    extname    : string[]
  }
}