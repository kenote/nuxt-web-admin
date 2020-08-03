import { FindUserType } from '@/types/proxys/user'

declare namespace Ucenter {

  interface createGroup {
    name          ?: string
    level          : number
    description   ?: string
    upload_type   ?: string[]
    download_type ?: string[]
  }

  interface createTeam {
    name           : string
    description   ?: string
  }

  interface platform {
    platform       : number[]
  }

  interface access {
    access         : string[]
  }

  interface peoples {
    peoples        : string[]
  }

  interface rtsps {
    channel        : string
    rtsps          : string | string[]
  }

  interface createTicket {
    group         ?: string
    stint          : number
    last_at        : Date
  }

  interface findUser {
    create_at     ?: Date[]
    groups        ?: string[]
    findtype      ?: FindUserType
    findname      ?: string
    page          ?: number
    size          ?: number
    sort          ?: string[]
  }

  interface createUser {
    username      ?: string
    nickname      ?: string
    email         ?: string
    mobile        ?: string
    binds         ?: string[]
    sex           ?: number
    group         ?: string
    teams         ?: string[]
  }

  interface setPass {
    password       : string
  }
}

export = Ucenter