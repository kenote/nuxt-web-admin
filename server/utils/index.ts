import * as path from 'path'
import { toSafeInteger } from 'lodash'
import { oc } from 'ts-optchain'
import { PageInfo, ModuleVersion } from '@/types/restful'
import * as fs from 'fs-extra'
import { Maps } from 'kenote-config-helper'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { ProtoOptions } from '@/types/proto'

export function toPageInfo (pageno: number, size: number = 10): PageInfo {
  size = toSafeInteger(size)
  let limit = isNaN(size) || size < 1 ? 10 : size
  let parseVal = toSafeInteger(oc(pageno)(1))
  // tslint:disable-next-line: use-isnan
  let val = parseVal === NaN ? 1 : parseVal
  let page = isNaN(val) || val < 1 ? 1 : parseVal
  let skip = (page - 1) * limit
  return { page, skip, limit }
}

export function getRtsps (): Maps<string[]> {
  let tmpRstps: Maps<string[]> = {}
  let projectDir = path.resolve(process.cwd(), 'projects')
  if (!fs.existsSync(projectDir)) return tmpRstps
  let projects = fs.readdirSync(projectDir)
  for (let project of projects) {
    let stat = fs.statSync(path.resolve(projectDir, project))
    if (stat.isDirectory()) {
      let { rstps } = loadData(`projects/${project}/setting`) as ProtoOptions
      tmpRstps[project] = Object.keys(rstps)
    }
  }
  return tmpRstps
}

export function isRelease (): boolean {
  let release = path.resolve(process.cwd(), 'config/server/release.yml')
  return fs.existsSync(release)
}

export function getVersion (name: string): string {
  let pkg = path.resolve(process.cwd(), 'node_modules', name, 'package.json')
  return oc(fs.readJSONSync(pkg)).version('')
}

export const versions = ['express', 'nuxt', 'vuex', 'element-ui', 'nodemailer', '@alicloud/pop-core'].map(parseVserion)

function parseVserion (name: string): ModuleVersion {
  return { name, version: getVersion(name) }
}