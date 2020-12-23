help:		## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

release:	## Generate binaries on all platforms
	@echo "generating releases..."
	@npm run-script build
	@echo "popular os"
	@electron-packager . "ePIC-Dashboard" --platform="darwin,linux,win32" --arch="ia32,x64" --icon=./icon/512x512 --overwrite=true
	# @echo "arm"
	# @electron-packager . "ePIC-Dashboard" --platform="armv7l,arm64" --icon=./icon/512x512 --overwrite=true
	# @echo "mips"
	# @electron-packager . "ePIC-Dashboard" --platform="linux" --arch="mips64el"

zip:		## Compress generated binaries into zip files
	@echo "compressing..."
	@rm -rf *.zip
	zip -r darwin_64.zip ePIC-Dashboard-darwin-x64
	zip -r win32_64.zip ePIC-Dashboard-win32-x64
	zip -r win32_32.zip ePIC-Dashboard-win32-ia32
	zip -r linux_64.zip ePIC-Dashboard-linux-x64
	zip -r linux_32.zip ePIC-Dashboard-linux-ia32
	zip -r linux_armv7.zip ePIC-Dashboard-linux-armvl
	zip -r linux_arm64.zip ePIC-Dashboard-linux-arm64
	zip -r linux_mips64.zip ePIC-Dashboard-linux-mips64el

sha256:		## Generates sha256 checksum
	@echo "generating sha256 checksums..."
	@$(eval DARWIN_64=$(shell sha256sum darwin_64.zip))
	@$(eval LINUX_64=$(shell sha256sum linux_64.zip))
	@$(eval WIN_64=$(shell sha256sum win32_64.zip))
	@$(eval LINUX_32=$(shell sha256sum linux_32.zip))
	@$(eval WIN_32=$(shell sha256sum win32_32.zip))

	@$(eval LINUX_ARMV7=$(shell sha256sum linux_armv7.zip))
	@$(eval LINUX_ARM64=$(shell sha256sum linux_arm64.zip))
	@$(eval LINUX_MIPS64=$(shell sha256sum linux_mips64el.zip))

	$(file > checksums.txt, $(DARWIN_64))
	$(file >> checksums.txt, $(LINUX_64))
	$(file >> checksums.txt, $(WIN_64))
	$(file >> checksums.txt, $(LINUX_32))
	$(file >> checksums.txt, $(WIN_32))

	$(file >> checksums.txt, $(LINUX_ARMV7))
	$(file >> checksums.txt, $(LINUX_ARM64))
	$(file >> checksums.txt, $(LINUX_MIPS64))

clean:		## Remove generated binaries and zip files
	@echo "cleaning up..."
	@rm -rf ./ePIC-Dashboard-*
	@rm -f *.zip
	@rm -f checksums.txt

all: release zip sha256##
