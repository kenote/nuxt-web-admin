

all: install

clear:
	@rm -rf node_modules
	@rm -rf package-lock.json

install:
	@npm install

reinstall:
	@make clear
	@make install