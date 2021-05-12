

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

vditor:
	@cp -r node_modules/vditor/dist/. static/dist

start:
	@[ -f ecosystem.config.js ] && pm2 start ecosystem.config.js

delete:
	@[ -f ecosystem.config.js ] && pm2 delete ecosystem.config.js

deploy:
	@kenote deploy

deploy.tar:
	@kenote deploy --only-compress

deploy.intact:
	@kenote deploy --node-modules

deploy.intact.tar:
	@kenote deploy --node-modules --only-compress