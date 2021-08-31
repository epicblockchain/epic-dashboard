const { dialog } = require('@electron/remote');
const fs = require('fs');

import * as React from 'react';
import { Button, Divider, Typography } from '@material-ui/core'

import './support.css';

export class Support extends React.Component {
    
    constructor(props){
        super(props);

        this.writeLogs = this.writeLogs.bind(this);
    }
    
    writeLogs(){
        dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory']
        }).then((arg)=>{
            if (!arg.canceled){
                fs.writeFile(arg.filePaths[0] + '/epicminers.log', JSON.stringify(this.props.data), function (err) {
                    if (err) throw err;
                    console.log('Logs written.');
                });
            }
        }).catch(err=>{
            console.log(err);
        })
    
    }

    render(){
        return (
            <div className="supportContent">
                <Typography variant="h4" gutterBottom>Support</Typography>
                <p><strong>support@epicblockchain.io</strong></p>
                <Divider variant="middle" style={{margin: '8px'}}/>
                <Typography variant="h5" gutterBottom>Dashboard Specific</Typography>
                <p>For dashboard issues, use the button below to create a log file which you can choose to attach to your support email.</p>
                <Button variant="outlined" onClick={this.writeLogs}>Generate Logs</Button>
                <Divider variant="middle" style={{margin: '8px'}}/>
                <Typography variant="h5" gutterBottom>Miner Specific</Typography>
                <p>For miner issues, go to the table, select the miners with issues and use the "Save logs" button under the Home tab.
                <br />Attach the saved logs to you support email.</p>
                <Button variant="contained" color="primary" onClick={() => this.props.setPage('table')}>Take me there</Button>
            </div>
        );
    }
}