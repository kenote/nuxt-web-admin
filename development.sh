#!/bin/bash

name=$1
type=$2
root=$(cd "$(dirname "$0")";pwd)

start(){
  development=.deploy/development/${name}
  case $type in
    backup)
      mkdir -p $development
      rsync -av ./projects/ $development/projects/ --delete
      rsync -av ./config/ $development/config/ --exclude="*.default.yml" --delete
      rsync -av ./client/ $development/client/ --exclude-from="./exclude.client.list" --delete
      rsync -av ./uploadfiles/ $development/uploadfiles/ --delete
    ;;
    restore)
      rsync -av $development/projects/ ./projects/ --delete
      rsync -av $development/client/static/ ./client/static/ --delete
      find ./config/ ! -name *.default.yml -type f | xargs rm -rf
      rsync -av $development/config/ ./config/ 
      rsync -av $development/uploadfiles/ ./uploadfiles/ --delete
    ;;
    dist)
      rsync -av $development/projects/ .deploy/dist/projects/ --include='*.default.yml' --include='api/*.yml' --exclude-from="./exclude.project.list" --delete
      rsync -av $development/client/static/ .deploy/dist/client/static/
      rsync -av $development/config/ .deploy/dist/config/ 
    ;;
    *)
    exit;;
  esac
}

start