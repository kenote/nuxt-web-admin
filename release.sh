#!/bin/bash

name=$1
type=$2
root=$(cd "$(dirname "$0")";pwd)

start(){
  release=.deploy/release/${name}
  echo $release
  case $type in
    create)
      mkdir -p $release
      rsync -av ./config/ $release/config/ --include='*/' --exclude='*' --delete
      rsync -av ./projects/ $release/projects/ --include='*/' --exclude='*' --delete
      find $release/projects/ -name api -type d | xargs rm -rf
      find $release/projects/ -name pb -type d | xargs rm -rf
      mkdir -p $release/client/static
      rsync -av ./client/static/ $release/client/static/ --include='*/' --exclude='*' --delete
    ;;
    dist)
      rsync -av $release/ .deploy/dist/
    ;;
    *)
    exit;;
  esac
}

start