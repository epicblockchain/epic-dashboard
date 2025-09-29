import * as React from 'react';
import {Button, Typography, Grid, TextField, Switch, Box, Input} from '@mui/material';

export class LicenseTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {license_key: '', password: this.props.sessionPass};

        this.updateLicenseKey = this.updateLicenseKey.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.clearFields = this.clearFields.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.sessionPass != this.props.sessionPass) {
            this.setState({password: this.props.sessionPass});
        }
    }

    updatePassword(e) {
        this.setState({password: e.target.value});
    }

    updateLicenseKey(e) {
        this.setState({license_key: e.target.value});
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const jsonData = JSON.parse(content);

                // Look for 'key' parameter in the JSON
                if (jsonData.key) {
                    this.setState({license_key: jsonData.key});
                } else {
                    alert('JSON file does not contain a "key" parameter');
                }
            } catch (error) {
                alert('Invalid JSON file. Please upload a valid JSON file with a "key" parameter.');
            }
        };
        reader.readAsText(file);

        // Clear the file input after processing
        event.target.value = '';
    }

    clearFields() {
        this.setState({license_key: ''});
    }

    render() {
        const disabled = !this.state.license_key || !this.state.password || !this.props.selected.length;

        return (
            <div className="tab-body">
                <Typography variant="h6" gutterBottom>
                    License
                </Typography>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Upload a JSON file containing your key.
                </Typography>

                <Box sx={{mb: 2, display: 'flex', gap: 1}}>
                    <input
                        type="file"
                        ref={(input) => {
                            this.fileInput = input;
                        }}
                        onChange={this.handleFileUpload}
                        accept=".json,application/json"
                        style={{display: 'none'}}
                    />
                    <Button variant="contained" onClick={() => this.fileInput.click()}>
                        Upload JSON
                    </Button>
                    <Button variant="contained" onClick={this.clearFields} color="secondary">
                        Clear Fields
                    </Button>
                </Box>

                <TextField
                    variant="outlined"
                    label="Key"
                    onChange={this.updateLicenseKey}
                    value={this.state.license_key}
                    margin="dense"
                    fullWidth
                    placeholder="Enter license key manually or upload JSON file above"
                />
                <div className="password-apply">
                    <TextField
                        value={this.state.password || ''}
                        variant="outlined"
                        label="Password"
                        type="password"
                        onChange={this.updatePassword}
                        margin="dense"
                        error={!this.state.password}
                    />
                    <Button
                        onClick={() => {
                            this.props.handleApi('/loadlicense', this.state, this.props.selected);
                        }}
                        variant="contained"
                        color="primary"
                        disabled={disabled}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        );
    }
}
