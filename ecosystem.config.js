// PM2 Configure
const { loadData } = require('kenote-config-helper/dist/utils.server')
const { session_secret } = loadData('config/server')

module.exports = {
  apps : [
    {
      name: session_secret,
      script: './build/index.js',
      max_memory_restart: '200M',
      interpreter_args: '--harmony',
      instances: 1,
      instance_var: session_secret || 'INSTANCE_ID',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}