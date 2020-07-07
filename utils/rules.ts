import { Rule } from '@/types/restful'

export const password: Rule = {
  pattern: /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/
}

export const username: Rule = {
  pattern: /^[a-zA-Z]{1}[a-zA-Z0-9\_\-]{4,19}$/
}

