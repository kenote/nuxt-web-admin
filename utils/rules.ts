import { Rule } from '@/types/restful'
import { isEmail } from 'validator'

export const password: Rule = {
  pattern  : /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]/,
  limit    : [ 8, 20 ]
}

export const username: Rule = {
  pattern  : /^[a-zA-Z]{1}[a-zA-Z0-9\_\-]/,
  limit    : [ 5, 20 ]
}

export const email: Rule = {
  validator : isEmail
}

