import { map, compact, flattenDeep } from 'lodash'
import { ResponseUserDocument } from '@/types/proxys/user'

/**
 * 获取用户 Access
 * @param user ResponseUserDocument
 */
export function getAccess (user: ResponseUserDocument): string[] {
  let { access, group, teams } = user
  let _access = [ group.access, ...map(teams, 'access'), access ]
  return parseArray(_access)
}

/**
 * 获取用户 Platform
 * @param user ResponseUserDocument
 */
export function getPlatform (user: ResponseUserDocument): number[] {
  let { group, teams } = user
  let platforms: number[][] = [ group.platform, ...map(teams, 'platform') ]
  return parseArray(platforms)
}

/**
 * 解析多元数组
 * @param value 
 */
function parseArray (value: any[]): any[] {
  let val = compact(flattenDeep(value))
  return Array.from(new Set(val))
}