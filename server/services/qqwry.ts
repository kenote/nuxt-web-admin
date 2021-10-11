import path from 'path'
import fs from 'fs'
import GBK from 'gbk.js'
import validator from 'validator'
import { httpError, ErrorCode } from './error'
import { IPInfo, InfoBase, IPInfoArea, IPInfoResponse } from '@/types/services/qqwry'
import { merge } from 'lodash'
import dns from 'dns'

const IP_RECORD_LENGTH = 7
const REDIRECT_MODE_1 = 1
const REDIRECT_MODE_2 = 2
const QQWRY_PATH = './config/qqwry.dat'

export class QQwry {

  private static instance: QQwry

  private __Buffer: Buffer
  private __IpBegin: number
  private __IpEnd: number
  private __Name: string
  private __Version: string

  constructor (filename: string = QQWRY_PATH) {
    this.initData(filename)
  }

  get buffer () {
    return this.__Buffer
  }

  get ipBegin () {
    return this.__IpBegin
  }

  get ipEnd () {
    return this.__IpEnd
  }
  
  get name () {
    return this.__Name
  }

  get version () {
    return this.__Version
  }

  /**
   * 初始化数据
   * @param filename 
   */
  private initData (filename: string) {
    this.__Buffer = fs.readFileSync(path.resolve(process.cwd(), filename))
    this.__IpBegin = this.__Buffer.readUIntLE(0, 4)
    this.__IpEnd = this.__Buffer.readUIntLE(4, 4)
    let { addr, info } = this.searchIP('255.255.255.255')
    this.__Name = addr
    this.__Version = info
  }

  /**
   * 搜索IP信息
   * @param address IP
   */
  searchIP (address: string) {
    let int = ip2int(address)
    let ip = int2ip(int)
    let offset = locateIP(int, this)
    let info: IPInfo = { ip, int, addr: '', info: '' }
    if (offset === -1) {
      return info
    }
    let infoBase = setIPLocation(offset, this.__Buffer)
    info.begInt = this.__Buffer.readUIntLE(offset, 4)
    info.begIp = int2ip(info.begInt)
    info.endInt = this.__Buffer.readUIntLE(this.__Buffer.readUIntLE(offset + 4, 3), 4)
    info.endIp = int2ip(info.endInt)
    return merge(info, infoBase)
  }

  /**
   * 搜索IP段信息
   * @param beginIP 
   * @param endIP 
   */
  searchIPScope (beginIP: string, endIP: string) {
    let beginIPInt = ip2int(beginIP)
    let endIPInt = ip2int(endIP)
    let offsetBegin = locateIP(beginIPInt, this)
    let offsetEnd = locateIP(endIPInt, this)
    let areaInfos: IPInfoArea[] = []
    for (let i: number = offsetBegin; i <= offsetEnd; i += IP_RECORD_LENGTH) {
      let infoBase = setIPLocation(i, this.__Buffer)
      let begInt = this.__Buffer.readUIntLE(i, 4)
      let begIp = int2ip(begInt)
      let endInt = this.__Buffer.readUIntLE(this.__Buffer.readUIntLE(i + 4, 3), 4)
      let endIp = int2ip(endInt)
      let areaInfo: IPInfoArea = merge({ begInt, begIp, endInt, endIp }, infoBase)
      areaInfos.push(areaInfo)
    }
    return areaInfos
  }

  static getInstance (filename?: string): QQwry {
    if (!QQwry.instance) {
      QQwry.instance = new QQwry(filename)
    }
    return QQwry.instance
  }
}

/**
 * IP转整数
 * @param ip 
 */
export function ip2int (address: string) {
  if (validator.isIP(address)) {
    let bytes = address.split('.').map(n => parseInt(n, 10))
    let addr = bytes[3] & 0xff
    addr |= (bytes[2] << 8) & 0xff00
    addr |= (bytes[1] << 16) & 0xff0000
    addr |= (bytes[0] << 24) & 0xff000000
    return addr >>> 0
  }
  else if (/^\d+$/.test(address) && Number(address) >= 0 && Number(address) <= 0xffffffff) {
    return Number(address)
  }
  else {
    throw httpError(ErrorCode.ERROR_CUSTOMIZE_DATA, ['The IP address is not normal!'])
  }
}

/**
 * 整数转IP
 * @param int 
 */
export function int2ip (int: number) {
  if (int < 0 || int > 0xffffffff) {
    throw httpError(ErrorCode.ERROR_CUSTOMIZE_DATA, ['The number is not normal or out of range!'])
  }
  return (int >>> 24) + '.' + ((int >>> 16) & 0xff) + '.' + ((int >>> 8) & 0xff) + '.' + ((int >>> 0) & 0xff)
}

/**
 * 取得 begin 和 end 中间的偏移 (用于2分法查询)
 * @param begin 起始位置
 * @param end 结束位置
 * @param recordLength 记录长度
 */
function getMiddleOffset (begin: number, end: number, recordLength: number) {
  let records = (((end - begin) / recordLength) >> 1) * recordLength + begin
  return records ^ begin ? records : records + recordLength
}

/**
 * 2分法查找指定的IP偏移
 * @param ip int 型 ip 值
 * @param qqwry QQwry 实例
 */
function locateIP (ip: number, qqwry: QQwry) {
  let temp: number
  let g = -1
  let b = qqwry.ipBegin
  let e = qqwry.ipEnd
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
function getStringByteArray (start: number = 0, buffer: Buffer) {
  let maxSize = buffer.length
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
function ReadArea (offset: number, buffer: Buffer) {
  let one = buffer.readUIntLE(offset, 1)
  if (one == REDIRECT_MODE_1 || one == REDIRECT_MODE_2) {
    let areaOffset = buffer.readUIntLE(offset + 1, 3)
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
export function setIPLocation(offset: number, buffer: Buffer) {
  let ipwz = buffer.readUIntLE(offset + 4, 3) + 4
  let lx = buffer.readUIntLE(ipwz, 1)
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

/**
 * 搜索IP/域名
 * @param ips 
 */
export async function searchIP (ips: string[]) {
  let info: IPInfo[] = []
  for (let ip of ips) {
    if (validator.isFQDN(ip)) {
      let dips = await dns.promises.resolve4(ip)
      for (let item of dips) {
        info.push(QQwry.getInstance().searchIP(item))
      }
    }
    else {
      info.push(QQwry.getInstance().searchIP(ip))
    }
  }
  let ipInfoResponse: IPInfoResponse = {
    name: QQwry.getInstance().name,
    version: QQwry.getInstance().version,
    info
  }
  return ipInfoResponse
}

export default QQwry.getInstance()