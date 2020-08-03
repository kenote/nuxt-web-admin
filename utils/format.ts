import { oc } from 'ts-optchain'
import { result, isObject, isNumber, isRegExp, map, last } from 'lodash'
import { Channel } from '@/types/channel'
import dayjs from 'dayjs'
import * as bytes from 'bytes'

export const formatUtils = { dateFormat, bytes }

export function formatString (value: any, formats?: Channel.format | Channel.format[] | null, replace?: string | number) {
  if (!value && value != 0) return replace || value
  if (!formats) return value
  let _formats = Array.isArray(formats) ? formats : [ formats ]
  for (let fmt of _formats) {
    if (fmt.function) {
      let _value: string | number | Date = fmt.type === 'number' ? Number(String(value).replace(/[^0-9\.]/g, '')) : String(value)
      if (fmt.type === 'date') {
        _value = toDate(_value)
      }
      try {
        if (fmt.function === 'toLocaleString' && isNumber(_value)) {
          _value = /(\%)$/.test(value) ? _value / 100 : _value
        }
        value = _value[fmt.function || 'toLocaleString'](...fmt.options!)
      } catch (error) {
        if (Object.keys(formatUtils).includes(fmt.function)) {
          value = formatUtils[fmt.function](value, ...oc(fmt).options([]))
        }
      }
    }
    if (fmt.regexp) {
      let regexp = fmt.regexp
      if (!isRegExp(fmt.regexp)) {
        regexp = new RegExp(regexp)
      }
      value = String(value).replace(regexp, fmt.substr || '')
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

export function formatStringType (formats: Channel.format | Channel.format[] | undefined): 'string' | 'number' | 'date' | undefined {
  if (!formats) return 'string'
  if (Array.isArray(formats)) {
    return last(map(formats, 'type'))
  }
  return (formats as Channel.format).type
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