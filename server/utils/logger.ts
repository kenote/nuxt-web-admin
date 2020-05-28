import * as path from 'path'
import * as bytes from 'bytes'
import * as log4js from 'log4js'
import { session_secret } from '~/config'

const env: string = process.env.NODE_ENV || 'development'
const logDir: string = path.resolve(process.cwd(), 'logs')

log4js.configure({
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
  pm2InstanceVar: session_secret || 'INSTANCE_ID',
  disableClustering: true
})

export default log4js.getLogger(env)