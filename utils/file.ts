
import isBlob from 'is-blob'
import xlsx from 'xlsx'
import FileSaver from 'file-saver'
import { omit, get, map } from 'lodash'
import { Xlsx } from '@/types/client'

export const xlsxFileTypes: Xlsx.FileType[] = [
  { 
    key: 'xlsx', 
    name: 'Excel 工作簿(.xlsx)', 
    suffix: '.xlsx' 
  },
  { 
    key: 'xlsm', 
    name: 'Excel 宏工作簿(.xlsm)', 
    suffix: '.xlsm' 
  },
  { 
    key: 'xlsb', 
    name: 'Excel 二进制工作簿(.xlsb)', 
    suffix: '.xlsb' 
  },
  { 
    key: 'biff8', 
    name: 'Excel 97-2004 工作簿(.xls)', 
    suffix: '.xls' 
  },
  { 
    key: 'csv', 
    name: 'CVS UTF-8(.cvs)', 
    suffix: '.csv' 
  },
  { 
    key: 'txt', 
    name: 'UTF-16 Unicode 文本(.txt)', 
    suffix: '.txt' 
  },
  { 
    key: 'html', 
    name: 'HTML 文档(.html)', 
    suffix: '.html' 
  },
]

/**
 * 读取图片文件
 * @param file 
 */
export function readImageFile<T = string | ArrayBuffer | null> (file: File | Blob): Promise<T> {
  if (!isBlob(file)) {
    file = new Blob([file], { type: (<File> file).type })
  }
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as unknown as T)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 读取文本文件
 * @param file 
 */
export function readTextFile<T = string> (file: File | Blob): Promise<T> {
  if (!isBlob(file)) {
    file = new Blob([file], { type: (<File> file).type })
  }
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as unknown as T)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsText(file)
  })
}

/**
 * 读取 xlsx 文件
 * @param file 
 */
export function readXlsxFile<T = xlsx.WorkBook> (file: File | Blob): Promise<T> {
  if (!isBlob(file)) {
    file = new Blob([file], { type: (<File> file).type })
  }
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => {
      let data = new Uint8Array(reader.result as ArrayBuffer)
      resolve(xlsx.read(data, { type: 'array', cellHTML: false }) as unknown as T)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 获取 xlsx Sheet
 * @param workbook 
 * @param sheetName 
 */
export function getXlsxSheet (workbook: xlsx.WorkBook, sheetName: string) {
  let IsheetName = workbook.SheetNames.includes(sheetName) ? sheetName : workbook.SheetNames[0]
  return omit(get(workbook.Sheets, IsheetName), ['!ref', '!margins'])
}

/**
 * 获取 xlsx 字段集 
 * @param workbook 
 * @param sheetName 
 */
export function getXlsxFields (workbook: xlsx.WorkBook, sheetName: string) {
  let xlsxSheet = getXlsxSheet(workbook, sheetName)
  return [...new Set(Object.keys(xlsxSheet).map( r => r.replace(/^([A-Z]{1,3})(\d{1,9})$/, '$1') ))]
}

/**
 * 导出 xlsx 文件
 * @param options 
 */
export function xlsxBlob (options: Xlsx.Options<any>) {
  let { sheets, bookType, filename } = options
  let workbook: xlsx.WorkBook = {
    SheetNames: [],
    Sheets: {},
    Props: {}
  }
  workbook.SheetNames = map(sheets, 'name')
  for (let item of sheets) {
    let { name, data, opts } = item
    workbook.Sheets[name] = xlsx.utils.json_to_sheet(data, opts)
  }
  let wopts: xlsx.WritingOptions = { bookType, bookSST: false, type: 'binary' }
  let wbout = xlsx.write(workbook, wopts)
  let blob = new Blob([s2ab(wbout) as any], { type: 'application/octet-stream' })
  let fileType = xlsxFileTypes.find( o => o.key === bookType ) || xlsxFileTypes[0]
  FileSaver.saveAs(blob, `${filename ?? 'export-file'}${fileType.suffix}`)
}


function s2ab (s: string) {
  if (typeof ArrayBuffer !== 'undefined') {
    let buf = new ArrayBuffer(s.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
    return buf
  }
  else {
    let buf = new Array(s.length)
    for (let i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF
    return buf
  }
}