import { Nuxt, Builder } from 'nuxt'
import nuxtConfig from '../nuxt.config'

const dev: boolean = process.env.NODE_ENV !== 'production'
export const nuxt: Nuxt = new Nuxt({ ...nuxtConfig, dev })

export async function nuxtReady (): Promise<void> {
  await nuxt.ready()
  if (process.env.NODE_ENV === 'development') {
    const builder: Builder = new Builder(nuxt)
    await builder.build()
  }
}

export { nuxtHandler } from '~/middleware/nuxt'