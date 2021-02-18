// PM2 Configure

module.exports = {
  apps : [
    {
      name: 'kenote',
      script: './node_modules/.bin/ts-node',
      args: '-T -r tsconfig-paths/register ./server/index.ts',
      max_memory_restart: '200M',
      instances: 1,
      instance_var: 'INSTANCE_ID',
      exec_mode: 'cluster',
      cwd: './',
      env: {
        TS_NODE_PROJECT: './server/tsconfig.json',
        NODE_ENV: 'production',
        HTTP_PORT: 7000
      }
    }
  ]
}