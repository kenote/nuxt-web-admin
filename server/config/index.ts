import { ServerConfiguration } from 'kenote-config-helper'
import { loadData } from 'kenote-config-helper/dist/utils.server'

const config = loadData('config/server') as ServerConfiguration

export = config