import { Mailer, MailerSetting, Setting } from 'kenote-mailer-helper'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import * as nunjucks from 'nunjucks'
import { ResponseUserDocument } from '@/types/proxys/user'
import { site_name } from '~/config'

const setting = loadData('config/mailer') as MailerSetting

@Setting({ 
  ...setting, 
  renderString: nunjucks.renderString 
})
class NodeMailer extends Mailer {}

export default new NodeMailer()


export const mailSender = `${site_name} <${setting.smtpOptions.auth?.user}>`

export const parseMailUser = (user: ResponseUserDocument): string => `${user.username} <${user.email}>`