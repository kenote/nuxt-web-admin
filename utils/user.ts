import { map, flattenDeep, compact, uniq, get } from 'lodash'
import { UserDocument } from '@/types/services/db'

/**
 * 获取用户的数组信息
 * @param user 
 * @param key 
 */
export function getUserArrayInfo (user: UserDocument, key: string) {
  let result: Array<string | string[]> = []
  if (!user || !key) return result as string[]
  if (['platform', 'access'].includes(key)) {
    result = [ ...get(user.group, key), ...map(user.teams, key) ]
    if (key === 'access') {
      let platform = getUserArrayInfo(user, 'platform').map( val => `/${val}` )
      result = [ ...result, ...platform ]
    }
  }
  else {
    result = get(user, key) 
  }
  return parseArray(result, true)
}

/**
 * 解析多元数组
 * @param value 
 * @param isUniq 
 */
function parseArray (value: Array<string | string[]>, isUniq?: boolean) {
  let val = compact(flattenDeep(value))
  return isUniq ? uniq(val) : val
}