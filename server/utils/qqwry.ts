import * as path from 'path'
import * as fs from 'fs-extra'
import * as GBK from 'gbk.js'
import validator from 'validator'
import * as runscript from 'runscript'
import * as request from 'request'
import * as unzipper from 'unzipper'
import __ErrorCode from '~/utils/error/code'
import { loadError } from '~/utils/error'
import { IPInfo, IPInfoArea, InfoBase } from '@/types/qqwry'

const { ErrorInfo } = loadError()

const IP_RECORD_LENGTH = 7
const REDIRECT_MODE_1 = 1
const REDIRECT_MODE_2 = 2
const qqwry_path = path.resolve(process.cwd(), 'config', 'qqwry.dat')

export class QQwry {

  private static instance: QQwry
  private _path: string

  public buffer: Buffer
  public ipBegin: number
  public ipEnd: number
  public name: string
  public version: string

  constructor (_path: string = qqwry_path) {
    this._path = _path
    this.initData(_path)
  }

  private initData (_path: string): void {
    this.buffer = fs.readFileSync(_path)
    this.ipBegin = this.buffer.readUIntLE(0, 4)
    this.ipEnd = this.buffer.readUIntLE(4, 4)
    let { addr, info } = this.searchIP('255.255.255.255')
    this.name = addr
    this.version = info
  }

  /**
   * 搜索IP信息
   * @param ip IP
   */
  searchIP (ip: string): IPInfo {
    let int = ip2int(ip)
    ip = int2ip(int)
    let offset = locateIP(int, this)
    if (offset === -1) {
      return { ip, int, addr: '', info: '' }
    }
    let { addr, info } = setIPLocation(offset, this.buffer)
    let begInt = this.buffer.readUIntLE(offset, 4)
    let begIp = int2ip(begInt)
    let endInt = this.buffer.readUIntLE(this.buffer.readUIntLE(offset + 4, 3), 4)
    let endIp = int2ip(endInt)
    return { ip, int, addr, info, begInt, begIp, endInt, endIp }
  }

  /**
   * 搜索IP段信息
   * @param beginIP 
   * @param endIP 
   */
  searchIPScope (beginIP: string, endIP: string): IPInfoArea[] {
    let beginIPInt = ip2int(beginIP)
    let endIPInt = ip2int(endIP)
    let offsetBegin = locateIP(beginIPInt, this)
    let offsetEnd = locateIP(endIPInt, this)
    let areaInfos: IPInfoArea[] = []
    for (let i = offsetBegin; i <= offsetEnd; i += IP_RECORD_LENGTH) {
      let { addr, info } = setIPLocation(i, this.buffer)
      let begInt = this.buffer.readUIntLE(i, 4)
      let begIp = int2ip(begInt)
      let endInt = this.buffer.readUIntLE(this.buffer.readUIntLE(i + 4, 3), 4)
      let endIp = int2ip(endInt)
      let areaInfo: IPInfoArea = { addr, info, begInt, begIp, endInt, endIp }
      areaInfos.push(areaInfo)
    }
    return areaInfos
  }

  async update (log?: any): Promise<void> {
    if (log) {
      log(`开始更新...`)
      log(`创建临时目录...`)
      let tempDir = path.resolve(process.cwd(), 'temp')
      if (fs.existsSync(tempDir)) {
        fs.removeSync(tempDir)
      }
      fs.mkdirpSync(tempDir)
      log(`下载并解压文件...`)
      let directory = await unzipper.Open.url(request as never, 'http://update.cz88.net/soft/setup.zip')
      await directory.extract({ path: tempDir })
      await runscript(`innoextract setup.exe`, { cwd: tempDir })
      log(`拷贝IP库...`)
      fs.copyFileSync(path.resolve(tempDir, 'app', 'qqwry.dat'), qqwry_path)
      log(`清理临时目录...`)
      fs.removeSync(tempDir)
      log(`完成更新...`)
    }
    else {
      await runscript(`sh ./qqwry.sh`)
    }
    this.initData(this._path)
  }

  static getInstance (_path?: string): QQwry {
    if (!QQwry.instance) {
      QQwry.instance = new QQwry(_path)
    }
    return QQwry.instance
  }
}

/**
 * IP转整数
 * @param ip
 */
export function ip2int (ip: string): number {
  if (validator.isIP(ip)) {
    let bytes = ip.split('.').map(n => parseInt(n, 10))
    let addr = bytes[3] & 0xff
    addr |= (bytes[2] << 8) & 0xff00
    addr |= (bytes[1] << 16) & 0xff0000
    addr |= (bytes[0] << 24) & 0xff000000
    return addr >>> 0
  }
  else if (/^\d+$/.test(ip) && Number(ip) >= 0 && Number(ip) <= 0xffffffff) {
    return Number(ip)
  }
  else {
    throw ErrorInfo(__ErrorCode.ERROR_CUSTOMIZE_DATA, ['The IP address is not normal!'])
  }
}

