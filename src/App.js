import React from 'react'

import Sidebar from 'react-sidebar'
import DashboardPage from './components/DashboardPage'
import ChartPage from './components/ChartPage'
import TablePage from './components/TablePage'
import SettingsPage from './components/SettingsPage'
import LoadingPage from './components/LoadingPage'
import { Button, Classes, Dialog, FocusStyleManager, Menu, MenuDivider, MenuItem} from '@blueprintjs/core'
import { EpicToaster } from './components/Toasters'

import '@blueprintjs/core/lib/css/blueprint.css'
import './App.css'

import logo from './assets/img/EpicLogo-Vertical.png'

FocusStyleManager.onlyShowFocusOnTabs();

const electron = window.require('electron')


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: true,
      page: 'loading',
      isVpnDialogOpen: false
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    this.setPage = this.onSetPage.bind(this);
    this.handleStopLoading = this.handleStopLoading.bind(this)
    this.toastHandler = this.toastHandler.bind(this)

    this.handleVpnDialogDismiss = this.handleVpnDialogDismiss.bind(this);
    this.handleMoveToMinerList = this.handleMoveToMinerList.bind(this);
  }

  handleStopLoading(){
    if (this.state.page === 'loading'){
        this.setState({page: 'dashboard'})
    }
  }

  toastHandler(e, args){
    if (args.type === 'good'){
        EpicToaster.show({
            message: args.message,
            intent: 'success'
        })
    } else if (args.type === 'bad') {
        EpicToaster.show({
            message: args.message,
            timeout: 10000,
            intent: 'danger'
        })
    } else if (args.type === 'warning') {
        EpicToaster.show({
            message: args.message,
            timout: 10000,
            intent: 'warning'
        })
    }
  }

  componentDidMount(){
    electron.ipcRenderer.on('stop-loading', this.handleStopLoading)
    electron.ipcRenderer.on('toast', this.toastHandler)
    setTimeout(function(){
        if ( this.state.page === 'loading' ){
            this.setState({isVpnDialogOpen: true});
        }
    }.bind(this), 10000);
  }

  componentWillUnmount(){
    electron.ipcRenderer.removeListener('stop-loading', this.handleStopLoading)
    electron.ipcRenderer.removeListener('toast', this.toastHandler)
  }
 
  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  onSetPage(newPage) {
    this.setState({page: newPage})
  }

  handleMoveToMinerList(){
    this.setState({isVpnDialogOpen: false})
    this.setState({page: 'table'})
  }

  handleVpnDialogDismiss(){
    this.setState({isVpnDialogOpen: false});
  }
 
  render() {

    return (
      <div>
            <Sidebar className="sidebar"
              sidebar={
                  <Menu className="sidebar">
                      <Button className="minimizeSidebarButton" icon="caret-left" onClick={() => this.onSetSidebarOpen(false)} />
                      <img id="epicSidebarLogo" src={logo} alt="/"/>
                      <MenuDivider />
                      <MenuItem icon="dashboard" text="Overview" onClick={() => this.onSetPage('dashboard')} />
                      <MenuItem icon="chart" text="Hashrate Chart" onClick={() => this.onSetPage('chart')} />
                      <MenuItem icon="th" text="Miner List" onClick={() => this.onSetPage('table')} />
                      <MenuItem icon="cog" text="Miner Settings" onClick={() => this.onSetPage('settings')} />
                  </Menu>
              }
              open={this.state.sidebarOpen}
              onSetOpen={this.onSetSidebarOpen}
            styles={{ sidebar: { background: "#1B1D4D" } }}
            >
              <Button className="maximizeSidebarButton" icon="caret-right" onClick={() => this.onSetSidebarOpen(true)} />
              {this.state.page === 'loading' && <LoadingPage />}
              {this.state.page === 'dashboard' && <DashboardPage />}
              {this.state.page === 'chart' && <ChartPage />}
              {this.state.page === 'table' && <TablePage />}
              {this.state.page === 'settings' && <SettingsPage />}
            </Sidebar>
            
            <Dialog className="vpnDialog" isOpen={this.state.isVpnDialogOpen && this.state.page==='loading'}>
                <div className={Classes.DIALOG_BODY}>
                    <p>
                    If you are connecting over a VPN, this software will not detect your miners. You must manually add miners by IP in the Miner List tab.
                    </p>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button intent={'primary'} onClick={this.handleMoveToMinerList}>
                            Navigate to Miner List tab
                        </Button>
                        <Button onClick={this.handleVpnDialogDismiss}>
                            Dismiss
                        </Button>
                    </div>
                </div>
            </Dialog>
        
        </div>
    );
  }
}
 
export default App
