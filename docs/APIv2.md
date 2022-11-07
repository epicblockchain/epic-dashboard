## API v2 (ePIC Miner v4.0.0)

API v2 is the api compatible with epic-miner firmware on the SC200.
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
