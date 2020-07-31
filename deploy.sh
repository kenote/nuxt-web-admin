#!/bin/bash

start(){
  mkdir -p .deploy/dist
  rsync -av .nuxt/ .deploy/dist/.nuxt/ --delete
  rsync -av ./build/ .deploy/dist/build/ --delete
  rsync -av ./package.json .deploy/dist/package.json --delete
  rsync -av ./config/ .deploy/dist/config/ --exclude-from="./exclude.config.list" --delete

  rsync -av ./client/ .deploy/dist/client/ --exclude-from="./exclude.client.list" --delete
  rsync -av ./mails/ .deploy/dist/mails/ --delete
  rsync -av ./projects/ .deploy/dist/projects/ --delete
  rsync -av ./views/ .deploy/dist/views/ --delete

  echo
}

start