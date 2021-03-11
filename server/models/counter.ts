import { prop } from '@typegoose/typegoose'
import { models } from '.'

export default class Counter {

  @prop({ required: true })
  public name!: string

  @prop({ default: 0 })
  public seq!: number
}

export async function updatecCounter (name: string) {
  let counter = await models.Counter.findOneAndUpdate({ name }, { $inc: { seq: 1 }}, { new: true, upsert: true })
  return counter.seq
}