import { MountController } from 'kenote-express-helper'

export default MountController(
  require('./passport'),
  require('./security'),
  require('./group'),
  require('./team'),
  require('./ticket'),
  require('./user'),
  require('./alicloud'),
  require('./proto'),
  require('./ditch'),
  require('./plan')
)