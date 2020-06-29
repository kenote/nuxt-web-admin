import { QueryOptions, MongooseDao, autoNumber, DeleteWriteResult } from 'kenote-mongoose-helper'
import __Models from '~/models'
import __ErrorCode from '~/utils/error/code'
import { loadError, ErrorState } from '~/utils/error'
import userProxy from './user'

const Model = __Models.teamModel
const options: QueryOptions = {
  name: 'team'
}

@autoNumber({})
class TeamDao extends MongooseDao {}

class TeamProxy {

  public Dao = new TeamDao(Model, options)

  private errorState: ErrorState

  constructor (errorState: ErrorState) {
    this.errorState = errorState
  }

  public async remove (conditions: any): Promise<DeleteWriteResult> {
    let { _id } = conditions
    // 先移除团队用户
    await userProxy(this.errorState).Dao.update({ teams: _id }, { $pull: { teams: _id }}, { multi: true })
    let query: DeleteWriteResult = await this.Dao.remove(conditions)
    return query
  }
}

export default (errorState?: ErrorState) => new TeamProxy(errorState || loadError('zh-cn'))