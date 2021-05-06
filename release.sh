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
      rsync -av ./config/ $release/config/ --exclude='*.yml' --exclude='*.yaml' --delete
    ;;
    dist)
      rsync -av $release/ .deploy/dist/
    ;;
    *)
    exit;;
  esac
}

start