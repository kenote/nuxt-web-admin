import mongoose from 'mongoose'
import { prop, plugin } from '@typegoose/typegoose'
import AutoIncrementFactory from 'mongoose-sequence'

const AutoIncrement = AutoIncrementFactory(mongoose)

@plugin(AutoIncrement, { inc_field: 'id', id: 'groupid' })
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