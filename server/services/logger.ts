import path from 'path'
import bytes from 'bytes'
import { configure, getLogger } from 'log4js'
import { loadConfig } from '@kenote/config'
import { ServerConfigure } from '@/types/config'

const { secretKey } = loadConfig<ServerConfigure>('config/server', { mode: 'merge' })
const logDir = path.resolve(process.cwd(), 'logs')
const env = process.env.NODE_ENV ?? 'development'

configure({
  appenders: {
    out: { type: 'stdout' },
    app: {
      type: 'dateFile',
      filename: path.resolve(logDir, `${env}/bak`),
      pattern: 'yyyy-MM-dd-hh.log',
      alwaysIncludePattern: true
    },
    file: {
      type: 'file',
      filename: path.resolve(logDir, `${env}.log`),
      maxLogSize: bytes.parse('10MB'),
      backups: 5,
      compress: true,
      encoding: 'utf-8',
      mode: 0o0640,
      flags: 'w+'
    }
  },
  categories: {
    default: {
      appenders: ['out'],
      level: 'info'
    },
    cheese: {
      appenders: ['out', 'app', 'file'],
      level: 'all'
    },
    development: {
      appenders: ['out', 'app', 'file'],
      level: 'all'
    },
    production: {
      appenders: ['out', 'app', 'file'],
      level: 'all'
    }
  },
  pm2: true,
  pm2InstanceVar: secretKey ?? 'INSTANCE_ID',
  disableClustering: true
})

export default getLogger(env)

export const rootDir = path.resolve(logDir, env)