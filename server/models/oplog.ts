import { prop, pre, Ref } from '@typegoose/typegoose'
import { updatecCounter } from './counter'
import User from './user'

@pre<Oplog>('save', async function(next) {
  try {
    if (this.isNew) {
      let counts = await updatecCounter('oplog')
      this.id = counts
    }
  } catch (error) {
    return next(error)
  }
})
export default class Oplog {

  @prop({ unique: true })
  public id!: number

  @prop({ required: true })
  public type!: string

  @prop()
  public content!: string

  @prop()
  public ip!: string

  @prop({ type: Object, default: {} })
  public api!: Object

  @prop({ ref: User })
  public user!: Ref<User>

  @prop({ type: Date, default: new Date() })
  public create_at!: Date
}