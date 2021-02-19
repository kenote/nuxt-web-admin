// PM2 Configure
const { loadConfig } = require('@kenote/config')
const { merge } = require('lodash')
const server = loadConfig('config/server', { mode: 'merge' })

const config = {
  name: server.name,
  max_memory_restart: '200M',
  instances: 1,
  instance_var: 'INSTANCE_ID',
  exec_mode: 'cluster',
  cwd: './',
  env: {
    NODE_ENV: 'production',
    HTTP_PORT: 7000
  }
}

function getApplication (tsnode) {
  if (tsnode) {
    return merge(config, {
      script: './node_modules/.bin/ts-node',
      args: '-T -r tsconfig-paths/register ./server/index.ts',
      env: {
        TS_NODE_PROJECT: './server/tsconfig.json',
      }
    })
  }
  return merge(config, {
    script: './dist/index.js',
    interpreter_args: '--harmony',
  })
}

module.exports = {
  apps: [
    getApplication(server.tsnode),
  ]
}