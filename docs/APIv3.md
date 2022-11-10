## API v3 (PowerPlay)

API v3 is the api compatible with PowerPlay.
Api requests are documented as follows. Under each METHOD are the endpoint and expected values that are returned or should be provided.

### GET

**/summary**
Provides generic readable data for the miner.
Response type: application/json
Example Curl Command:

```
curl http://<ip>:<port>/summary
```

Sample response:

```
{
  "Status": {
    "Operating State": <string>,
    "Last Command": <string>,
    "Last Command Result": <string>
  },
  "Hostname": <string>,
  "PresetInfo": {
    "Preset": <string>,
    "Target Power": <uint>
  },
  "Software": <string>,
  "Mining": {
    "Coin": <string>,
    "Algorithm": <string>
  },
  "Stratum": {
    "Current Pool": <string>,
    "Current User": <string.string>,
    "IsPoolConnected": true,
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
      "Core Clock": [<float>]
    },
    [<more Hashboards>]
  ],
  "Fans": {
    "Fans Speed": <uint>
  },
  "Misc": {
    "Locate Miner State": <bool>,
    "Append Unique Id To Worker": <bool>
  },
  "StratumConfigs": [
    {
      "pool": <string>,
      "login": <string.string>,
      "password": <string>
    },
    [<more configs>]
  ]
}
```

**/history**

Provides hashrate data polled every 15min for up to the past 48 hrs.
Response type: application/json
Example Curl Command:

```
curl http://<ip>:<port>/history
```

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

Provides miner model and all available coins and performance presets.
Response type: application/json
Example Curl Command:

```
curl http://<ip>:<port>/capabilities
```

Sample response:

```
{
  "Model": <string>
  "Presets": [
    <string>,
    ...
  ],
  "PresetsPowerLevels": {
    <string>: [
      <uint>,
      ...
    ],
    ...
  },
  "Coins": [
    <string>,
    ...
  ]
}
```

**/debug**

Returns the core disable masks of the miner.\
Response type: application/json\
Example Curl Command:

```
curl http://<ip>:<port>/debug
```

Sample response:

```
{
  "DisableMasks": [
    <uint>,
    <uint>,
    <uint>,
    <uint>
  ]
}
```

**/log**

Returns the log of the miner.\
Response type: application/json\
Example Curl Command:

```
curl http://<ip>:<port>/log
```

Sample response:

```
{
  <string>
}

```

**/hashrate**

Returns the hashrate per chip for each hashboard and hashrate difference compared to theoretical hashrate.\
Response type: application/json\
Example Curl Command:

```
curl http://<ip>:<port>/hashrate
```

Sample response:

```
[
  {
    "Index": usize,
    "Data": [
      [
        <float>,
        <float>,
        <float>
      ]
    "Total": [
        <float>
        <float>
        <float>
      ]
    ]
  }
]
```

**/temps**

Returns the temperature sensor data collected by the miner.\
Response type: application/json\
Example Curl Command:

```
curl http://<ip>:<port>/temps
```

Sample Response:

```
[
  {
    "Index": usize,
    "Data": [
      <float>,
      <float>
    ]
    "Total": <float>
  }
]
```

**/voltages**

Returns the voltage data collected by the miner.\
Response type: application/json\
Example Curl Command:

```
curl http://<ip>:<port>/voltages
```

Sample Response:

```
[
  {
    "Index": usize,
    "Data": [
      <float>,
    ]
    "Total": <float>
  }
]
```

**/network**

Returns the network type.\
Response type: application/json\
Example Curl Command:

```
curl http://<ip>:<port>/network
```

Sample Response:

```
  <NetworkInfo>
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

**/coin**

Set the mining config of the miner. Supports up to 3 stratum_configs.
Example Curl Command:

```
curl --header "Content-Type: application/json"  --request POST "http://<ip>:<port>/coin" --data '{"param":{"coin": "", "stratum_configs": [{"pool":"", "login":"", "password":""}, {"pool":"", "login":"", "password":""}, {"pool":"", "login":"", "password":""}], "unique_id": },"password":""}'
```

Format of request body:

```
{
  "param": {
    "coin": <string>,
    "stratum_configs": [
      {
        "pool": <string>,
        "login": <string.string>,
        "password": <string>
      },
      ...
    ]
    "unique_id": <bool>
  },
  "password": <string>
}
```

**/miner**

Autostart or stop the mining program.
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/miner" --data '{"param":"","password":""}'
```

