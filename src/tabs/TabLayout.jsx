import * as React from 'react';
import {Typography} from '@mui/material';

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
    return React.createElement('div', {className: `settings-tab-footer ${className}`.trim()}, children);
}

export function getMinerActionLabel(action, selected) {
    const count = selected?.length || 0;
    return count ? `${action} to ${count} miner${count === 1 ? '' : 's'}` : action;
}
