# How to Get Started
Please read COPYING and EULA before proceeding
## Getting started from a binary
Download the appropriate zip file for the OS you would like to run the program on. Be sure to check the checksums match 
## Getting started from source
Clone this repo
```
git clone <this repo>
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
```json
{
  "Software": "epic-miner v0.7.2",
  "Mining": {
    "Coin": "Sia",
    "Algorithm": "Blake2b"
  },
  "Stratum": {
    "Current Pool": "sc.luxor.tech:700",
    "Current User": "dee90ad0e68bf8f59ebef3b9a194d95e09221136915d7fbfd4312a2abf7c83dc070ecc5e7f9e.ePIC-SC200-01",
    "Average Latency": 0.0
  },
  "Session": {
    "Startup Timestamp": 1594330657,
    "Startup String": "Thu, 09 Jul 2020 21:37:37 +0000",
    "Uptime": 81897,
    "Last Work Timestamp": 1594412531,
    "WorkReceived": 2810,
    "Active HBs": 3,
    "Average MHs": 2764956.7795882667,
    "LastAverageMHs": {
      "Hashrate": 2135252.535578169,
      "Timestamp": 1594411200
    },
    "Accepted": 20808,
    "Rejected": 39,
    "Submitted": 20847,
    "Last Accepted Share Timestamp": 1594412553,
    "Difficulty": 2170.0
  },
  "HBs": [
    {
      "Index": 0,
      "Input Voltage": 12.078,
      "Output Voltage": 0.69,
      "Input Current": 35.25,
      "Output Current": 490.0,
      "Input Power": 428.0,
      "Output Power": 338.0,
      "Temperature": 85,
      "Core Clock": 480.0
    },
    {
      "Index": 1,
      "Input Voltage": 12.046,
      "Output Voltage": 0.69,
      "Input Current": 35.875,
      "Output Current": 496.0,
      "Input Power": 432.0,
      "Output Power": 342.0,
      "Temperature": 95,
      "Core Clock": 480.0
    },
    {
      "Index": 2,
      "Input Voltage": 12.0,
      "Output Voltage": 0.69,
      "Input Current": 36.5,
      "Output Current": 499.0,
      "Input Power": 432.0,
      "Output Power": 344.0,
      "Temperature": 92,
      "Core Clock": 480.0
    }
  ]
}
```
**/history**
Provides generic readable data for the miner.
Response type: application/json
Sample response:
```json
{
  "History": [
    {
      "Hashrate": 2033714.7365148445,
      "Timestamp": 1594331100
    },
    {
      "Hashrate": 2309909.766762951,
      "Timestamp": 1594332000
    }
  ]
}
```
### POST
All POST requests will respond the same way.
POST requests expect json data in the body, except for file uploads.
Response should look like the following if the provided password was accepted:
```json
{
	"success": true
}
```
Success will be false if the password was not accepted
**/pool**
Changes the mining pool of the miner.
Format of request body:
```json
{
	"param": "<string>",
	"password": "<string>"
}
```
**/reboot**
Provide unsigned integer in param to specify a delay in seconds before the reboot. Provide 0 to reboot instantly.
Format of request body:
```json
{
	"param": <uint>,
	"password": "<string>"
}
```
**/login**
param.login contains the mining updated mining address. Seperate the worker name from the miner with a period as is common.
param.password typically contains "x". Note that this is not the password to your miner. 
Format of request body:
```json
{
	"param": {
		"login": "<string.string>",
		"password": "<string>"
	},
	"password": "<string>"
}
```
**/mode**
Set the miner to run in normal or efficiency mode. Provide the exact string "normal" or "efficiency".
Format of request body:
```json
{
	"param": "{normal|efficiency}",
	"password": "<string>"
}
```
**/password**
Set a new password for the miner. param contains the new password. password contains the old one.
Format of request body:
```json
{
	"param": "<string>",
	"password": "<string>"
}
```
**/hwconfig**
Reinitialize the hardware config.
param should be set to true.
Format of request body:
```json
{
	"param": true,
	"password": "<string>"
}
```
**/id**
Have each miner add a unique identifier to its worker name. This will change how it shows up on mining pools.
Format of request body:
```json
{
	"param": true,
	"password": "<string>"
}
```
**/update**
TODO

