import xlsx from 'xlsx'
import { Xlsx } from '@/types/client'
import { map } from 'lodash'

/**
 * 生成 WorkBook
 * @param sheets 
 */
export function getXlsxWorkBook<T = any> (sheets: Array<Xlsx.Sheet<T>>) {
  let workbook = xlsx.utils.book_new()
  workbook.SheetNames = map(sheets, 'name')
  for (let item of sheets) {
    let { name, data, opts } = item
    workbook.Sheets[name] = xlsx.utils.json_to_sheet(data, opts)
  }
  return workbook
}

/**
 * 写入 Buffer
 * @param options 
 */
export function writeBuffer (sheets: Xlsx.Sheet[]) {
  return xlsx.write(getXlsxWorkBook(sheets), { type: 'buffer' }) as Buffer
}

/**
 * 写入文件
 * @param options 
 */
export function writeFile (filename: string, sheets: Xlsx.Sheet[]) {
  xlsx.writeFile(getXlsxWorkBook(sheets), filename, { type: 'file' })
}