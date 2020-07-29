import * as path from 'path'
import * as fs from 'fs-extra'
import * as inquirer from 'inquirer'
import { Dictionary, trim, zipObject, isEmpty, isRegExp } from 'lodash'
import { TaskSpinner } from 'kenote-task-helper'
import { Rule } from '@/types/restful'
import { oc } from 'ts-optchain'
import { format } from 'util'

export type ChoiceType = Record<'name' | 'value', string>

export async function createDirectory (name: string): Promise<string> {
  let options: Record<'name', string> = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: `请填写${name}`,
      validate (val: string): string | true {
        if (!trim(val)) {
          return `请填写${name}`
        }
        return true
      }
    }
  ])
  return options.name
}

export async function confirmRuning (message: string): Promise<boolean> {
  let options: Record<'runing', boolean> = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'runing',
      message,
      default: false
    }
  ])
  return options.runing
}

export function dirChoices (dir: string, opts?: ChoiceType): ChoiceType[] {
  let choices: ChoiceType[] = []
  let dirs = fs.readdirSync(dir)
  for (let item of dirs) {
    let stat = fs.statSync(path.resolve(dir, item))
    if (stat.isDirectory() && !/^(\.)/.test(item)) {
      choices.push({ name: item, value: item })
    }
  }
  opts && choices.push(opts)
  return choices
}

export function getArgvs (argv: string[]): any[] {
  let arr = argv.map( o => o.replace(/^(\-){2}/, '')).slice(2).map( o => /\=/.test(o) ? o.split('=') : o )
  let key = arr[0] as string
  let props = arr.slice(1).map( o => o[0] )
  let values = arr.slice(1).map( o => o[1] )
  let __argv: any[] = []
  if (key) {
    __argv.push(key)
  }
  let options: Dictionary<any> = zipObject(props, values)
  if (!isEmpty(options)) {
    __argv.push(options)
  }
  return __argv
}

export async function runScript (promptFunc: () => Promise<any>, notPromptFunc: (opts: Dictionary<any>) => Promise<any>,   options: Dictionary<any>): Promise<void> {
  if (options) {
    await notPromptFunc(options)
    await TaskSpinner(Promise.resolve(`Running Finished.`))
  }
  else {
    await promptFunc()
  }
  process.exit(0)
}

export function validRuleValue (value: string, options: RuleOptions, rule?: Rule): string | true {
  let val = trim(value)
  if (isEmpty(val)) {
    return oc(options).required('不能为空')
  }
  let { pattern, limit, validator } = oc(rule)({})
  if (validator) {
    if (!validator(val)) {
      return oc(options).pattern('格式错误')
    }
  }
  if (pattern) {
    let reg = isRegExp(pattern) ? pattern : new RegExp(pattern)
    if (!reg.test(val)) {
      return oc(options).pattern('格式错误')
    }
  }
  if (limit) {
     let [ min, max ] = limit
     if (!max && val.length < min) {
      return format(oc(options).limit(`格式错误，长度必须大于 %d 个字符`), min)
     }
     if (val.length < min || val.length > max) {
       return format(oc(options).limit(`格式错误，长度必须在 %d 到 %d 个字符之间`), min, max)
     }
  }
  return true
}

export interface RuleOptions {
  required    ?: string
  pattern     ?: string
  limit       ?: string
}