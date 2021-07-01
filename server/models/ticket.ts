import { prop, pre } from '@typegoose/typegoose'
import { updatecCounter } from './counter'

@pre<Ticket>('save', async function(next) {
  try {
    if (this.isNew) {
      let counts = await updatecCounter('ticket')
      this.id = counts
    }
  } catch (error) {
    return next(error)
  }
})
export default class Ticket {

  @prop({ unique: true })
  public id!: number

  @prop()
  public name!: string

  @prop({ required: true })
  public cdkey!: string

  @prop()
  public type!: string

  @prop({ type: Object, default: {} })
  public setting!: Object

  @prop({ default: 0 })
  public stint!: number

  @prop({ default: 0 })
  public uses!: number

  @prop({ default: false })
  public used!: boolean

  @prop({ type: Date, default: new Date() })
  public create_at!: Date

  @prop({ type: Date, default: new Date() })
  public last_at!: Date
}