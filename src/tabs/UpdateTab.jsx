const { dialog } = require('@electron/remote');
import * as React from 'react';
import { Button, TextField, InputAdornment, FormControl, FormControlLabel, Switch } from '@material-ui/core';

export class UpdateTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {filepath: '', keep: true, password: this.props.sessionPass};

        this.updateFilepath = this.updateFilepath.bind(this);
        this.updateKeep = this.updateKeep.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }
    
    updateFilepath() {
        dialog.showOpenDialog({
            filters: [{name: '.swu files', extensions: ['swu']}],
            properties: ['openFile']
        }).then(args => {
            if (!args.canceled) {
                this.setState({filepath: args.filePaths[0]});
            }
        }).catch(err => {
            console.log('filepath error', err);
        })
    }

    updateKeep(e) {
        this.setState({keep: e.target.checked});
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    render() {
        return(
            <div style={{padding: '12px 0'}}>
                <TextField variant="outlined" label="Firmware file" value={this.state.filepath} disabled margin="dense"
                    InputProps={{endAdornment:
                        <InputAdornment position="end">
                            <Button onClick={this.updateFilepath} variant="contained" color="primary" size="small">
                                Browse
                            </Button>
                        </InputAdornment>}}
                />
                <FormControl margin="dense">
                    <FormControlLabel
                        control={<Switch color="primary" checked={this.state.keep} onChange={this.updateKeep}/>}
                        label="Maintain config over update"
                    />
                </FormControl>
                <br/>
                <TextField value={this.state.password || ''} variant="outlined" label="Password" type="password" onChange={this.updatePassword} margin="dense"/>
                <Button onClick={() => {
                        this.props.handleApi('/update', this.state, this.props.selected);
                    }} variant="contained" color="primary"
                    disabled={!this.state.filepath || !this.state.password || !this.props.selected.length}
                >
                    Apply
                </Button>
            </div>
        );
    }
}