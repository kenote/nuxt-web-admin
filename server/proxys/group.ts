import { QueryOptions, MongooseDao, autoNumber, UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'
import __Models from '~/models'
import __ErrorCode from '~/utils/error/code'
import { loadError, ErrorState } from '~/utils/error'
import { ResponseGroupDocument, CreateGroupDocument, EditGroupDocument } from '@/types/proxys/group'
import { RemoveOptions } from '@/types/proxys'
import storeProxy from './store'
import userProxy from './user'
import { pick } from 'lodash'
import { oc } from 'ts-optchain'

const Model = __Models.groupModel
const options: QueryOptions = {
  name: 'group',
  populate: {
    path: 'store',
    select: [ 'upload_type', 'download_type' ]
  }
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

  public async create (doc: CreateGroupDocument): Promise<ResponseGroupDocument> {
    let store = await storeProxy(this.errorState).Dao.insert(doc.store)
    let group = await this.Dao.insert({ ...doc, store: store._id }) as ResponseGroupDocument
    return group
  }

  public async update (conditions: any, doc: EditGroupDocument): Promise<UpdateWriteResult> {
    let query = await this.Dao.updateOne(conditions, pick(doc, ['name', 'level', 'description', 'default', 'platform', 'access']))
    if (doc.store) {
      let group = await this.Dao.findOne(conditions) as ResponseGroupDocument
      query = await storeProxy(this.errorState).Dao.updateOne({ _id: group.store._id }, doc.store)
    }
    return query
  }

  public async remove (conditions: any, options?: RemoveOptions): Promise<DeleteWriteResult> {
    let UserProxy = userProxy(this.errorState)
    let StoreProxy = storeProxy(this.errorState)
    let group = await this.Dao.findOne(conditions) as ResponseGroupDocument
    if (group) {
      if (oc(options).move()) {
        await UserProxy.Dao.update({ group: group._id }, { group: oc(options).move() })
      }
      else {
        await UserProxy.remove({ group: group._id })
      }
    }
    if (oc(group).store()) {
      await StoreProxy.Dao.remove({ _id: group.store._id })
    }
    let query = await this.Dao.remove(conditions)
    return query
  }
}

export default (errorState?: ErrorState) => new GroupProxy(errorState || loadError('zh-cn'))