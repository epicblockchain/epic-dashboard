import React from 'react'
import { Tab, Tabs } from '@blueprintjs/core'
import { Column, Table } from '@blueprintjs/table'
import './SettingsPage.css'

class SettingsPage extends React.Component {
    render () {
        return (
            <div className="settingsContainer">
                <div>
                    <Table numRows={2}>
                        <Column name='Miner'/>
                        <Column name='Apply to'/>
                    </Table>
                </div>
                <Tabs id="SettingsTabs">
                    <Tab id="MiningPoolTab" title="Mining Pool" />
                    <Tab id="WalletAddressTab" title="Wallet Address" />
                    <Tab id="OperatingModeTab" title="Operating Mode" />
                    <Tab id="UniqueIDTab" title="Unique ID" />
                    <Tab id="NewPasswordTab" title="Password" />
                    <Tab id="SoftwareUpdateTab" title="Firmware" />
                </Tabs>
            </div>
        );
    }
}

export default SettingsPage;
