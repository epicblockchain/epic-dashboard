import * as React from 'react';
import {FormControlLabel, Paper, Switch, Typography} from '@mui/material';

export function TabHeader({title, description, children}) {
    return React.createElement(
        'div',
        {className: 'settings-tab-header'},
        React.createElement(
            'div',
            null,
            React.createElement(Typography, {variant: 'h6', gutterBottom: true}, title),
            description && React.createElement(Typography, {variant: 'subtitle2', color: 'textSecondary'}, description),
        ),
        children && React.createElement('div', {className: 'settings-tab-header-actions'}, children),
    );
}

export function TabFooter({children, className = ''}) {
    return React.createElement(
        Paper,
        {
            className: `settings-tab-footer ${className}`.trim(),
            component: 'div',
            elevation: 0,
            square: true,
            sx: {backgroundColor: 'background.default'},
        },
        children,
    );
}

export function SettingToggle({checked, onChange, label, description, disabled = false}) {
    return React.createElement(
        Paper,
        {className: 'setting-toggle', variant: 'outlined', elevation: 0},
        React.createElement(FormControlLabel, {
            control: React.createElement(Switch, {checked, onChange, disabled, size: 'small'}),
            label: React.createElement(
                'span',
                {className: 'setting-toggle-copy'},
                React.createElement(Typography, {variant: 'body2'}, label),
                description &&
                    React.createElement(Typography, {variant: 'caption', color: 'textSecondary'}, description),
            ),
        }),
    );
}

export function getMinerActionLabel(action, selected) {
    const count = selected?.length || 0;
    return count ? `${action} to ${count} miner${count === 1 ? '' : 's'}` : action;
}
