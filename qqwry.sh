#!/bin/bash

zip_url=http://update.cz88.net/soft/setup.zip
temp_dir=temp
current_dir=`pwd`

start(){
  # 创建临时目录
  rm -rfv $temp_dir
  mkdir $temp_dir && cd $temp_dir

  # 下载压缩包
  wget $zip_url

  # 解压文件
  unzip setup.zip

  # 提取 文件
  innoextract setup.exe

  # 拷贝IP库
  cp app/qqwry.dat $current_dir/config/qqwry.dat

  # 清理临时目录
  cd $current_dir
  rm -rfv $temp_dir

  echo
}

start