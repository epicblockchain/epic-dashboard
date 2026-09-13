help:		## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

all: ## build all supported 64 bit packages... requires mono and wine
	rm -rf out/*
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-squirrel" --platform="win32" --arch="x64"
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="x64","arm64"
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-rpm" --platform="linux" --arch="x64"
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-zip" --platform="darwin" --arch="x64","arm64"

win64: ## 64 bit windows
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-squirrel" --platform="win32" --arch="x64"

deb64: ## 64 bit deb
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="x64"

debarm64: ## deb for arm64
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="arm64"

rpm64: ## 64 bit rpm
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-rpm" --platform="linux" --arch="x64"

mac: ## mac build
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-zip" --platform="darwin" --arch="x64","arm64"
	
clean: ## remove all built files
	rm -rf out/*
