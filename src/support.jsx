const { dialog } = require('electron').remote;

import * as React from 'react';
import Button from '@material-ui/core/Button'

function writeLogs(){
    dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory']
    }).then((arg)=>{
        console.log(arg);
        // if (!arg.canceled){
        //     fs.writeFile(arg.filePaths[0] + '/epicminers.log', JSON.stringify(privateMiners), function (err) {
        //         if (err) throw err;
        //         console.log('done');
        //     });
        // }
    }).catch(err=>{
        console.log(err);
    })

}


export class Support extends React.Component {

    render(){
        return (
            <div>
                <h3>Support</h3>
                <p><strong>support@epicblockchain.io</strong></p>
                <p>Press the button below to create a log file which you can choose to attach to your support email.</p>
                <Button varaint="contained" onClick={writeLogs}>Generate Logs</Button>
            </div>
        );
    }
}