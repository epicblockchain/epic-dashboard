import React, { useState, useEffect } from 'react'

import Sidebar from 'react-sidebar'
import DashboardPage from './components/DashboardPage'
import ChartPage from './components/ChartPage'
import TablePage from './components/TablePage'
import SettingsPage from './components/SettingsPage'
import { Button, Menu, MenuItem, MenuDivider } from '@blueprintjs/core'

import '@blueprintjs/core/lib/css/blueprint.css'
import './App.css'

import logo from './assets/img/EpicLogo-Vertical.png'

import { minersAdded, fetchMinerSummaries, selectAllMiners } from './features/miners/minersSlice' 
import { useDispatch, useSelector } from 'react-redux'

const electron = window.require('electron') //this disables viewing in browser but allows use of node api



const App = (props) => {

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [page, setPage] = useState('loading');

    const onSetSidebarOpen = (open) => {
        setSidebarOpen(open);
    }

    const dispatch = useDispatch()

    useEffect(function(){
        electron.ipcRenderer.on('update-miner-ips', (event, message) => {
            const newMiners = message;
            console.log('recieved miners: ' + JSON.stringify(newMiners))
            dispatch(
                minersAdded(newMiners)
            )
        })
    }, [dispatch]) //TODO make sure that this only can run once

    const minersLen = useSelector(selectAllMiners).length;

    useEffect(function(){
        dispatch(
            fetchMinerSummaries()
        )
        console.log('Dispatched fetchMinerSummaries()')
    }, [minersLen, dispatch])

    return  (
        <div>
            <Sidebar
                sidebar={
                    <Menu>
                        <Button className="minimizeSidebarButton" icon="caret-left" onClick={() => onSetSidebarOpen(false)}/>
                        <img id="epicSidebarLogo" src={logo} alt="/"/>
                        <MenuDivider />
                        <MenuItem icon="dashboard" text="Overview" onClick={() => setPage('dashboard')} />
                        <MenuItem icon="chart" text="Hashrate Chart" onClick={() => setPage('chart')} />
                        <MenuItem icon="th" text="Miners" onClick={() => setPage('table')} />
                        <MenuItem icon="cog" text="Settings" onClick={() => setPage('settings')} />
                    </Menu>
                }
                open={sidebarOpen}
                onSetOpen={() => onSetSidebarOpen}
                styles={{ sidebar: {background: "white"} }}
            >
            <Button className="maximizeSidebarButton" icon="caret-right" onClick={() => onSetSidebarOpen(true)} />
            </Sidebar>
            {page === 'dashboard' && <DashboardPage />}
            {page === 'chart'     && <ChartPage />}
            {page === 'table'     && <TablePage />}
            {page === 'settings'  && <SettingsPage />}
        </div>
    )
}

export default App
