import { Maps } from 'kenote-config-helper'
import { PB, PBSetting, Protobuffer, ReflectionObject, Socket } from 'kenote-socket-helper'
import { ProtoServer, ProtoOptions, ProtoSend } from '@/types/proto'
import { oc } from 'ts-optchain'

export default class ProtoUtil {

  private __rstps: Maps<ProtoServer>
  private __proto: PBSetting
  private __key: string = 'Slave'

  constructor (options: ProtoOptions) {
    this.__rstps = options.rstps
    this.__proto = options.proto
  }

  public async send (proto: ProtoSend.proto, payload: Maps<any>, key: string | null | undefined, done?: (info: ProtoSend.requestDocument) => void): Promise<PB.Message> {
    let __key = proto.rstp || key || this.__key
    let { host, port } = this.getRstp(__key)
    done && done({
      rtsp_key: __key,
      rstp_serve: [ host, port ].join(':'),
      proto_code: proto.code,
      payload
    })
    let client = new Socket(host, port)
    let { createPBBuffer, makeData, decode, gameMessage } = new Protobuffer(this.__proto)
    let data = makeData(createPBBuffer(proto.code, proto.req, oc(payload)({})))
    let buffer = await client.send(data)
    let messageQuery = gameMessage(proto.res) as ReflectionObject
    let message = decode(buffer, messageQuery) as PB.Message
    return message
  }

  private getRstp (key: string): ProtoServer {
    let __key = Object.keys(this.__rstps).includes(key) ? key : this.__key
    let __rstp = oc(this.__rstps)[__key]({ host: '127.0.0.1', port: 8080 })
    return __rstp
  }
}

export const protoUtils = (name: string, options: any[]) => {
  let utils = {}
  let func = oc(utils)[name]()
  if (!func) return undefined
  return func(...options)
}