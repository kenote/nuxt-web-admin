import { Maps } from 'kenote-config-helper'
import { toPairs, isString, result as __Result, intersection, isEmpty } from 'lodash'
import { oc } from 'ts-optchain'

const operatorMaps = {
  // 大于
  ['$gt']: (a: number, b: number): boolean => a > b,
  // 小于
  ['$lt']: (a: number, b: number): boolean => a < b,
  // 大于等于
  ['$gte']: (a: number, b: number): boolean => a >= b,
  // 小于等于
  ['$lte']: (a: number, b: number): boolean => a <= b,
  // 包含
  ['$in']: (a: string | number | Array<string | number>, b: Array<string | number>): boolean => Array.isArray(a) ? intersection(a, b).length > 0 : b.includes(a),
  // 不包含
  ['$nin']: (a: string | number | Array<string | number>, b: Array<string | number>): boolean => Array.isArray(a) ? intersection(a, b).length === 0 : !b.includes(a),
  // 反包含
  ['$_in']: (a: Array<string | number>, b: string): boolean => a.includes(b),
  // 反不包含
  ['$_nin']: (a: Array<string | number>, b: string): boolean => !a.includes(b),
  // 不等于
  ['$ne']: (a: string | number, b: string | number): boolean => a !== b,
  // 等于
  ['$eq']: (a: string | number, b: string | number): boolean => a === b,
  // 长度大于
  ['$size']: (a: never[], b: number) => a.length > b,
  // tslint:disable-next-line: no-eval
  ['$or']: (...result: boolean[]) => eval(result.map(String).join(' || ')),
  // tslint:disable-next-line: no-eval
  ['$and']: (...result: boolean[]) => eval(result.map(String).join(' && '))
}

const toValueMaps = {
  // $now
  ['$now']: Date.now()
}

/**
 * 规则判断
 * @param data 
 * @param query 
 */
export function ruleJudgment (data: Maps<any>, query: Maps<any>, options?: Maps<any>): boolean {
  if (isEmpty(query)) return true
  let result: boolean[] = []
  for (let key in query) {
    if (['$and', '$or'].includes(key)) {
      result.push(ruleJudgmentByArray(data, query[key], key as '$and' | '$or', options))
    }
    else {
      ruleJudgmentPush(__Result(data, key), query[key], result, options)
    }
  }
  return operatorMaps['$and'](...result)
}

function ruleJudgmentByArray (data: Maps<any>, query: Array<Maps<any>>, mode: '$and' | '$or' = '$and', options?: Maps<any>): boolean {
  let result: boolean[] = []
  for (let item of query) {
    for (let key in item) {
      ruleJudgmentPush(__Result(data, key), item[key], result, options)
    }
  }
  return operatorMaps[mode](...result)
}

function ruleJudgmentPush (data: any, query: any, result: boolean[], options?: Maps<any>): void {
  if (Object.prototype.toString.call(query) === '[object Object]') {
    for (let pairs of toPairs(query)) {
      let [ operator, value ] = pairs
      let _data = data
      if (isString(_data) && isDateString(_data)) {
        _data = new Date(_data).getTime()
      }
      if (isString(value) && isDateString(value)) {
        value = new Date(value).getTime()
      }
      else if (isString(value) && /^(\$)/.test(value)) {
        options = { ...options, ...toValueMaps }
        value = oc(options)[value](value)
      }
      result.push(operatorMaps[operator](_data, value))
    }
  }
  else {
    result.push(operatorMaps['$eq'](data, query))
  }
}

export function isDateString (value: string): boolean {
  let date = new Date(value)
  return String(date) === 'Invalid Date' ? false : true
}