import * as React from 'react';
import {Button, FormControlLabel, Paper, Switch, TextField, Typography} from '@mui/material';
import {
    copyBoardStates,
    getHashboardStatus,
    getModelBoardCount,
    getSelectedBoardCount,
    resizeBoardStates,
} from '../boardControl.mjs';
import {getMinerActionLabel, TabFooter, TabHeader} from './TabLayout.jsx';

const DEFAULT_BOARD_COUNT = 3;

function selectionSignature(data, selected) {
    return (selected || [])
        .map((index) => {
            const miner = data?.[index];
            const statuses = getHashboardStatus(miner?.sum)
                .map(({Index, Enabled, Detected}) => `${Index}:${Enabled}:${Detected}`)
                .join(',');
            return `${index}:${miner?.ip || ''}:${statuses}`;
        })
        .join('|');
}

export class BoardControlTab extends React.Component {
    constructor(props) {
        super(props);
        const modelBoardCount = getModelBoardCount(props.data, props.model);
        const reportedBoardCount = getSelectedBoardCount(props.data, props.selected);
        const boardCount = modelBoardCount || reportedBoardCount || DEFAULT_BOARD_COUNT;
        this.state = {
            board_count: boardCount,
            board_states: resizeBoardStates([], boardCount),
            password: props.sessionPass,
        };
    }

    componentDidUpdate(prevProps) {
        const updates = {};

        if (prevProps.sessionPass != this.props.sessionPass) updates.password = this.props.sessionPass;

        const previousSelection = selectionSignature(prevProps.data, prevProps.selected);
        const currentSelection = selectionSignature(this.props.data, this.props.selected);
        const modelChanged = prevProps.model !== this.props.model;
        const modelBoardCount = getModelBoardCount(this.props.data, this.props.model);
        const boardCount = modelBoardCount || getSelectedBoardCount(this.props.data, this.props.selected);
        if (
            boardCount &&
            boardCount !== this.state.board_count &&
            (currentSelection !== previousSelection || modelChanged || prevProps.data !== this.props.data)
        ) {
            updates.board_count = boardCount;
            updates.board_states = resizeBoardStates(this.state.board_states, boardCount);
        }

        if (Object.keys(updates).length) this.setState(updates);
    }

    updatePassword = (event) => {
        this.setState({password: event.target.value});
    };

    toggleBoard = (index) => {
        const boardStates = this.state.board_states.slice();
        boardStates[index] = !boardStates[index];
        this.setState({board_states: boardStates});
    };

    setAllBoards = (enabled) => {
        this.setState({board_states: Array(this.state.board_count).fill(enabled)});
    };

    copySettings = () => {
        if (this.props.selected.length !== 1) return;
        const summary = this.props.data?.[this.props.selected[0]]?.sum;
        const boardStates = copyBoardStates(summary, this.state.board_count);
        this.setState({board_count: boardStates.length, board_states: boardStates});
    };

    render() {
        const {data, selected} = this.props;
        const selectedSummary = selected.length === 1 ? data?.[selected[0]]?.sum : null;
        const selectedStatus = getHashboardStatus(selectedSummary);
        const enabledCount = this.state.board_states.filter(Boolean).length;
        const disabled = !this.state.password || !selected.length || !this.state.board_states.length;

        let selectionText = `No systems selected. Configure the ${this.props.model} board pattern, then select targets.`;
        if (selected.length === 1) {
            selectionText = `${data?.[selected[0]]?.ip || '1 system'} selected · ${this.state.board_count} board${
                this.state.board_count === 1 ? '' : 's'
            } maximum for this model`;
        } else if (selected.length > 1) {
            selectionText = `${selected.length} systems selected. Board positions missing from a system will be skipped.`;
        }

        return (
            <div className="tab-body settings-tab board-control-tab">
                <TabHeader title="Board Control" description={selectionText}>
                    {selected.length === 1 && (
                        <Button
                            onClick={this.copySettings}
                            variant="contained"
                            color="primary"
                            disabled={!selectedStatus.length}
                        >
                            Copy selected system settings
                        </Button>
                    )}
                </TabHeader>

                <div className="board-control-actions">
                    <div>
                        <Typography variant="subtitle2">Target board state</Typography>
                        <Typography variant="caption" color="textSecondary">
                            Model maximum: {this.state.board_count} board{this.state.board_count === 1 ? '' : 's'}.
                            Selected boards will be enabled; cleared boards will be disabled.
                        </Typography>
                    </div>
                    <div>
                        <Button onClick={() => this.setAllBoards(true)} variant="outlined">
                            Select all
                        </Button>
                        <Button onClick={() => this.setAllBoards(false)} variant="outlined">
                            Clear all
                        </Button>
                    </div>
                </div>

                <div className="board-state-grid">
                    {this.state.board_states.map((enabled, index) => {
                        const status = selectedStatus.find((item) => item.Index === index);
                        const detected = status ? (status.Detected ? 'Detected' : 'Not detected') : null;
                        return (
                            <Paper className="board-state-item" variant="outlined" key={index}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={enabled}
                                            onChange={() => this.toggleBoard(index)}
                                            slotProps={{input: {'aria-label': `Enable board ${index + 1}`}}}
                                        />
                                    }
                                    label={
                                        <span className="board-state-label">
                                            <Typography variant="body2">Board {index + 1}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {enabled ? 'Enabled' : 'Disabled'}
                                                {detected ? ` · ${detected}` : ''}
                                            </Typography>
                                        </span>
                                    }
                                />
                            </Paper>
                        );
                    })}
                </div>

                <TabFooter className="board-control-apply">
                    <TextField
                        value={this.state.password || ''}
                        variant="outlined"
                        label="Password"
                        type="password"
                        onChange={this.updatePassword}
                        margin="dense"
                        error={!this.state.password}
                    />
                    <Typography variant="body2" color="textSecondary">
                        {enabledCount} of {this.state.board_count} boards enabled
                    </Typography>
                    <Button
                        onClick={() => this.props.handleApi('/boardenable', this.state, selected)}
                        variant="contained"
                        color="primary"
                        disabled={disabled}
                    >
                        {getMinerActionLabel('Apply', selected)}
                    </Button>
                </TabFooter>
            </div>
        );
    }
}
