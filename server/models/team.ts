import mongoose from 'mongoose'
import { prop, pre, Ref } from '@typegoose/typegoose'
import { updatecCounter } from './counter'
import User from './user'

@pre<Team>('save', async function(next) {
  try {
    if (this.isNew) {
      let counts = await updatecCounter('team')
      this.id = counts
    }
  } catch (error) {
    return next(error)
  }
})
export default class Team {

  @prop({ unique: true })
  public id!: number

  @prop({ required: true })
  public name!: string

  @prop({ default: false })
  public super!: boolean

  @prop({ type: Array, default: [] })
  public platform!: number[]

  @prop({ type: Array, default: [] })
  public access!: string[]

  @prop({ type: Object, default: {} })
  public rstps!: Object

  @prop()
  public description!: string

  @prop({ ref: 'User', type: mongoose.Schema.Types.ObjectId })
  public owner!: Ref<User>
}