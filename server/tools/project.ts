import { TaskSpinner } from 'kenote-task-helper'
import * as path from 'path'
import * as inquirer from 'inquirer'
import { dirChoices } from './util'
import * as fs from 'fs-extra'
import * as runscript from 'runscript'
import { trim } from 'lodash'
import ditchProxy from '~/proxys/ditch'
import planProxy from '~/proxys/plan'
import protoProxy from '~/proxys/proto'
import teamProxy from '~/proxys/team'
import { ResponseTeamDocument } from '@/types/proxys/team'
import groupProxy from '~/proxys/group'
import { ResponseGroupDocument } from '@/types/proxys/group'
import { oc } from 'ts-optchain'

const projectRoot: string = path.resolve(process.cwd(), 'projects')
if (!fs.existsSync(projectRoot)) {
  fs.mkdirpSync(projectRoot)
}

export async function updtaeProject (): Promise<any> {
  let projectChoices = dirChoices(projectRoot).filter( o => {
    let install = path.resolve(projectRoot, o.value, 'install.ts')
    return fs.existsSync(install)
  })
  try {
    let options: Record<'name', string> = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: '选择一个项目更新',
        choices: projectChoices
      }
    ])
    await runscript(`ts-node --project server/tsconfig.json ./projects/${options.name}/install.ts`)
    return await TaskSpinner(Promise.resolve(`Update Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}

export async function conversionLabel (): Promise<any> {

  try {
    let options: Record<'name' | 'new_name', string> = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: '选择一个项目转换',
        choices: dirChoices(projectRoot)
      },
      {
        type: 'input',
        name: 'new_name',
        message: '请填写新的标签名字',
        validate (val: string): string | true {
          if (!trim(val)) {
            return `请填写新的标签名字`
          }
          return true
        }
      }
    ])
    fs.renameSync(path.resolve(projectRoot, options.name), path.resolve(projectRoot, options.new_name))
    await ditchProxy().Dao.update({ channel: options.name }, { channel: options.new_name })
    await planProxy().Dao.update({ channel: options.name }, { channel: options.new_name })
    await protoProxy().Dao.update({ channel: options.name }, { channel: options.new_name })
    
    await updateTeam(options.name, options.new_name)
    await updateGroup(options.name, options.new_name)
    return await TaskSpinner(Promise.resolve(`Conversion Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}

async function updateTeam (name: string, new_name: string): Promise<void> {
  let teams = await teamProxy().Dao.find({ access: new RegExp(`^\/project\/${name}`) }) as ResponseTeamDocument[]
  for (let team of teams) {
    await teamProxy().Dao.updateOne({ _id: team._id }, { access: replaceAccess(team, new RegExp(`^\/project\/${name}`), `/project/${new_name}`)})
  }
}

async function updateGroup (name: string, new_name: string): Promise<void> {
  let groups = await groupProxy().Dao.find({ access: new RegExp(`^\/project\/${name}`) }) as ResponseGroupDocument[]
  for (let group of groups) {
    await groupProxy().Dao.updateOne({ _id: group._id }, { access: replaceAccess(group, new RegExp(`^\/project\/${name}`), `/project/${new_name}`)})
  }
}

function replaceAccess (doc: ResponseTeamDocument | ResponseGroupDocument, search: RegExp, replace: string): string[] {
  let { access } = doc
  return oc(access)([]).map( o => o.replace(search, replace))
}