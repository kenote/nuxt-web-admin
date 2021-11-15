import { prop, pre, Ref } from '@typegoose/typegoose'
import { updatecCounter } from './counter'
import User from './user'
import { ObjectId } from 'bson'

@pre<Notification>('save', async function(next) {
  try {
    if (this.isNew) {
      let counts = await updatecCounter('notification')
      this.id = counts
    }
  } catch (error) {
    return next(error)
  }
})
export default class Notification {

  @prop({ unique: true })
  public id!: number

  @prop({ required: true })
  public title!: string

  @prop()
  public content!: string

  @prop()
  public type!: string

  @prop({ type: ObjectId, default: [] })
  public readed!: ObjectId[]

  @prop({ type: ObjectId, default: [] })
  public removed!: ObjectId[]

  @prop({ ref: User, default: [] })
  public receiver!: Array<Ref<User>>

  @prop({ type: Date, default: new Date() })
  public create_at!: Date

  @prop({ type: Date, default: new Date() })
  public update_at!: Date

  @prop({ default: false })
  public release!: boolean
}