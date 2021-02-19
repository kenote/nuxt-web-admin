import path from 'path'
import { Mailer, MailerSetting } from '@kenote/mailer'
import { renderString } from 'nunjucks'
import { loadConfig } from '@kenote/config'

const { smtpOptions, mailDir, asyncRetryOptions } = loadConfig<MailerSetting>('config/mailer', { mode: 'merge' })

export default new Mailer({
  mailDir: path.resolve(process.cwd(), mailDir ?? 'mails'),
  smtpOptions,
  asyncRetryOptions,
  renderString
})