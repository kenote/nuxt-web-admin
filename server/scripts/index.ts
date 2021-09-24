import path from 'path'
import UrlParse from 'url-parse'

export const rootDir = path.resolve(process.cwd(), 'backup')
export const tempDir = path.resolve(rootDir, '__temp')

export function getMongodbInfo (uri: string) {
  let { pathname, hostname, port, username, password } = UrlParse(uri)
  let info: MongodbInfo = {
    host: hostname,
    port: Number(port),
    dbname: pathname?.replace(/^(\/)/i, '')
  }
  if (username) {
    info.user = username
  }
  if (password) {
    info.pass = password
  }
  return info
}

interface MongodbInfo {
  host     : string
  port     : number
  user    ?: string
  pass    ?: string
  dbname   : string
}