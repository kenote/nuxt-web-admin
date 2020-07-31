import { TaskSpinner } from 'kenote-task-helper'
import * as path from 'path'
import * as inquirer from 'inquirer'
import { createDirectory, confirmRuning, dirChoices } from './util'
import * as runscript from 'runscript'
import * as fs from 'fs-extra'
import { oc } from 'ts-optchain'
import * as UrlParse from 'url-parse'

const developmentRoot: string = path.resolve(process.cwd(), '.deploy/development')
if (!fs.existsSync(developmentRoot)) {
  fs.mkdirpSync(developmentRoot)
}

export async function backup (): Promise<any> {
  try {
    let options: Record<'name', string> = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: '选择一个开发配置',
        choices: dirChoices(developmentRoot, { name: '创建新配置', value: '--> create' })
      }
    ])
    let nameMatch = options.name.match(/^(\-{2}\>{1}\s{1})(\S+)$/)
    if (nameMatch && nameMatch[2] === 'create') {
      options.name = await createDirectory('配置名称')
    }
    let isRuning = await confirmRuning(`您确定要导出当前配置到 ${options.name} 吗？`)
    if (!isRuning) {
      return await TaskSpinner(Promise.resolve(`Exit Finished.`))
    }
    await runscript(`sh ./development.sh ${options.name} backup`)
    await mongodump(options.name)
    return await TaskSpinner(Promise.resolve(`Backup Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}

export async function restore (): Promise<any> {
  try {
    let options: Record<'name', string> = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: '选择一个开发配置',
        choices: dirChoices(developmentRoot)
      }
    ])
    let isRuning = await confirmRuning(`您确定要导入 ${options.name} 到当前配置吗？`)
    if (!isRuning) {
      return await TaskSpinner(Promise.resolve(`Exit Finished.`))
    }
    await runscript(`sh ./development.sh ${options.name} restore`)
    await mongorestore(options.name)
    return await TaskSpinner(Promise.resolve(`Restore Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}

async function mongodump (name: string): Promise<void> {
  let mongodbInfo = await getMongodbInfo()
  if (!mongodbInfo) return
  let { host, port, user, pass, dbname } = mongodbInfo
  let rootDir = path.resolve(developmentRoot, name)
  let auth: string[] = ['']
  if (user) {
    auth.push(`--username ${user}`)
  }
  if (pass) {
    auth.push(`--password ${pass}`)
  }
  fs.removeSync(`${rootDir}/mongodb/${dbname}`)
  await runscript(`mongodump --host ${host} --port ${port} --db ${dbname}${auth.join(' ')} --out ${rootDir}/mongodb/`)
}

async function mongorestore (name: string): Promise<void> {
  let mongodbInfo = await getMongodbInfo()
  if (!mongodbInfo) return
  let { host, port, user, pass, dbname } = mongodbInfo
  let rootDir = path.resolve(developmentRoot, name)
  let auth: string[] = ['']
  if (user) {
    auth.push(`--username ${user}`)
  }
  if (pass) {
    auth.push(`--password ${pass}`)
  }
  if (!fs.existsSync(`${rootDir}/mongodb/${dbname}`)) return
  await runscript(`mongorestore --host ${host} --port ${port} --db ${dbname}${auth.join(' ')} --drop ${rootDir}/mongodb/${dbname}`)
}

async function getMongodbInfo (): Promise<MongodbInfo | undefined> {
  let { mongodb } = await import('~/config')
  let { uris } = oc(mongodb)({ uris: '' })
  if (!uris || uris.length === 0) return
  let url = Array.isArray(uris) ? uris[0] : uris
  let { pathname, hostname, port, username, password } = UrlParse(url)
  let info: MongodbInfo = {
    host: hostname,
    port: Number(port),
    dbname  : pathname?.replace(/^(\/)/i, '')
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