import { TaskSpinner } from 'kenote-task-helper'
import * as path from 'path'
import { createDirectory, confirmRuning } from './util'
import * as runscript from 'runscript'
import * as fs from 'fs-extra'

const releaseRoot: string = path.resolve(process.cwd(), '.deploy/release')
if (!fs.existsSync(releaseRoot)) {
  fs.mkdirpSync(releaseRoot)
}

export async function release (): Promise<any> {
  try {
    let name = await createDirectory('Release名称', (value: string) => {
      let releaseDir = path.resolve(releaseRoot, value)
      if (fs.existsSync(releaseDir)) {
        return 'Release 目录已存在.'
      }
      return true
    })
    let isRuning = await confirmRuning(`您确定要创建 Release 版本 ${name} 吗？`) 
    if (!isRuning) {
      return await TaskSpinner(Promise.resolve(`Exit Finished.`))
    }
    await runscript(`sh ./release.sh ${name} create`)
    return await TaskSpinner(Promise.resolve(`Release Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}