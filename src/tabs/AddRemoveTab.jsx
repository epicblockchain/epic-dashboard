import * as React from 'react';
import { Button, TextField } from '@material-ui/core'; 

export class AddRemoveTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {ip: ''};

        this.updateIP = this.updateIP.bind(this);
    }

    updateIP(e) {
        console.log('type');
        this.setState({ip: e.target.value});
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <TextField id="ip" variant="outlined" label="Miner IP" onChange={this.updateIP}/>
                <Button onClick={() => {
                        var ip = document.getElementById('ip').value;
                        this.props.func(ip);
                    }} variant="contained" color="primary"
                    disabled={!this.state.ip}
                >
                    Add Miner via IP
                </Button>
                <Button
                    onClick={() => this.props.func2(this.props.selected)}
                    variant="contained" color="primary"
                    disabled={!this.props.selected.length}
                >
                    Remove Selected
                </Button>
            </div>
        );
    }
}