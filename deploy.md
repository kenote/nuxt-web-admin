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
      - sh ./deploy.sh
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

### Nginx 配置

HTTP 配置
```nginx
# 日志格式
log_format  demo1_log_format '$remote_addr - $remote_user [$time_local] "$request" '
            '$status $body_bytes_sent "$http_referer" '
            '"$http_user_agent" $http_x_forwarded_for';

# 代理/负载均衡
upstream demo1-upstream
{
    server	127.0.0.1:4000;
}

# 设置 HTTP
server {
    listen      80;
    server_name 域名或IP;
    index       index.html index.htm default.html default.htm;
    root        /path/to/static;

    # 映射代理服务器
    location / {
        proxy_pass http://demo1-upstream;
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy ture;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 映射 Nuxt.js 静态文件
    location ^~ /\_nuxt/ {
        root    /path/to/.nuxt;
    }

    # 设置访问日志
    access_log  /path/to/nginx/access.log  demo1_log_format;
    error_log   /path/to/nginx/error.log warn;
}
```

HTTPS 配置
```nginx
# 设置 HTTP 跳转 HTTPS
server
{
    listen      80;
    server_name 域名或IP;
    return      301 https://admincp.kenote.top$request_uri;
}

# 设置 HTTPS
server {
    listen      433 ssl;
    server_name 域名或IP;
    index       index.html index.htm default.html default.htm;
    root        /path/to/static;

    ssl_certificate /path/to/cert-file-name.pem;  #需要将cert-file-name.pem替换成已上传的证书文件的名称。
    ssl_certificate_key /path/to/cert-file-name.key; #需要将cert-file-name.key替换成已上传的证书密钥文件的名称。
    ssl_session_timeout 5m;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    #表示使用的加密套件的类型。
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; #表示使用的TLS协议的类型。
    ssl_prefer_server_ciphers on;

    # 映射代理服务器
    location / {
        proxy_pass http://demo1-upstream;
        proxy_redirect off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy ture;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 映射 Nuxt.js 静态文件
    location ^~ /\_nuxt/ {
        root    /path/to/.nuxt;
    }

    # 设置访问日志
    access_log  /path/to/nginx/access.log  demo1_log_format;
    error_log   /path/to/nginx/error.log warn;
}
```

### 定义 Makefile

```makefile
PATH=/root/.nvm/versions/node/v14.15.4/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin:/root/bin:/bin:/usr/local/

all: install

clear:
	@rm -rf node_modules
	@rm -rf package-lock.json
	@rm -rf yarn.lock

install:
	@npm install

reinstall:
	@make clear
	@make install

# Start PM2
start:
	@[ -f ecosystem.config.js ] && pm2 start ecosystem.config.js && pm2 save

# Delete PM2
deleta:
	@[ -f ecosystem.config.js ] && pm2 delete ecosystem.config.js && pm2 save

# Restart PM2
restart:
	@[ -f ecosystem.config.js ] && pm2 restart ecosystem.config.js

initdata:
	@node ./dist/scripts/initdata.js
```