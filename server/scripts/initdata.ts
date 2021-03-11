import { loadConfig } from '@kenote/config'
import { ServerConfigure } from '@/types/config'
import { connect, models } from '~/models'
import * as db from '~/services/db'

async function bootstrap () {
  let { mongoOpts } = loadConfig<ServerConfigure>('config/server', { mode: 'merge' })
  try {
    await connect(mongoOpts!)
    for (let [key, val] of Object.entries(db)) {
      await val.Dao.clear()
    }
    await models.Counter.deleteMany({})
    await models.Counter.collection.dropIndexes()
    let group = await db.group.create({ name: '创建者', level: 9999, description: '创建者拥有系统所有权限，且只有一个帐号' })
    let user = await db.user.create({
      username: 'admin',
      password: 'admin123',
      group: group._id
    })
    console.log(user)
  } catch (error) {
    console.error(error)
  }
}

bootstrap()