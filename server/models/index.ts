
import { Connector, Connect, ConnectorSetting, MountModels } from 'kenote-mongoose-helper'
import { mongodb } from '~/config'
import storeModel from './store'
import groupModel from './group'
import userModel from './user'
import teamModel from './team'
import planModel from './plan'
import ditchModel from './ditch'
import protoModel from './proto'
import ticketModel from './ticket'
import verifyModel from './verify'

@Connect(mongodb as ConnectorSetting)
@MountModels({
  storeModel,
  groupModel,
  userModel,
  teamModel,
  planModel,
  ditchModel,
  protoModel,
  ticketModel,
  verifyModel
})
class MongoDB extends Connector {

  constructor () {
    super()
    this.connect()
  }
}

export default new MongoDB().__Models || {}