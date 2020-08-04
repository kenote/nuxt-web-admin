#!/bin/bash

start(){
  rm -rf .deploy/dist
  mkdir -p .deploy/dist
  rsync -av .nuxt/ .deploy/dist/.nuxt/ --delete
  rsync -av ./build/ .deploy/dist/build/ --delete
  rsync -av ./package.json .deploy/dist/package.json --delete
  rsync -av ./config/ .deploy/dist/config/ --include='*.default.yml' --exclude='*.yml' --delete

  rsync -av ./client/ .deploy/dist/client/ --exclude-from="./exclude.client.list" --delete
  rsync -av ./mails/ .deploy/dist/mails/ --delete
  rsync -av ./views/ .deploy/dist/views/ --delete

  echo
}

start