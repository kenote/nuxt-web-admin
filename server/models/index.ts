import { model } from 'mongoose'
import { Connector, Connect, ConnectorSetting, MountModels } from 'kenote-mongoose-helper'
import { mongodb } from '~/config'

@Connect(mongodb as ConnectorSetting)
@MountModels({
  storeModel    : model('store'   , require('./store')),
  groupModel    : model('group'   , require('./group')),
  userModel     : model('user'    , require('./user')),
  teamModel     : model('team'    , require('./team')),
  planModel     : model('plan'    , require('./plan')),
  ditchModel    : model('ditch'   , require('./ditch')),
  protoModel    : model('proto'   , require('./proto')),
  ticketModel   : model('ticket'  , require('./ticket')),
  verifyModel   : model('verify'  , require('./verify'))
})
class MongoDB extends Connector {

  constructor () {
    super()
    this.connect()
  }
}

export default new MongoDB().__Models || {}