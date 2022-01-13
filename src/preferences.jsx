import * as React from 'react';
import {Container, Button, Divider, Typography, FormControl, FormControlLabel, Switch} from '@material-ui/core';
import './preferences.css';

export class Preferences extends React.Component {
    constructor(props) {
        super(props);

        this.state = {theme: 'light', sessionpass: true, autoload: true};

        this.toggleTheme = this.toggleTheme.bind(this);
        this.toggleLoad = this.toggleLoad.bind(this);
        this.togglePass = this.togglePass.bind(this);
    }

    componentDidMount() {
        this.setState(this.props.settings);
    }

    toggleTheme(e) {
        this.setState({theme: e.target.checked ? 'dark' : 'light'});
    }

    toggleLoad(e) {
        this.setState({autoload: e.target.checked});
    }

    togglePass(e) {
        this.setState({sessionpass: e.target.checked});
    }

    render() {
        return (
            <Container maxWidth="sm" id="preferences">
                <Typography variant="h4" align="center" gutterBottom>
                    Dashboard Preferences
                </Typography>
                <Divider variant="middle" style={{margin: '8px'}} />
                <FormControl margin="dense">
                    <FormControlLabel
                        control={
                            <Switch color="primary" checked={this.state.theme === 'dark'} onChange={this.toggleTheme} />
                        }
                        label="Enable dark mode"
                    />
                    <Typography className="description">Set theme of the dashboard to dark</Typography>
                </FormControl>
                <FormControl margin="dense">
                    <FormControlLabel
                        control={<Switch color="primary" checked={this.state.sessionpass} onChange={this.togglePass} />}
                        label="Session password prompt"
                    />
                    <Typography className="description">
                        Always ask for session password when dashboard opens
                    </Typography>
                </FormControl>
                <FormControl margin="dense">
                    <FormControlLabel
                        control={<Switch color="primary" checked={this.state.autoload} onChange={this.toggleLoad} />}
                        label="Autoload saved miners"
                    />
                    <Typography className="description">
                        Automatically load saved miners when dashboard opens
                    </Typography>
                </FormControl>
                <Button
                    onClick={() => this.props.savePreferences(this.state)}
                    variant="contained"
                    color="primary"
                    id="save"
                >
                    Save
                </Button>
            </Container>
        );
    }
}
