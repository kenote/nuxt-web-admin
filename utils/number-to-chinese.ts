import { chunk } from 'lodash'

// 数字单元名称
const numberNames: string[] = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
// 千进位单元名称
const thousandUnitNames: string[] = ['', '拾', '佰', '仟']
// 大头单元名称
const largeUnitNames: string[] = ['元', '万', '亿']
// 零头单元名称
const oddUnitNames: string[] = ['角', '分']

/**
 * 解析金额至中文大写
 */
export function parseDigital (value: number | string) {
  if (!value) return ''
  // 将数字分割成整数和小数
  let [ integer, decimal ] = String(Number(value).toFixed(2)).split(/\./)
  // 将整数进行千进位分割
  let integerArr = integer === 'NaN' ? [] : chunk(integer.split('').reverse(), 4)
  // 获取小数中文解析
  let decimalCN = parseDecimal(decimal)
  // 获取整数中文解析
  let integerCN = integerArr.map( parseThousand ).reverse().join('').replace(/亿万/, '亿')
  integerCN = integerCN.replace(/^(元)$/, Number(decimal) > 0 ? '' : '零元')
  return integerCN + decimalCN
}

/**
 * 解析千进位
 */
function parseThousand (value: string[], index: number) {
  let thousand = value.map( parseThousandItem ).reverse().join('')
    .replace(/(零){1,4}/, '零')
    .replace(/(零){1}$/, '')
  return thousand + largeUnitNames[index]
}

/**
 * 解析千进位单元
 */
function parseThousandItem (value: string, index: number) {
  let unit = value === '0' ? '' : thousandUnitNames[index]
  return `${numberNames[value]}${unit}`
}

/**
 * 解析小数
 */
function parseDecimal (value: string) {
  let decimal = Number(value) > 0 
    ? value.split('').map( parseDecimalItem ).join('').replace(/^(零角){1}/, '').replace(/(零分){1}$/, '')
    : '整'
  return decimal // .replace(/^整$/, '')
}

/**
 * 解析小数单元
 */
function parseDecimalItem (value: string, index: number) {
  return `${numberNames[value]}${oddUnitNames[index]}`
}