export interface IPInfo extends InfoBase {
  ip           : string
  int          : number
  begInt      ?: number
  begIp       ?: string
  endInt      ?: number
  endIp       ?: string
}

export interface IPInfoArea extends InfoBase {
  begInt       : number
  begIp        : string
  endInt       : number
  endIp        : string
}

export interface IPInfoResponse {
  name         : string
  version      : string
  info         : IPInfo[]
}

export interface InfoBase {
  /** 地址信息: 国家/省市/局域网 */
  addr         : string
  /** 描述信息: 运营商/公司/组织/节点 */
  info         : string
}