import { prop, pre, Ref } from '@typegoose/typegoose'
import { updatecCounter } from './counter'
import User from './user'

@pre<Plan>('save', async function(next) {
  try {
    if (this.isNew) {
      let counts = await updatecCounter('plan')
      this.id = counts
    }
  } catch (error) {
    return next(error)
  }
})
export default class Plan {

  @prop({ unique: true })
  public id!: number

  @prop()
  public type!: string

  @prop()
  public name!: string

  @prop()
  public content!: string

  @prop({ ref: User })
  public user!: Ref<User>

  @prop({ type: Date, default: new Date() })
  public create_at!: Date

  @prop({ type: Date, default: new Date() })
  public update_at!: Date

  @prop()
  public associate!: string

}