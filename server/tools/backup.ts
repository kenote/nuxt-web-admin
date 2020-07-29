import { TaskSpinner } from 'kenote-task-helper'
import * as path from 'path'
import * as inquirer from 'inquirer'
import { createDirectory, confirmRuning, dirChoices } from './util'
import * as runscript from 'runscript'

const developmentRoot: string = path.resolve(process.cwd(), '.deploy/development')

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
    return await TaskSpinner(Promise.resolve(`Restore Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}
