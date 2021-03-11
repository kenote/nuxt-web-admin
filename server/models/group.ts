import { prop, pre } from '@typegoose/typegoose'
import { updatecCounter } from './counter'

@pre<Group>('save', async function(next) {
  try {
    if (this.isNew) {
      let counts = await updatecCounter('group')
      this.id = counts
    }
  } catch (error) {
    return next(error)
  }
})
export default class Group {

  @prop({ unique: true })
  public id!: number

  @prop({ required: true })
  public name!: string

  @prop({ default: 0 })
  public level!: number

  @prop()
  public description!: string

  @prop({ type: Array, default: [] })
  public platform!: number[]

  @prop({ type: Array, default: [] })
  public access!: string[]

  @prop({ type: Object, default: {} })
  public store!: Object
}