
import { toSafeInteger } from 'lodash'
import { oc } from 'ts-optchain'
import { PageInfo } from '@/types/restful'

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