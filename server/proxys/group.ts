import { QueryOptions, MongooseDao, autoNumber } from 'kenote-mongoose-helper'
import __Models from '~/models'
import __ErrorCode from '~/utils/error/code'
import { loadError, ErrorState } from '~/utils/error'
import { ResponseGroupDocument } from '@/types/proxys/group'

const Model = __Models.groupModel
const options: QueryOptions = {
  name: 'group'
}

@autoNumber({})
class GroupDao extends MongooseDao {}

class GroupProxy {

  public Dao = new GroupDao(Model, options)

  private errorState: ErrorState

  constructor (errorState: ErrorState) {
    this.errorState = errorState
  }

  public async defaultGroup (): Promise<ResponseGroupDocument> {
    let result = await this.Dao.findOne({ default: true }) as ResponseGroupDocument
    return result
  }
}

export default (errorState?: ErrorState) => new GroupProxy(errorState || loadError('zh-cn'))