


declare namespace Ucenter {

  interface createGroup {
    name          ?: string
    level          : number
    description   ?: string
    upload_type   ?: string[]
    download_type ?: string[]
  }
}

export = Ucenter