import { TaskSpinner } from 'kenote-task-helper'
import __Models from '~/models'
import groupProxy from '~/proxys/group'
import userProxy from '~/proxys/user'
import { oc } from 'ts-optchain'
import { confirmRuning, validRuleValue, RuleOptions } from './util'
import { CreateGroupDocument } from '@/types/proxys/group'
import { RegisterUserDocument } from '@/types/proxys/user'
import { Dictionary } from 'lodash'
import * as inquirer from 'inquirer'
import * as rules from '@/utils/rules'

export default async function start () {
  try {
    let groupNumber = await groupProxy().Dao.counts()
    if (groupNumber > 0) {
      let isRuning = await confirmRuning(`当前数据库已存在数据，继续操作将清除原有数据；您确定要初始化数据吗？`)
      if (!isRuning) {
        return await TaskSpinner(Promise.resolve(`Exit Finished.`))
      }
    }
    let options: Dictionary<any> = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: '设置管理账号',
        default: 'admin',
        validate: validUsername
      },
      {
        type: 'password',
        name: 'password',
        message: '设置管理密码',
        default: 'admin888',
        validate: validPassword
      },
      {
        type: 'input',
        name: 'email',
        message: '设置电子邮箱',
        validate: validEmail
      }
    ])
    await initDataProxy(options)
    return await TaskSpinner(Promise.resolve(`InitData Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}

function validUsername (value: string): string | true {
  let options: RuleOptions = {
    required    : '管理账号不能为空 !',
    pattern     : '账号格式错误，使用英文字符开头，支持小写英文、数字、下划线和中划线组合',
    limit       : `账号格式错误，长度必须在 %d 到 %d 字符之间`
  }
  return validRuleValue(value, options, rules.username)
}

function validPassword (value: string): string | true {
  let options: RuleOptions = {
    required    : '管理密码不能为空 !',
    pattern     : '密码格式错误，使用英语字母、数字和特殊字符组成，且至少一个英语字母',
    limit       : `密码格式错误，长度必须在 %d 到 %d 字符之间`
  }
  return validRuleValue(value, options, rules.password)
}

function validEmail (value: string): string | true {
  let options: RuleOptions = {
    required    : '电子邮箱不能为空 !',
    pattern     : '邮箱格式错误，请输入正确的邮箱地址.'
  }
  return validRuleValue(value, options, rules.email)
}

interface InitInfo {
  group      : CreateGroupDocument
  user       : (group: any) => RegisterUserDocument
}

const initInfo: InitInfo = {
  group: {
    name: '创建者',
    level: 9999,
    store: {
      upload_type: [],
      download_type: []
    }
  },
  user: group => ({
    username: 'admin',
    group,
    password: 'admin888'
  })
}

export async function initDataProxy (info?: Dictionary<any>): Promise<any> {
  let { username, password, email } = oc(info)({})
  let group = await groupProxy().create(initInfo.group)
  let initUser = {
    ...initInfo.user(group._id),
    username,
    password,
    email
  }
  let user = await userProxy().create(initUser)
  if (user.email) {
    await userProxy().sendNewUser(user, initUser.password)
  }
  console.log('')
  console.log('username:', initUser.username)
  console.log('password:', initUser.password)
  console.log('')
}