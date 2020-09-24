import React, { useState } from 'react'

import Sidebar from 'react-sidebar'
import DashboardPage from './components/DashboardPage'
import ChartPage from './components/ChartPage'
import TablePage from './components/TablePage'
import SettingsPage from './components/SettingsPage'
import { Button, Menu, MenuItem, MenuDivider } from '@blueprintjs/core'

import '@blueprintjs/core/lib/css/blueprint.css'
import './App.css'

import logo from './assets/img/EpicLogo-Vertical.png'

const App = (props) => {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [page, setPage] = useState('loading');

    const onSetSidebarOpen = (open) => {
        setSidebarOpen(open);
    }

    return  (
        <div>
            <Sidebar
                sidebar={
                    <Menu>
                        <Button className="minimizeSidebarButton" icon="caret-left" onClick={() => onSetSidebarOpen(false)}/>
                        <img id="epicSidebarLogo" src={logo} alt="/"/>
                        <MenuDivider />
                        <MenuItem icon="dashboard" text="Dashboard" onClick={() => setPage('dashboard')} />
                        <MenuItem icon="chart" text="Hashrate Chart" onClick={() => setPage('chart')} />
                        <MenuItem icon="th" text="Miners" onClick={() => setPage('table')} />
                        <MenuItem icon="cog" text="Settings" onClick={() => setPage('settings')} />
                    </Menu>
                }
                open={sidebarOpen}
                onSetOpen={() => onSetSidebarOpen}
                styles={{ sidebar: {background: "white"} }}
            >
            </Sidebar>
            <Button className="maximizeSidebarButton" icon="caret-right" onClick={() => onSetSidebarOpen(true)} />
            {page === 'dashboard' && <DashboardPage />}
            {page === 'chart'     && <ChartPage />}
            {page === 'table'     && <TablePage />}
            {page === 'settings'  && <SettingsPage />}
        </div>
    )
}

export default App
