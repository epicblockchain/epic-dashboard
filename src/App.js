import React from 'react'

import Sidebar from 'react-sidebar'
import DashboardPage from './components/DashboardPage'
import ChartPage from './components/ChartPage'
import TablePage from './components/TablePage'
import SettingsPage from './components/SettingsPage'
import { Button, Menu, MenuItem, MenuDivider } from '@blueprintjs/core'

import '@blueprintjs/core/lib/css/blueprint.css'
import './App.css'

import logo from './assets/img/EpicLogo-Vertical.png'

// const electron = window.require('electron') //this disables viewing in browser but allows use of node api

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: true,
      page: 'loading'
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    this.setPage = this.onSetPage.bind(this);
  }
 
  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  onSetPage(newPage) {
    this.setState({page: newPage})
  }
 
  render() {
    return (
      <div>
          <Sidebar
            sidebar={
                <Menu>
                    <Button className="minimizeSidebarButton" icon="caret-left" onClick={() => this.onSetSidebarOpen(false)}/>
                    <img id="epicSidebarLogo" src={logo} alt="/"/>
                    <MenuDivider />
                    <MenuItem icon="dashboard" text="Overview" onClick={() => this.onSetPage('dashboard')} />
                    <MenuItem icon="chart" text="Hashrate Chart" onClick={() => this.onSetPage('chart')} />
                    <MenuItem icon="th" text="Miners" onClick={() => this.onSetPage('table')} />
                    <MenuItem icon="cog" text="Settings" onClick={() => this.onSetPage('settings')} />
                </Menu>
            }
            open={this.state.sidebarOpen}
            onSetOpen={this.onSetSidebarOpen}
            styles={{ sidebar: { background: "white" } }}
          >
            <Button className="maximizeSidebarButton" icon="caret-right" onClick={() => this.onSetSidebarOpen(true)} />
          </Sidebar>
          {this.state.page === 'dashboard' && <DashboardPage />}
          {this.state.page === 'chart' && <ChartPage />}
          {this.state.page === 'table' && <TablePage />}
          {this.state.page === 'settings' && <SettingsPage />}
        </div>
    );
  }
}
 
export default App
