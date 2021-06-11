help:		## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

all: ## run the package and make for all platformas and architectures... requires mono, wine, wine32, read the error messages
	electron-forge make --targets="@electron-forge/maker-squirrel" --platform="win32" --arch="ia32","x64"
	electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="ia32","x64","arm64","armv7l"
	electron-forge make --targets="@electron-forge/maker-rpm" --platform="linux" --arch="ia32","x64"
	electron-forge make --targets="@electron-forge/maker-zip" --platform="darwin" --arch="x64"

win64: ## 64 bit windows
	electron-forge make --targets="@electron-forge/maker-squirrel" --platform="win32" --arch="x64"

win32: ## 32 bit windows
	electron-forge make --targets="@electron-forge/maker-squirrel" --platform="win32" --arch="ia32"

deb32: ## 32 bit deb
	electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="ia32"

deb64: ## 64 bit deb
	electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="x64"

debarmhf: ## deb for armv7l / armhf
	electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="armv7l"

debarm64: ## deb for arm64
	electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="arm64"

rpm32: ## 32 bit rpm
	electron-forge make --targets="@electron-forge/maker-rpm" --platform="linux" --arch="ia32"

rpm64: ## 64 bit rpm
	electron-forge make --targets="@electron-forge/maker-rpm" --platform="linux" --arch="x64"

mac: ## mac build
	electron-forge make --targets="@electron-forge/maker-zip" --platform="darwin" --arch="x64"
	
clean: ## remove all built files
	rm -rf out/*
