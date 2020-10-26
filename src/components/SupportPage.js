import React from 'react'

import { Button } from '@blueprintjs/core'

import './SupportPage.css'
import '@blueprintjs/core/lib/css/blueprint.css'

const electron = window.require('electron')

class SupportPage extends React.Component {

    constructor(props){
        super(props)

        this.handleDump = this.handleDump.bind(this);
    }

    handleDump(){
        electron.ipcRenderer.send('data-dump');
    }

    render() {
        return (
            <div className="supportPageContainer bp3-running-text">
                <h3> Support </h3>
                <p><strong>support@epicblockchain.io</strong></p>
                <p>Press the button below to create a log file which you can choose to attach to your support email.</p>
                <Button onClick={this.handleDump}>Select Log Destination</Button>
            </div>
        );
    }

}

export default SupportPage;
