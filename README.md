# How to Get Started
Please read COPYING and EULA before proceeding
## Getting started from a binary
Download the appropriate zip/installer file for the OS you would like to run the program on. 
## Getting started from source
Clone this repo
```
git clone https://github.com/epicblockchain/epic-dashboard.git
npm install
npm start
```
After bundling a window should open with the app running.
## Building from source
To build all executables run
```
npm run make
```
To build only a specific executable open the makefile and run electron-forge make, editing --platform and --arch to your platform and architecture. You may need to install the electron-forge CLI: https://www.electronforge.io/cli
## Usage
# ePIC-Miner

Please read EULA.md and PRIVACY.

# Required materials

## Included with ePIC miner

* ePIC miner
* SD card

## Not included with ePIC miner

* SD card to USB adapter
* Power supply
* Power cable
* Ethernet cable

# Installation guide

Download the miner image from the releases section on the sidebar to the right or from [here](https://github.com/epicblockchain/epic-miner/releases/).
The default password for the miner is "letmein". Please allow this miner to run on public and private networks if asked so that the software can identify miners on your network.

## Flashing a microSD card with ePIC image

Please note that the SD card included with the miner does not come pre-flashed. You must flash an image onto it using the instructions below for the miner to operate properly.

1. Download [balenaEtcher](https://www.balena.io/etcher/) for your machine.
2. Download compressed image (ePIC-SC200-vX.X.X-xxxxxxxxxx.zip)
3. Unzip the compressed image from the previous step. (ePIC-SC200-vX.X.X-xxxxxxxxxx.img)
4. Plug in microSD card into PC
5. Open the Etcher application (balenaEtcher).
![image of etcher application](images/balena.png)
6. Select Flash from file and choose the image file
7. Select target device
8. Click "Flash!" and wait for the process to finish.
9. Safely remove the SD card from the machine

## Inserting the SD card into the miner

1. Find the SD card slot for the miner.

![image of sd card contacts](images/sd_card_contacts.jpg)

2. Push the SD card into the slot until it clicks. It should have the gold coloured contacts facing up when inserted. The SD card may fall into the miner if the angle of insertion is wrong. Angle the SD card slightly up when inserting it. Wait for some resistance and then a click when pushing from the slot before releasing the chip.

![image of almost inserted card](images/sd_card_almost_inserted.jpg)

![image of inserted card](images/sd_card_inserted.jpg)

## Connecting Cables

The power cable must be plugged in last.

### Fan cables

Plug in the fan cables. Face the front of the miner which has the ethernet port. The closest fan must connect to the left (when facing the miner) fan power port. The fan at the back of the miner must connect to the right (when facing the miner) fan power port.

![image of fan cables](images/fan_cables.jpg)

### Ethernet cable

Plug in the ethernet cable from your network to the fan.

### Power cable

Plug in the power cable.

Note: the miner will not appear on the network for up to 15 minutes. It may restart several times as it find the optimal configuration to mine at.

# Using the dashboard software

1. Download the dashboard software from [here](https://github.com/epicblockchain/epic-dashboard/releases/)
2. Use the sidebar on the left to navigate to tabs.

## Instructions for VPN users

Note that the software uses MDNS to discover miners on your network. This functionality does not work over a VPN. You will need to navigate to the Miner List tab and manually add miners.

## Miner Settings

To modify the settings for the miner use the sidebar to select the Miner Settings tab. If the sidebar is not open it can be opened using the button in the top left of the screen.

![expand sidebar](images/expand_sidebar.png)

![click settings](images/click_settings.png)

You must select which miners to apply the settings to by clicking the switches in the table on the settings page.

![not selected miner](images/not_selected_miner.png)

![selected miner](images/selected_miner.png)

By default all of the miners have a password of **letmein**.

After clicking apply you will recieve feedback letting you know if the request succeeded or failed. If in a rare case you recieve no feedback, assume the update to the miner settings has failed, or use the Miner List tab to verify your settings.

### Updating mining pool

Click on the "Mining Pool" tab on the settings page to view the mining pool settings. Fill out the fields and click apply. If the apply button is disabled, you must remember to select some miners to apply the settings to and fill out all form fields.

![mining pool](images/mining_pool.png)

### Updating wallet address

Click on the "Wallet Address" tab on the settings page. Fill out the fields and click apply.

![wallet address](images/wallet_address.png)

### Updating operating mode

Click on the "Operating Mode" tab on the settings page. Fill out the fields and click apply. Your miner may take up to 15 minutes to recalibrate with the new operating mode.

![operating mode](images/operating_mode.png)

### Updating appending unique id to miner name

Click on the "Unique ID" tab on the settings page. Fill out the fields and click apply.

![unique id](images/unique_id.png)

### Updating password

Click on the "Password" tab on the settings page. Fill out the fields and click apply.

![password](images/password.png)

### Updating firmware

Use your preferred internet browser to go to https://github.com/epicblockchain/epic-miner/releases and download the latest release of the firmware. Extract the zip file and note its location. Click on the "Firmware" tab on the settings page. Click browse and select the location of the extracted zip folder. Select the file ending in .swu within that folder. The "Maintain config over update" will save your settings across the update. Fill out the rest of the fields and click apply. You miner will take up to 15 minutes to reboot and recalibrate.
![updating firmware](images/updating_firmware.png)

### Rebooting your miner

Click on the "Reboot" tab on the settings page. Fill out the fields and click apply. Your miner may take a few minutes to reboot.

![reboot](images/reboot.png)

### Recalibrating your miner

Click on the "Recalibrate" tab on the settings page. Fill out the fields and click apply. Your miner may take up to 15 minutes to reboot and recalibrate.

![recalibrate](images/recalibrate.png)

## Adding miners

If you are connecting over VPN or MDNS discovery is not functional for some reason, you may need to manually add miner IP addresses.

### Manually adding miners

To manually add miners navigate to the Miner List tab in the sidebar.

![miner list](images/miner_list.png)

Type the miner ip in the field and click on "Add Miner via IP". This will add the miner to your list and save all the miners to a file.
After you have added all your miners you can choose to click "Save current miners" to store all the currently visible miners to a file so that your don't need to manually add them again.
In the future, you can load the saved miners by clicking on "Load previously added miners".

![manually adding miner list](images/manual_add.png)

### Adding miners using a text file

You can edit the same file the software writes to above by modifying or creating ipaddr.txt at the following locations. The expected format is:
```
1.2.3.4:4028
10.10.10.10:4028
```

On windows: AppData/ePIC-Dashboard/ipaddr.txt

On mac: YourHomeFolder/Library/Application Support/ePIC-Dashboard/ipaddr.txt

On linux: ~/.ePIC-Dashboard/ipaddr.txt  (note the period at the front of .ePIC-Dashboard)

## SSH to the miner
```
ssh root@yourminerip
```
When prompted for a password enter the miner password, by default "letmein"

## Specific addresses

It is possible to add ips with a file if mdns is not working for some reason.
Use the interface in the table tab to add, save and load miners.
