const { dialog } = require('@electron/remote');
const fs = require('fs');

import * as React from 'react';
import Button from '@material-ui/core/Button'

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
                <h3>Support</h3>
                <p><strong>support@epicblockchain.io</strong></p>
                <p>Press the button below to create a log file which you can choose to attach to your support email.</p>
                <Button variant="outlined" onClick={this.writeLogs}>Generate Logs</Button>
            </div>
        );
    }
}