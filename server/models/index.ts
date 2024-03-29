import mongoose from 'mongoose'
import { ServerConfigure } from '@/types/config'
import { setGlobalOptions, Severity, getModelForClass } from '@typegoose/typegoose'
import logger from '~/services/logger'

import Group from './group'
import Notification from './notification'
import Oplog from './oplog'
import Plan from './plan'
import Team from './team'
import Ticket from './ticket'
import User from './user'
import Verify from './verify'
import Counter from './counter'

setGlobalOptions({
  options: {
    allowMixed: Severity.ALLOW
  }
})

export async function connect (mongoOpts: ServerConfigure.mongodb) {
  if (!mongoOpts) {
    logger.error(`No configuration found of MongoDB.`)
    process.exit(1)
  }
  let { uris, options } = mongoOpts
  try {
    await mongoose.connect(uris, options)
    logger.info(`connect to ${uris}`)
  } catch (error) {
    logger.info(`connect to ${uris} error: ${error.message}`)
    process.exit(1)
  }
}

export const models = {
  'Group'           : getModelForClass(Group),
  'Notification'    : getModelForClass(Notification),
  'Oplog'           : getModelForClass(Oplog),
  'Plan'            : getModelForClass(Plan),
  'Team'            : getModelForClass(Team),
  'Ticket'          : getModelForClass(Ticket),
  'User'            : getModelForClass(User),
  'Verify'          : getModelForClass(Verify),
  'Counter'         : getModelForClass(Counter)
}
