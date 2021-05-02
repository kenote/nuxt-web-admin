#!/bin/bash

start(){
  rm -rf .deploy/dist
  mkdir -p .deploy/dist

  rsync -av .nuxt/ .deploy/dist/.nuxt/ --delete
  rsync -av ./dist/ .deploy/dist/dist/ --delete

  rsync -av ./static/ .deploy/dist/static --delete
  rsync -av ./views/ .deploy/dist/views/ --delete

  rsync -av ./config/ .deploy/dist/config/ --include='*.default.yml' --include='*.default.yaml' --exclude='*.yml' --exclude='*.yaml' --delete

  rsync -av ./nuxt.config.js .deploy/dist/nuxt.config.js --delete
  rsync -av ./package.json .deploy/dist/package.json --delete
  rsync -av ./scosystem.config.js .deploy/dist/scosystem.config.js --delete

  echo
}

start