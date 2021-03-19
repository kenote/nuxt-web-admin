
import nunjucks from 'nunjucks'
import { Command } from '@/types/client'

/**
 * 解析命令指向
 * @param value 
 */
export function parseCommand (value: string): Command.value | null {
  if (!value) return null
  let command = value.match(/^(command|router|https?)\:(\S+)$/)
  if (!command) return null
  let [ , type, path ] = command
  if (/^(https?)/.test(type)) {
    return { type: 'http', path: value }
  }
  return { type, path } as Command.value
}

/**
 * 映射对象
 * @param props 
 */
export function parseProps (props?: Record<string, string>) {
  return (data: Record<string, any>) => {
    if (!props) return data
    let result = {}
    for (let [key, val] of Object.entries(props)) {
      result[key] = /(\{)/.test(val) ? nunjucks.renderString(val, data) : data[val]
    }
    return result
  }
}