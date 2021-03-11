import { prop, pre, Ref } from '@typegoose/typegoose'
import { updatecCounter } from './counter'
import User from './user'

@pre<Verify>('save', async function(next) {
  try {
    if (this.isNew) {
      let counts = await updatecCounter('verify')
      this.id = counts
    }
  } catch (error) {
    return next(error)
  }
})
export default class Verify {

  @prop({ unique: true })
  public id!: number

  @prop()
  public type!: string

  @prop()
  public token!: string

  @prop({ default: false })
  public approved!: boolean

  @prop()
  public application!: string

  @prop({ ref: User })
  public user!: Ref<User>

  @prop({ type: Date, default: new Date() })
  public create_at!: Date

  @prop({ type: Date, default: new Date() })
  public update_at!: Date
}