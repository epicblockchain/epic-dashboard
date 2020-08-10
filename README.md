# How to Get Started
Please read COPYING and EULA before proceeding
## Getting started from a binary
Download the appropriate zip file for the OS you would like to run the program on. Be sure to check the checksums match 
## Getting started from source
Clone this repo
```
git clone <this repo>
npm install
npm start
```
A window should open with the app running
## API
Api requests are documented as follows. Under each METHOD are the endpoint and expected values that are returned or should be provided.
### GET
**/summary**
Provides generic readable data for the miner.
Response type: application/json
Sample response:
```
{
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
**/reboot**
Provide unsigned integer in param to specify a delay in seconds before the reboot. Provide 0 to reboot instantly.
Format of request body:
```
{
	"param": <uint>,
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
Reinitialize the hardware config.
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
**/update**
Endpoint for receiving .swu file to update the firmware. Accepts multipart/form-data encoding in the body.
Note this is not receiving a json.
The form keys are "password", "checksum", and "swupdate.swu".
The form values are described by their keys.

## Specific addresses

It is possible to add ips with a file if mdns is not working for some reason.
Create a file in the same directory as the executable named ipaddr.txt.
Put each ip and port on its own line. An example is provided below.
```
1.2.3.4:4028
10.10.10.10:4028
```
