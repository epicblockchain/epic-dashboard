help:		## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

dist: ## run the package and make for all platformas and architectures... requires mono, wine, wine32, read the error messages
	electron-forge make --targets="@electron-forge/maker-squirrel" --platform="win32" --arch="ia32","x64"
	electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="ia32","x64","arm64","armv7l"
##	electron-forge make --targets="@electron-forge/maker-rpm" --platform="linux" --arch="ia32","x64","arm64","armv7l"
	electron-forge make --targets="@electron-forge/maker-zip" --platform="darwin" --arch="x64"

armhf: ## for raspberry pi
	electron-forge make --targets="@electron-forge/maker-deb" --platform="linux" --arch="armv7l"
	
clean: ## remove all built files
	rm -rf out/*
