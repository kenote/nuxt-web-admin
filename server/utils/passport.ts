import * as crypto from 'crypto'
import * as PassportAPI from '@/types/apis/passport'

export const md5 = (text: string) => crypto.createHash('md5').update(text).digest('hex')

export const sha1 = (text: string) => crypto.createHash('sha1').update(text).digest('hex')

class Bcrypt {

  public hash (value: string, salt?: string): PassportAPI.password {
    let _salt = salt || Math.random().toString(36).substr(8)
    let password = { salt: _salt, hash: sha1(`${md5(value)}^${_salt}`) } as PassportAPI.password
    return password
  }

  public compare (value: string, hash: string, salt: string): boolean {
    let password = this.hash(value, salt)
    console.log(password.hash, hash)
    console.log(password.hash === hash)
    return password.hash === hash
  }

}

export const bcrypt = new Bcrypt()