Format of request body:

```
{
  "param": <string>,
  "password": <string>
}
```

**/softreboot**

Provide unsigned integer to specify a delay in seconds before the reboot. Provide 0 to reboot instantly. Soft reboot only restarts the mining program.
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/softreboot" --data '{"param":,"password":""}'
```

Format of request body:

```
{
  "param": <uint>,
  "password": <string>
}
```

**/reboot**

Provide unsigned integer in param to specify a delay in seconds before the reboot. Provide 0 to reboot instantly.\
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/reboot" --data '{"param":,"password":""}'
```

Format of request body:

```
{
	"param": <uint>,
	"password": <string>
}
```

**/mode**

Set the miner to run a specific performance preset. Must use a preset from the /capabilities endpoint.
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/mode" --data '{"param":"","password":""}'
```

Format of request body:

```
{
  "param": {
    "preset": <string>,
    "power_target": <uint>
  },
  "password": <string>
}
```

**/password**

Set a new password for the miner. param contains the new password. password contains the old one.
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/password" --data '{"param":"","password":""}'
```

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
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/hwconfig" --data '{"param":"","password":""}'
```

Format of request body:

```
{
  "param": <bool>,
  "password": <string>
}
```

**/identify**

Toggle the miner LED for easier identification.
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/identify" --data '{"param":"","password":""}'
```

Format of request body:

```
{
  "param": <bool>,
  "password": <string>
}
```

**/fanspeed**

Manually set the fan speed of the miner. Provide a string from 1-100. Note: if the speed sent is too low, it will automatically be set to the minimum of the current operating mode.
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/fanspeed" --data '{"param":"","password":""}'
```

Format of request body:

```
{
  "param": <string>,
  "password": <string>
}
```

**/power**

Manually change the target power of the miner.
Format of request body:

```
{
  "param": <uint>,
  "password": <string>
}
```

**/tune**

Change the clock and voltage of the miner. Note: if the clock and voltage is too high, it will automatically be set to a maximum of 1000MHz and 15v respectively.
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/tune" --data '{"param":{"clks": "", "voltage": ""},"password":""}'
```

Format of request body:

```
{
  "param": {
    "clks": <string>
    "voltage": <string>
  },
  "password": <string>
}
```

**/tune/voltage**

Change only the voltage of the miner.
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/tune/voltage" --data '{"param":"","password":""}'
```

Format of request body:

```
{
  "param": <string>,
  "password": <string>
}
```

**/tune/clock/all**

Change only the clocks of the chips in the miner.
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/tune/clock/all" --data '{"param":"","password":""}'
```

Format of request body:

```
{
  "param": <string>,
  "password": <string>
}
```

**/shutdowntemp**

Change the shutdown temperature threshold of the miner. The default is set to 85c.
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/shutdowntemp" --data '{"param":"","password":""}'
```

Format of request body:

```
{
  "param": <usize>,
  "password": <string>
}
```

**/clearhashrate**

Clears the hashrate data collected by the miner.
Example Curl Command:

```
curl --header "Content-Type: application/json" --request POST "http://<ip>:<port>/clearhashrate" --data '{"param":"","password":""}'
```

Format of request body:

```
{
  "param": None
  "password": <string>
}
```

**/network**

Change the network of the miner.
Example Curl Command:

```
curl --request POST http://<ip>:<port>/network --data '{"param": "dhcp","password":<password>}'
curl --request POST http://<ip>:<port>/network --data '{"param":{ "static": { "address": "10.10.0.100", "netmask": "255.255.255.0", "gateway": "10.10.0.1", "dns": "10.10.0.1", "dns2": null } },"password":<password>}
```

Format of request body:

```
{
  "param": <NetworkInfo>
  "password": <string>
}
```

### System Update

**/systemupdate**

Updates the firmware of the miner.
Endpoint for receiving .zip file to update the firmware. Accepts multipart/form-data encoding in the body.
Note: this is not receiving a json.
The form keys are "password", "checksum", "keepsettings" and "update.zip".
The form values are described by their keys.
