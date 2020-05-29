import zhCN from './zh-cn'

export default {
  'zh-cn': zhCN
}

export type ErrorMessage = {
  ERROR_STATUS_NULL                : string

  ERROR_AUTH_FLAG_ACCESS           : string
  ERROR_AUTH_FLAG_OPERATE          : string
  ERROR_BYLOND_LEVEL_OPERATE       : string
  ERROR_VALID_IDMARK_NOTEXIST      : string
  ERROR_AUTH_OPERATE_GROUP_NULL    : string
  ERROR_NOT_FOUND_CHANNEL          : string
  ERROR_NOT_FOUND_API              : string
  ERROR_NOT_FOUND_ACCESSKEY        : string
  ERROR_ONLY_ADVANCED_ADMIN        : string
  ERROR_AUTH_OPERATE_USER_NULL     : string
  ERROR_VALID_IDMARK_NULL          : string
  ERROR_DATA_DOESNT_BELONG_YOU     : string

  ERROR_UPLOAD_FILE_MIMETYPE       : string
  ERROR_UPLOAD_FILESIZE_LARGEMAX   : string
  ERROR_UPLOAD_NOT_FILE            : string
  ERROR_UPLOAD_TYPE_FLAG           : string

  ERROR_LOGINVALID_FAIL            : string
  ERROR_FINDUSER_NOTEXIST          : string

  ERROR_VALID_USERNAME_REQUIRED    : string
  ERROR_VALID_USERNAME_FORMAT      : string
  ERROR_VALID_USERNAME_UNIQUE      : string
  ERROR_VALID_PASSWORD_REQUIRED    : string
  ERROR_VALID_PASSWORD_FORMAT      : string
  ERROR_VALID_EMAIL_REQUIRED       : string
  ERROR_VALID_EMAIL_FORMAT         : string
  ERROR_VALID_EMAIL_UNIQUE         : string
  ERROR_VALID_MOBILE_REQUIRED      : string
  ERROR_VALID_MOBILE_FORMAT        : string
  ERROR_VALID_MOBILE_UNIQUE        : string
  ERROR_VALID_CHOOSEONE_MORE       : string
  ERROR_VALID_TICKET_REQUIRED      : string
  ERROR_VALID_TICKET_NULL          : string
  ERROR_VALID_TICKET_TYPE          : string
  ERROR_VALID_TICKET_USED          : string
  ERROR_VALID_TICKET_EXPIRED       : string

  ERROR_VALID_GROUP_REQUIRED       : string
  ERROR_VALID_GROUP_NOTEXIST       : string
  ERROR_VALID_DATE_REQUIRED        : string
  ERROR_VALID_DATE_FORMAT          : string
  ERROR_VALID_NAME_REQUIRED        : string
  ERROR_VALID_NAME_FORMAT          : string

  ERROR_VERIFY_EMAIL_TIMEOUT       : string
  ERROR_VERIFY_EMAIL_FAILED        : string
  ERROR_VERIFY_MOBILE_TIMEOUT      : string
  ERROR_VERIFY_MOBILE_FAILED       : string
  ERROR_VERIFY_TOKEN_VERIFIED      : string
  ERROR_SEND_MAILPHONE_STEP        : string
  ERROR_VERIFY_CODE_REQUIRED       : string
  ERROR_VERIFY_CODE_TIMEOUT        : string
  ERROR_VERIFY_CODE_FAILED         : string
  ERROR_VERIFY_ID_REQUIRED         : string
  ERROR_VERIFY_ID_TIMEOUT          : string
  ERROR_VERIFY_ID_FAILED           : string

  ERROR_CHANNEL_NOTEXIST           : string
} & Record<string, string>