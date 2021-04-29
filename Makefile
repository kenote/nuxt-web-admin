

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