import * as http from 'http'
import * as express from 'express'
import { nuxt, nuxtReady, nuxtHandler } from '~/nuxt.config'
import { Host, Port } from '~/config'

async function start (): Promise<void> {
  let app: express.Application = express()
  
  // Render Nuxt ...
  await nuxtReady()
  app.use(nuxtHandler, nuxt.render)
  
  // Running Server ...
  http.createServer(app).listen(Port, Host, () => {
    console.log(`\nService running in %s environment, PORT: %d ...`, process.env.NODE_ENV || 'development', Port)
  })
}

start()