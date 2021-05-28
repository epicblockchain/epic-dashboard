import * as React from 'react';
import { Button, TextField, FormControl, Divider } from '@material-ui/core'; 

export class AddRemoveTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {ip: ''};

        this.updateIP = this.updateIP.bind(this);
    }

    updateIP(e) {
        this.setState({ip: e.target.value});
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <TextField id="ip" variant="outlined" label="Miner IP" onChange={this.updateIP} margin="dense"/>
                <Button onClick={() => this.props.addMiner(this.state.ip)} variant="contained" color="primary"
                    disabled={!this.state.ip}
                >
                    Add Miner via IP
                </Button>
                <Button onClick={() => this.props.saveMiners()} variant="contained" color="secondary">
                    Save Current Miners
                </Button>
                <Button onClick={() => this.props.loadMiners()} variant="contained" color="secondary">
                    Load Saved Miners
                </Button>
                <Divider variant="middle" style={{margin: '8px'}}/>
                <Button
                    onClick={() => {
                        this.props.delMiner(this.props.selected);
                        this.props.select([], this.props.models[this.props.list]);
                    }}
                    variant="contained" color="primary"
                    disabled={!this.props.selected.length}
                >
                    Remove Selected
                </Button>
                <Button
                    onClick={() => {
                        this.props.blacklist(this.props.selected);
                        this.props.select([], this.props.models[this.props.list]);
                    }}
                    variant="contained" color="secondary"
                    disabled={!this.props.selected.length}
                >
                    Blacklist Selected
                </Button>
            </div>
        );
    }
}