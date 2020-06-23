import { useError, IErrorState, IError, IErrorInfo } from 'kenote-config-helper'
import __ErrorCode from './code'
import errorMessage, { ErrorMessage } from './lang'

export interface ErrorState extends IErrorState {
  __ErrorMessage          : ErrorMessage
}

export type ErrorInfo  = (code: number, opts?: any, json?: boolean) => IErrorInfo | IError

export function loadError (lang: string = 'zh-cn', start: number = 1000): ErrorState {
  let __ErrorMessage: ErrorMessage = errorMessage[lang] || errorMessage['zh-cn']
  let { CustomError, ErrorInfo } = useError(__ErrorCode, __ErrorMessage, start)
  return { __ErrorCode, __ErrorMessage, CustomError, ErrorInfo }
}