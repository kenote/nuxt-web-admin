import { oc } from 'ts-optchain'
import { result, isObject } from 'lodash'
import { Channel } from '@/types/channel'
import dayjs from 'dayjs'

export const formatUtils = { dateFormat }

export function formatString (value: any, formats?: Channel.format | Channel.format[] | null, replace?: string | number) {
  if (!value) return replace || value
  if (!formats) return value
  let _formats = Array.isArray(formats) ? formats : [ formats ]
  for (let fmt of _formats) {
    if (fmt.function) {
      let _value: string | number | Date = fmt.type === 'number' ? Number(String(value).replace(/[^0-9\.]/g, '')) : String(value)
      if (fmt.type === 'date') {
        _value = toDate(_value)
      }
      try {
        value = _value[fmt.function || 'toLocaleString'](...fmt.options!)
      } catch (error) {
        if (Object.keys(formatUtils).includes(fmt.function)) {
          value = formatUtils[fmt.function](value, ...fmt.options!)
        }
      }
    }
    if (fmt.regexp) {
      value = String(value).replace(fmt.regexp, fmt.substr || '')
    }
    if (fmt.maps) {
      value = oc(fmt).maps[value](value)
    }
    if (fmt.result && isObject(value)) {
      value = result(value, fmt.result)
    }
  }
  return value
}

function toDate (val: string | number): Date {
  if (/\d+/.test(val as string)) {
    return new Date(Number(val))
  }
  return new Date(val)
}

function dateFormat (date: any, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}