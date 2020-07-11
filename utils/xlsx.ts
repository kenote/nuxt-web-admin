import * as xlsx from 'xlsx'
import isBlob from 'is-blob'
import { omit } from 'lodash'
import { Execl } from '@/types'
import * as FileSaver from 'file-saver'

export const fileTypes: Execl.FileType[] = [
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
 * 读取 xlsx 文件
 * @param file File | Blob
 */
export function readXlsxFileReader (file: File | Blob): Promise<xlsx.WorkBook> {
  if (!isBlob(file)) {
    file = new Blob([file], { type: (<File> file).type })
  }
  return new Promise((resolve, reject) => {
    let xlsxTypes: string[] = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    if (!xlsxTypes.includes(file.type || 'application/vnd.ms-excel')) {
      reject('请选择正确的文件格式')
    }
    let reader = new FileReader()
    reader.onload = () => {
      let data = new Uint8Array(reader.result as ArrayBuffer)
      resolve(xlsx.read(data, { type: 'array', cellHTML: false }))
    }
    reader.onerror = (err: any) => {
      reject(err)
    }
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 获取 xlsx 字段集
 * @param workbook xlsx.WorkBook
 * @param sheetName string
 */
export function getXlsxFields (workbook: xlsx.WorkBook, sheetName: string): string[] {
  let sheet = getXlsxSheet(workbook, sheetName)
  return Array.from(new Set(Object.keys(sheet).map( o => o.replace(/^([A-Z]{1,3})(\d{1,9})$/, '$1'))))
}

/**
 * 获取 xlsx Sheet
 * @param workbook 
 * @param sheetName 
 */
export function getXlsxSheet (workbook: xlsx.WorkBook, sheetName: string): xlsx.WorkSheet {
  let _sheetName = workbook.SheetNames.includes(sheetName) ? sheetName : workbook.SheetNames[0]
  return omit(workbook.Sheets[_sheetName], ['!ref', '!margins'])
}

/**
 * 导出 xlsx 文件
 * @param options Execl.Options
 */
export const xlsxBlob = (options: Execl.Options): any => {
  let { header, data, sheetName, bookType, filename } = options
  sheetName = sheetName || 'mySheet'
  bookType = bookType || 'xlsx'
  let workbook: xlsx.WorkBook = {
    SheetNames: [ sheetName ],
    Sheets: {
      [sheetName]: xlsx.utils.json_to_sheet(data, { header })
    },
    Props: {}
  }
  let wopts: xlsx.WritingOptions = { bookType, bookSST: false, type: 'binary' }
  let wbout = xlsx.write(workbook, wopts)
  let blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
  let fileType = fileTypes.find( o => o.key === bookType ) || fileTypes[0]
  filename = filename || 'export-file'
  FileSaver.saveAs(blob, `${filename}${fileType.suffix}`)
}

function s2ab (s: any): any {
  if (typeof ArrayBuffer !== 'undefined') {  
    let buf = new ArrayBuffer(s.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF; 
    return buf
  } else {  
    let buf = new Array(s.length)
    for (let i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
    return buf
  }
}