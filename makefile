help:		## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

all: ## run the package and make for all platformas and architectures... requires mono, wine, wine32, read the error messages
	rm -rf out/*
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-squirrel" --platform="win32" --arch="ia32","x64"
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="x64","arm64","armv7l"
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-rpm" --platform="linux" --arch="x64"
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-zip" --platform="darwin" --arch="x64","arm64"

win64: ## 64 bit windows
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-squirrel" --platform="win32" --arch="x64"

win32: ## 32 bit windows
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-squirrel" --platform="win32" --arch="ia32"

deb32: ## 32 bit deb
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="ia32"

deb64: ## 64 bit deb
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="x64"

debarmhf: ## deb for armv7l / armhf
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="armv7l"

debarm64: ## deb for arm64
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="arm64"

rpm32: ## 32 bit rpm
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-rpm" --platform="linux" --arch="ia32"

rpm64: ## 64 bit rpm
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-rpm" --platform="linux" --arch="x64"

mac: ## mac build
	node_modules/.bin/electron-forge make --targets="@electron-forge/maker-zip" --platform="darwin" --arch="x64","arm64"
	
clean: ## remove all built files
	rm -rf out/*
