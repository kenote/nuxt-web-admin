#!/bin/bash

start(){
  rm -rf .deploy/dist
  mkdir -p .deploy/dist

  rsync -av .nuxt/ .deploy/dist/.nuxt/ --delete
  rsync -av ./dist/ .deploy/dist/dist/ --delete

  rsync -av ./mails/ .deploy/dist/mails --delete
  rsync -av ./static/ .deploy/dist/static --delete
  rsync -av ./views/ .deploy/dist/views/ --delete

  rsync -av ./config/ .deploy/dist/config/ --include='*.default.yml' --include='*.default.yaml' --exclude='*.yml' --exclude='*.yaml' --delete
  mkdir -p .deploy/dist/project
  rsync -av ./project/account/ .deploy/dist/project/account/ --delete
  rsync -av ./project/ucenter/ .deploy/dist/project/ucenter/ --delete
  rsync -av ./project/system/ .deploy/dist/project/system/ --delete
  rsync -av ./project/alicloud/ .deploy/dist/project/alicloud/ --delete

  rsync -av ./nuxt.config.js .deploy/dist/nuxt.config.js --delete
  rsync -av ./package.json .deploy/dist/package.json --delete
  rsync -av ./ecosystem.config.js .deploy/dist/ecosystem.config.js --delete

  echo
}

start