


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
}

export = Ucenter