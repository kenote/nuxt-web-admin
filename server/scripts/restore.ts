import { loadConfig } from '@kenote/config'
import { ServerConfigure } from '@/types/config'
import path from 'path'
import fs from 'fs'
import runscript from 'runscript'
import { rootDir, tempDir, getMongodbInfo } from '.'
import { ErrorCode, httpError } from '~/services/error'

async function bootstrap () {
  let { mongoOpts } = loadConfig<ServerConfigure>('config/server', { mode: 'merge' })
  let { host, port, user, pass, dbname } = getMongodbInfo(mongoOpts?.uris!)
  let auth: string[] = ['']
  if (user) {
    auth.push(`--username ${user}`)
  }
  if (pass) {
    auth.push(`--password ${pass}`)
  }
  let [ ,,zipfile ] = process.argv
  try {
    // 创建临时目录
    await runscript(`rm -rfv ${tempDir} && mkdir -p ${tempDir}`)
    // 解压文件到临时目录
    if (!fs.existsSync(path.resolve(rootDir, zipfile))) {
      throw httpError(ErrorCode.ERROR_CUSTOMIZE_DATA, [`${zipfile} 文件不存在`])
    }
    await runscript(`tar -zxvf ${path.resolve(rootDir, zipfile)} -C ${tempDir}`)
    let [ dbfilename ] = fs.readdirSync(path.resolve(tempDir, 'mongodb')).filter( r => fs.statSync(path.resolve(tempDir, 'mongodb', r)).isDirectory() )
    // 还原数据库
    if (dbfilename) {
      await runscript(`mongorestore --host ${host} --port ${port} --db ${dbname}${auth.join(' ')} --drop ${tempDir}/mongodb/${dbfilename}`)
    }
    // 还原配置/项目
    await runscript(`rsync -av ${path.resolve(tempDir, 'config')}/ ${path.resolve(process.cwd(), 'config')}/ --delete`)
    await runscript(`rsync -av ${path.resolve(tempDir, 'project')}/ ${path.resolve(process.cwd(), 'project')}/ --delete`)
    // 清除临时目录
    await runscript(`rm -rfv ${tempDir}`)
  } catch (error) {
    console.error(error)
  }
  process.exit(0)
}

bootstrap()