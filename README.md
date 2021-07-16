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
## Building from source on a fresh machine

### Dependencies

Some dependencies are required to build the dashboard, this process has been tested on Ubuntu 20.04 with a 64 bit cpu
```
sudo apt update
sudo apt install -y curl make git wine mono-devel fakeroot zip rpm
# if you need to build for 32 bit architectures
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y wine32
# end of building for 32 bit
# or install the latest
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash nvm on your own
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
# end of nvm stuff
nvm install 14
npm i -g @electron-forge/cli
cd /path/to/epic-dashboard
npm i
```

### Building

To build all executables run
```
make dist
# see the makefile if you want to install for only one target+architecture
```
To build only a specific executable open the makefile and run the appropriate command ensureing --platform and --arch match your desired platform and architecture to build for.

# Usage

1. Download the dashboard software from [here](https://github.com/epicblockchain/epic-dashboard/releases/)
2. Use the sidebar on the left to navigate to tabs.

## Instructions for VPN users

Note that the software uses MDNS to discover miners on your network. This functionality does not work over a VPN. You will need to navigate to the Miner List tab and manually add miners.

## Miner Settings

To modify the settings for the miner use the sidebar to navigate to the Table tab. If the sidebar is not open it can be opened using the button in the top left of the screen.

![expand sidebar](docs/images/expand_sidebar.png)
![click settings](docs/images/click_table.png)

You must select which miners to apply the settings to by clicking the checkboxes on the left side of each row in the table.

![selected miner](docs/images/selected_miners.png)

By default all of the miners have a password of **letmein**.

After clicking apply you will recieve feedback letting you know if the request succeeded or failed.

### Updating Coin

Click on the "COIN" tab. Fill out the fields and click apply.

![coin](docs/images/coin.png)

### Updating mining pool

Click on the "MINING POOL" tab. Fill out the fields and click apply.

![mining pool](docs/images/mining_pool.png)

### Updating wallet address

Click on the "WALLET ADDRESS" tab. Fill out the fields and click apply.

![wallet address](docs/images/wallet_address.png)

### Updating operating mode

Click on the "OPERATING MODE" tab. Fill out the fields and click apply. Your miner may take up to 15 minutes to recalibrate with the new operating mode.

![operating mode](docs/images/operating_mode.png)

### Updating appending unique id to miner name

Click on the "UNIQUE ID" tab. Fill out the fields and click apply. This adds or removes the unique string at the end of the miner name.

![unique id](docs/images/unique_id.png)

### Updating password

Click on the "PASSWORD" tab. Fill out the fields and click apply.

![password](docs/images/password.png)

### Updating firmware

Use your preferred internet browser to go to https://github.com/epicblockchain/epic-miner/releases and download the latest release of the firmware. Extract the zip file and note its location. Click on the "FIRMWARE" tab. Click browse and select the location of the extracted zip folder. Select the file ending in .swu within that folder. The "Maintain config over update" will save your settings across the update. Fill out the rest of the fields and click apply. You miner will take up to 15 minutes to reboot and recalibrate.
![updating firmware](docs/images/updating_firmware.png)

### Rebooting your miner

Click on the "REBOOT" tab. Fill out the fields and click apply. Your miner may take a few minutes to reboot.
A softreboot will only restart the mining program.

![reboot](docs/images/reboot.png)

### Recalibrating your miner

Click on the "RECALIBRATE" tab. Fill out the fields and click apply. Your miner may take up to 15 minutes to reboot and recalibrate.

![recalibrate](docs/images/recalibrate.png)

### Control fans on

Click on the "FANS" tab. Fill out the fields and click apply.

![fans](docs/images/fans.png)

### Control LED on miner

Click on the "LED" tab. Fill out the fields and click apply.

![led](docs/images/led.png)

### Miner command tab

Click on the "CMD" tab. Fill out the fields and click apply.

![command](docs/images/cmd.png)

## Adding/Removing/Blacklisting Miners
Use the interface in the Table page to add, save, blacklist and load miners. These will be stored in a line seperated text file:
![add miner](docs/images/add_miner0.png)
![add miner success](docs/images/add_miner1.png)
#### Linux: 
* ~/.ePIC-Dashboard/ipaddr.txt for saving miners
* ~/.ePIC-Dashboard/blacklist.txt for blacklisting miners by their hostname and mdns broadcast: (e.g. "epicminer340035._epicminer._tcp.local")
#### Windows:
* %APPDATA%/ePIC-Dashboard/ipaddr.txt
* %APPDATA%/ePIC-Dashboard/blacklist.txt
#### Mac:
* ~/Library/Application Support/ePIC-Dashboard/ipaddr.txt
* ~/Library/Application Support/ePIC-Dashboard/blacklist.txt

## API
Api requests are documented as follows. Under each METHOD are the endpoint and expected values that are returned or should be provided.
### GET
**/summary**
Provides generic readable data for the miner.
Response type: application/json
Sample response:
```
{
  "Hostname": <string>,
  "Preset": <string>,
  "Software": <string>,
  "Mining": {
    "Coin": <string>,
    "Algorithm": <string>
  },
  "Stratum": {
    "Current Pool": <string>,
    "Current User": <string.string>,
    "Average Latency": <float>
  },
  "Session": {
    "Startup Timestamp": <uint>,
    "Startup String": <string>,
    "Uptime": <uint>,
    "Last Work Timestamp": <uint>,
    "WorkReceived": <uint>,
    "Active HBs": <uint>,
    "Average MHs": <float>,
    "LastAverageMHs": {
      "Hashrate": <float>,
      "Timestamp": <uint>
    },
    "Accepted": <uint>,
    "Rejected": <uint>,
    "Submitted": <uint>,
    "Last Accepted Share Timestamp": <uint>,
    "Difficulty": <float>
  },
  "HBs": [
    {
      "Index": <uint>,
      "Input Voltage": <float>,
      "Output Voltage": <float>,
      "Input Current": <float>,
      "Output Current": <float>,
      "Input Power": <float>,
      "Output Power": <float>,
      "Temperature": <uint>,
      "Core Clock": <float>
    } [,<more Hashboards>]
  ]
}
```
**/history**
Provides hashrate data polled every 15min for up to the past 48 hrs.
Response type: application/json
Sample response:
```
{
  "History": [
    {
      "Hashrate": <float>,
      "Timestamp": <uint>
    },
    {
      "Hashrate": <float>,
      "Timestamp": <uint>
    }
  ]
}
```
**/capabilities**
Provides miner model and all available coins and operating modes.
Response type: application/json
Sample response:
```
{
  "Model": <string>
  "Presets": [
    <string>,
    ...
  ],
  "Coins": [
    <string>,
    ...
  ]
}
```
### POST
All POST requests will respond the same way.
POST requests expect json data in the body, except for file uploads.
Response should look like the following if the provided password was accepted, (an error string may be provided in some cases case):
```
{
	"result": <bool>
	"error": <string or null>
}
```

**/pool**
Changes the mining pool of the miner.
Format of request body:
```
{
	"param": <string>,
	"password": <string>
}
```
**/login**
param.login contains the mining updated mining address. Seperate the worker name from the miner with a period as is common.
param.password typically contains "x". Note that this is not the password to your miner. 
Format of request body:
```
{
	"param": {
		"login": <string.string>,
		"password": <string>
	},
	"password": <string>
}
```
**/coin**
Combines the /pool and /login api calls into one.
```
{
	"param": {
        "coin": <string>,
        "pool_url": <string>,
		"login": <string.string>,
		"password": <string>
	},
	"password": <string>
}
```
**/miner**
Autostart or stop the mining program.
Format of request body:
```
{
	"param": <string>,
	"password": <string>
}
```
**/reboot, /softreboot**
Provide unsigned integer to specify a delay in seconds before the reboot. Provide 0 to reboot instantly. Soft reboot only restarts the mining program.
Format of request body:
```
{
	"param": <uint>,
	"password": <string>
}
```
**/mode**
Set the miner to run in normal or efficiency mode. Provide the exact string "normal" or "efficiency".
Format of request body:
```
{
	"param": "{normal|efficiency}",
	"password": <string>
}
```
**/password**
Set a new password for the miner. param contains the new password. password contains the old one.
Format of request body:
```
{
	"param": <string>,
	"password": <string>
}
```
**/hwconfig**
Recalibrate the miner.
param should be set to true.
Format of request body:
```
{
	"param": bool,
	"password": <string>
}
```
**/id**
Have each miner add a unique identifier to its worker name. This will change how it shows up on mining pools.
Format of request body:
```
{
	"param": bool,
	"password": <string>
}
```
**/identify**
Toggle the miner LED for easier identification.
Format of request body:
```
{
    "param": bool,
    "password": <string>
}
```
**/fanspeed**
Manually set the fan speed of the miner. Provide a string from 1-100. Note: if the speed sent is too low, it will automatically be set to the minimum of the current operating mode.
Format of request body:
```
{
    "param": <string>,
    "password": <string>
}
```

**/update**
Endpoint for receiving .swu file to update the firmware. Accepts multipart/form-data encoding in the body.
Note this is not receiving a json.
The form keys are "password", "checksum", "keepsettings", and "swupdate.swu".
keepsettings will maintain the current config over the update. swupdate.swu is the .swu to flash, and checksum is the sha256 hash of the .swu.
