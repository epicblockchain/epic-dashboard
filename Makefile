help:		## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

release:	## Generate binaries on all platforms
	@echo "generating releases..."
	@npm run-script build
	@echo "popular os"
	@electron-packager . "ePIC-Dashboard" --platform="darwin,linux,win32" --arch="ia32,x64,armv7l,arm64" --icon=./icon/512x512 --overwrite=true

release-hometemp: # generate binaries with hometemp
	@echo "generating releases..."
	@npm run-script build
	@echo "popular os"
	@electron-packager . "ePIC-Dashboard" --platform="darwin,linux,win32" --tmpdir="/home" --arch="ia32,x64,armv7l,arm64" --icon=./icon/512x512 --overwrite=true

zip:		## Compress generated binaries into zip files
	@echo "compressing..."
	@rm -rf *.zip
	zip -r darwin_x64.zip ePIC-Dashboard-darwin-x64
	zip -r linux_arm64.zip ePIC-Dashboard-linux-arm64
	zip -r linux_armv7l.zip ePIC-Dashboard-linux-armv7l
	zip -r linux_ia32.zip ePIC-Dashboard-linux-ia32
	zip -r linux_x64.zip ePIC-Dashboard-linux-x64
	zip -r win_arm64.zip ePIC-Dashboard-win32-arm64
	zip -r win_ia32.zip ePIC-Dashboard-win32-ia32
	zip -r win_x64.zip ePIC-Dashboard-win32-x64

sha256:		## Generates sha256 checksum
	@echo "generating sha256 checksums..."
	@$(eval DARWIN_64=$(shell sha256sum darwin_x64.zip))
	@$(eval LINUX_64=$(shell sha256sum linux_x64.zip))
	@$(eval WIN_64=$(shell sha256sum win_x64.zip))
	@$(eval LINUX_32=$(shell sha256sum linux_ia32.zip))
	@$(eval WIN_32=$(shell sha256sum win_ia32.zip))

	@$(eval LINUX_ARMV7=$(shell sha256sum linux_armv7l.zip))
	@$(eval LINUX_ARM64=$(shell sha256sum linux_arm64.zip))
	@$(eval WIN_ARM64=$(shell sha256sum win_arm64.zip))

	$(file > checksums.txt, $(DARWIN_64))
	$(file >> checksums.txt, $(LINUX_64))
	$(file >> checksums.txt, $(WIN_64))
	$(file >> checksums.txt, $(LINUX_32))
	$(file >> checksums.txt, $(WIN_32))

	$(file >> checksums.txt, $(LINUX_ARMV7))
	$(file >> checksums.txt, $(LINUX_ARM64))
	$(file >> checksums.txt, $(WIN_ARM64))

clean:		## Remove generated binaries and zip files
	@echo "cleaning up..."
	@rm -rf ./ePIC-Dashboard-*
	@rm -f *.zip
	@rm -f checksums.txt

all: release zip sha256##

all-hometemp: release-hometemp zip sha256##
