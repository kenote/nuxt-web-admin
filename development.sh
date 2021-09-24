#!/bin/bash

name=$1
type=$2
root=$(cd "$(dirname "$0")";pwd)

start(){
  development=.deploy/development/${name}
  case $type in
    backup)
      mkdir -p $development
      rsync -av ./config/ $development/config/ --exclude="*.default.yml" --exclude="*.default.yaml" --delete
      rsync -av ./project/ $development/project/ --delete
    ;;
    restore)
      find ./config/ ! -name *.default.yml -type f | xargs rm -rf
      rsync -av $development/config/ ./config/ 
      rsync -av $development/project/ ./project/ 
    ;;
    dist)
      rsync -av $development/config/ .deploy/dist/config/ 
    ;;
    *)
    exit;;
  esac
}

start