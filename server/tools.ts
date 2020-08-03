
import { TaskHelper, Connect } from 'kenote-task-helper'
import { backup, restore } from './tools/backup'
import initData, { initDataProxy } from './tools/init-data'
import { Dictionary } from 'lodash'
import { getArgvs, runScript } from './tools/util'
import { release } from './tools/release'

@Connect({
  title: '选择操作类型',
  tasks: [
    {
      name: '导出开发配置',
      value: 'export',
      script: backup
    },
    {
      name: '导入开发配置',
      value: 'import',
      script: restore
    },
    {
      name: '创建Release',
      value: 'relelse',
      script: release
    },
    {
      name: '初始化数据',
      value: 'init-data',
      script: initData
    },
    {
      name: '退出',
      value: 'exit',
      script: () => process.exit(0)
    }
  ]
})
class Task extends TaskHelper {}

export const ITask: Task = new Task()

const scriptTypes = ['init-data']
const [ type, options ] = getArgvs(process.argv) as [ string, Dictionary<any> ]

if (type && scriptTypes.includes(type)) {
  switch (type) {
    case 'init-data':
      runScript(initData, initDataProxy, options)
      break
    default:
      break
  }
}
else {
  ITask.start()
}