help:		## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

release:	## Generate binaries on all platforms
	@echo "generating releases..."
	@electron-packager . "ePIC-Dashboard" --platform=all

zip:		## Compress generated binaries into zip files
	@echo "compressing..."
	@rm -rf *.zip
	zip -r darwin.zip ePIC-Dashboard-darwin-x64
	zip -r linux.zip ePIC-Dashboard-linux-x64
	zip -r mas.zip ePIC-Dashboard-mas-x64
	zip -r win32.zip ePIC-Dashboard-win32-x64

sha256:		## Generates sha256 checksum
	@echo "generating sha256 checksums..."
	@$(eval DARWIN=$(shell sha256sum darwin.zip))
	@$(eval LINUX=$(shell sha256sum linux.zip))
	@$(eval MAS=$(shell sha256sum mas.zip))
	@$(eval WIN=$(shell sha256sum win32.zip))
	$(file > checksums.txt, $(DARWIN))
	$(file >> checksums.txt, $(LINUX))
	$(file >> checksums.txt, $(MAS))
	$(file >> checksums.txt, $(WIN))

clean:		## Remove generated binaries and zip files
	@echo "cleaning up..."
	@rm -rf ./ePIC-Dashboard-*
	@rm -f *.zip
	@rm -f checksums.txt

all: release zip sha256##