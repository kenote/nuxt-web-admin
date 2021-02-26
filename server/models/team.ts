import mongoose from 'mongoose'
import { prop, plugin, Ref } from '@typegoose/typegoose'
import AutoIncrementFactory from 'mongoose-sequence'
import User from './user'

const AutoIncrement = AutoIncrementFactory(mongoose)

@plugin(AutoIncrement, { inc_field: 'id', id: 'teamid' })
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