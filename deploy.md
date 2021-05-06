# 服务器部署

### 配置部署器

创建配置文件 `deploy.config.yml`

```yaml

env:
  # 需要忽略的文件
  ignre          : &ignre
    - .git/**/*
    - .svn/**/*
  # 打包上传的目录
  rootDir        : &rootDir .deploy/dist
# 项目列表
projects:
  # 项目1
  - 
    # 项目名称
    name           : 项目1
    # 项目键值
    value          : demo1
    # 连接类型: ftp | sftp
    type           : sftp
    # 连接设置
    connect:
      # 主机/IP
      host           : 主机/IP
      # 端口; ftp默认21, sftp默认22
      port           : 22
      # 账号
      username       : root
      # 密码
      password       : 密码
      # RSA密钥; type === 'sftp' 有效
      privateKey     : |-
        -----BEGIN RSA PRIVATE KEY-----
        ...
        -----END RSA PRIVATE KEY-----
    # 远端目标目录
    deployTo       : /home/demo1
    # 打包上传目录
    rootDir        : *rootDir
    # 是否启用压缩; type === 'sftp' 有效
    unzip          : true
    # 需要忽略的文件
    ignre          : 
      - *ignre # 引用公用的忽略选项
    # 上传前运行的本地脚本
    beforeScripts  :
      # 编译代码
      - yarn build
      # 将编译的代码及基本配置拷贝到打包上传目录
      - sh ./deploy.
      # 将指定开发版本配置拷贝到打包上传目录
      - sh ./development.sh <指定开发版本> dist
      # 将当前 Release 配置拷贝到打包上传目录
      - sh ./release.sh <当前 Release> dist
    # 上传后执行的远端脚本，需要 root 权限; type === 'sftp' 有效
    remoteCommand  : 
      # 重启服务
      - make restart
```

### 部署器目录结构

```bash
├── .deploy
│   ├── development  # 开发版本
│   │   └── default
│   ├── dist  # 打包上传目录
│   │   ├── .nuxt
│   │   ├── config
│   │   ├── dist
│   │   ├── static  # 静态文件
│   │   ├── ecosystem.config.js  # PM2 配置文件
│   │   └── package.json
│   └── release  # Release
│   │   ├── demo1
│       └── demo2
├── deploy.config.yml  # 部署器配置文件
├── deploy.sh  # 同步编译代码和基础配置
├── development.sh  # 同步开发版本配置
└── release.sh  # 同步 Release 配置
```

### 运行部署器

```bash
# 部署到服务器
make deploy

# 将部署到服务器的文件打包
make deploy.tar

# 部署到服务器（包含 `node-modules` 目录 ）
make deploy.intact

# 将部署到服务器的文件打包（包含 `node-modules` 目录 ）
make deploy.intact.tar
```