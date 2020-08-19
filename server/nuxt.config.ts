import { Nuxt, Builder } from 'nuxt'
import nuxtConfig from '../nuxt.config'
import { options } from '~/config'
import { oc } from 'ts-optchain'

const dev: boolean = process.env.NODE_ENV !== 'production'
nuxtConfig.head = {
  ...nuxtConfig.head,
  title: oc(options).title(),
  meta: oc(options).meta([])
}
export const nuxt: Nuxt = new Nuxt({ ...nuxtConfig, dev })

export async function nuxtReady (): Promise<void> {
  await nuxt.ready()
  if (process.env.NODE_ENV === 'development') {
    const builder: Builder = new Builder(nuxt)
    await builder.build()
  }
}

export { nuxtHandler } from '~/middleware/nuxt'