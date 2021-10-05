## Small Update
This release has a few new features and bug fixes.
### New Features
- New miner log dump feature for customer support emails (ePIC Miner Firmware 2.0.29+ required)
- Errored miners will stay for 1min before moving to undefined, and then remain for 5min before being removed
- Improved Support page
- EULA prompt on first opening
### Bug Fixes
- Selecting rows with sorted columns highlighting the wrong row
- Correct sorting for hashrate columns
- Showing incorrect hashrates if not enough data (now shows N/A)
- Table state (shown columns, column sizes, etc.) will not reset when new miner types are detected
- Vertical scrollbar on table not showing for lower resolutions