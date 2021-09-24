import { loadConfig } from '@kenote/config'
import { ServerConfigure } from '@/types/config'
import path from 'path'
import runscript from 'runscript'
import { archiver } from '~/services'
import dayjs from 'dayjs'
import { rootDir, tempDir, getMongodbInfo } from '.'

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
  try {
    // 创建临时目录
    await runscript(`rm -rfv ${tempDir} && mkdir -p ${tempDir}`)
    // 备份配置/项目
    await runscript(`cp -r ./config/. ${path.resolve(tempDir, 'config')}`)
    await runscript(`cp -r ./project/. ${path.resolve(tempDir, 'project')}`)
    // 备份数据库
    await runscript(`mongodump --host ${host} --port ${port} --db ${dbname}${auth.join(' ')} --out ${tempDir}/mongodb/`)
    // 打压缩包
    let zipfile = path.resolve(rootDir, dayjs().format('YYYY-MM-DDTHHmmss') + '.tar.gz')
    await archiver.zip(zipfile, ['**'], { cwd: tempDir, nodir: true, realpath: true })
    // 清除临时目录
    await runscript(`rm -rfv ${tempDir}`)
  } catch (error) {
    console.error(error)
  }
  process.exit(0)
}

bootstrap()