/**
 * 整数转IP
 * @param int 
 */
export function int2ip (int: number): string {
  if (int < 0 || int > 0xffffffff) {
    throw ErrorInfo(__ErrorCode.ERROR_CUSTOMIZE_DATA, ['The number is not normal or out of range!'])
  }
  return (int >>> 24) + '.' + ((int >>> 16) & 0xff) + '.' + ((int >>> 8) & 0xff) + '.' + ((int >>> 0) & 0xff)
}

/**
 * 取得 begin 和 end 中间的偏移 (用于2分法查询)
 * @param begin 其实位置
 * @param end 结束位置
 * @param recordLength 记录长度
 */
function getMiddleOffset (begin: number, end: number, recordLength: number): number {
  let records = (((end - begin) / recordLength) >> 1) * recordLength + begin
  return records ^ begin ? records : records + recordLength
}

/**
 * 2分法查找指定的IP偏移
 * @param ip int 型 ip 值
 * @param qqwry QQwry 实例
 */
function locateIP (ip: number, qqwry: QQwry): number {
  let temp: number
  let g: number = -1
  let b: number = qqwry.ipBegin
  let e: number = qqwry.ipEnd
  for (; b < e; ) {
    g = getMiddleOffset(b, e, IP_RECORD_LENGTH)
    temp = qqwry.buffer.readUIntLE(g, 4)
    if (ip > temp) {
      b = g
    } 
    else if (ip < temp) {
      if (g === e) {
        g -= IP_RECORD_LENGTH
        return g
      }
      e = g
    } 
    else {
      return g
    }
  }
  return g
}

// 读取 buffer 字符串 (GBK数据)
function getStringByteArray (start: number = 0, buffer: Buffer): number[] {
  let maxSize: number = buffer.length
  let toarr: number[] = []
  for (let i = start; i < maxSize; i++) {
    let s = buffer[i]
    if (s === 0) {
      return toarr
    }
    toarr.push(s)
  }
  return toarr
}

// 读取 Area 数据
function ReadArea (offset: number, buffer: Buffer): string {
  let one: number = buffer.readUIntLE(offset, 1)
  if (one == REDIRECT_MODE_1 || one == REDIRECT_MODE_2) {
    let areaOffset: number = buffer.readUIntLE(offset + 1, 3)
    if (areaOffset == 0) {
      return ''
    } else {
      return GBK.decode(getStringByteArray(areaOffset, buffer))
    }
  } else {
    return GBK.decode(getStringByteArray(offset, buffer))
  }
}

/**
 * 获取 IP 地址对应区域
 * @param offset 偏移
 * @param buffer 数据库
 */
export function setIPLocation(offset: number, buffer: Buffer): InfoBase {
  let ipwz: number = buffer.readUIntLE(offset + 4, 3) + 4
  let lx: number = buffer.readUIntLE(ipwz, 1)
  let loc: InfoBase = { addr: '', info: '' }
  let Gjbut: number[] = []
  if (lx === REDIRECT_MODE_1) {
    ipwz = buffer.readUIntLE(ipwz + 1, 3)
    lx = buffer.readUIntLE(ipwz, 1)
    if (lx == REDIRECT_MODE_2) {
      Gjbut = getStringByteArray(buffer.readUIntLE(ipwz + 1, 3), buffer)
      loc.addr = GBK.decode(Gjbut)
      ipwz = ipwz + 4
    } 
    else {
      Gjbut = getStringByteArray(ipwz, buffer)
      loc.addr = GBK.decode(Gjbut)
      ipwz += Gjbut.length + 1
    }
    loc.info = ReadArea(ipwz, buffer)
  } 
  else if (lx === REDIRECT_MODE_2) {
    Gjbut = getStringByteArray(buffer.readUIntLE(ipwz + 1, 3), buffer)
    loc.addr = GBK.decode(Gjbut)
    loc.info = ReadArea(ipwz + 4, buffer)
  } 
  else {
    Gjbut = getStringByteArray(ipwz, buffer)
    ipwz += Gjbut.length + 1
    loc.addr = GBK.decode(Gjbut)
    loc.info = ReadArea(ipwz, buffer)
  }
  if (loc.info.indexOf('CZ88.NET') > -1) {
    loc.info = ''
  }
  return loc
}

export const Qqwry = QQwry.getInstance()