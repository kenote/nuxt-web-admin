import crypto from 'crypto'

/**
 * Md5
 * @param text 
 */
export const md5 = (text: string) => crypto.createHash('md5').update(text).digest('hex')

/**
 * Sha1
 * @param text 
 */
export const sha1 = (text: string) => crypto.createHash('sha1').update(text).digest('hex')

/**
 * 加密编码
 * @param value 
 * @param salt 
 */
export function encode (value: string, salt?: string) {
  let _salt = salt ?? Math.random().toString(36).substr(8)
  let password = { salt: _salt, encrypt: sha1(`${md5(value)}^${_salt}`) }
  return password
}

/**
 * 比较加密编码
 * @param value 
 * @param encrypt 
 * @param salt 
 */
export function compare (value: string, encrypt: string, salt: string) {
  let password = encode(value, salt)
  return password.encrypt === encrypt
}
