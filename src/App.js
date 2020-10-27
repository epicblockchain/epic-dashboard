import React from 'react'

import Sidebar from 'react-sidebar'
import DashboardPage from './components/DashboardPage'
import ChartPage from './components/ChartPage'
import TablePage from './components/TablePage'
import SettingsPage from './components/SettingsPage'
import LoadingPage from './components/LoadingPage'
import SupportPage from './components/SupportPage'
import { Button, Classes, Dialog, FocusStyleManager, Menu, MenuDivider, MenuItem, Popover } from '@blueprintjs/core'
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
      isVpnDialogOpen: false,
      isPopoverOpen: false,
      isDarkMode: false
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    this.setPage = this.onSetPage.bind(this);
    this.handleStopLoading = this.handleStopLoading.bind(this)
    this.toastHandler = this.toastHandler.bind(this)

    this.handleVpnDialogDismiss = this.handleVpnDialogDismiss.bind(this);
    this.handleMoveToMinerList = this.handleMoveToMinerList.bind(this);
    this.handleNewReleases = this.handleNewReleases.bind(this);
    this.handleDismissNewReleases = this.handleDismissNewReleases.bind(this);
    this.handleDownloadPageClick = this.handleDownloadPageClick.bind(this);
    this.toggleDarkMode = this.toggleDarkMode.bind(this);

  }

  handleDismissNewReleases(){
    this.setState({isPopoverOpen: false});
  }

  handleDownloadPageClick(){
    this.setState({isPopoverOpen: false});
    electron.ipcRenderer.send('open-link', 'https://github.com/epicblockchain/epic-miner/releases/')
  }

  handleNewReleases(event, args){
    this.setState({isPopoverOpen: true});
    this.setState({latestRelease: args});
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
    electron.ipcRenderer.on('new-releases', this.handleNewReleases)
    setTimeout(function(){
        if ( this.state.page === 'loading' ){
            this.setState({isVpnDialogOpen: true});
        }
    }.bind(this), 10000);
  }

  componentWillUnmount(){
    electron.ipcRenderer.removeListener('stop-loading', this.handleStopLoading)
    electron.ipcRenderer.removeListener('toast', this.toastHandler)
    electron.ipcRenderer.removeListener('new-releases', this.handleNewReleases)
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

  toggleDarkMode(){
    this.setState({isDarkMode: !this.state.isDarkMode});
    if (this.state.page === 'chart') {
        this.refs.chartPage.handleRefreshChartData();
    }
  }
 
  render() {

    return (
      <div className={this.state.isDarkMode ? "bp3-dark appContainerDark" : ""}>
            <Popover 
                isOpen={this.state.isPopoverOpen}
                className="popover"
                minimal={true}
                modifiers={{ preventOverflow: {enabled: false}, hide: { enabled: false} }}
                content={
                    <div className="popoverContent">
                        <p>{"A new firmware update is available" + (this.state.latestRelease ? ': ' + this.state.latestRelease : '!') }</p>
                        <span>
                            <Button href="https://www.google.com" onClick={this.handleDownloadPageClick} className="githubButton downloadPageButton" text="Download Page"/>
                            <Button onClick={this.handleDismissNewReleases} className="githubButton downloadDismiss" text="Dismiss"/>
                        </span>
                    </div>
                }
                target={
                    <div className="popoverTarget" text="test"/>
                }
            />        
            <Sidebar className="sidebar"
              sidebar={
                  <Menu className="sidebar">
                      <Button className="minimizeSidebarButton" icon="caret-left" onClick={() => this.onSetSidebarOpen(false)} />
                      <img id="epicSidebarLogo" src={logo} alt="/"/>
                      <MenuDivider className="yellowMenuDivider"/>
                      <MenuItem icon={this.state.isDarkMode ? "lightbulb" : "moon"} text={this.state.isDarkMode ? "Light Mode" : "Dark Mode"} onClick={this.toggleDarkMode} />
                      <MenuDivider className="yellowMenuDivider"/>
                      <MenuItem icon="dashboard" text="Overview" onClick={() => this.onSetPage('dashboard')} />
                      <MenuItem icon="chart"
                            text="Hashrate Chart" 
                            onClick={() => this.onSetPage('chart')}
                        />
                      <MenuItem icon="th" text="Miner List" onClick={() => this.onSetPage('table')} />
                      <MenuItem icon="cog" text="Miner Settings" onClick={() => this.onSetPage('settings')} />
                      <MenuItem icon="help" text="Support" onClick={() => this.onSetPage('support')} />
                  </Menu>
              }
              open={this.state.sidebarOpen}
              onSetOpen={this.onSetSidebarOpen}
            styles={{ sidebar: { background: "#1B1D4D" } }}
            >
              <Button className="maximizeSidebarButton" icon="caret-right" onClick={() => this.onSetSidebarOpen(true)} />
              {this.state.page === 'loading' && <LoadingPage />}
              {this.state.page === 'dashboard' && <DashboardPage />}
              {this.state.page === 'chart' && <ChartPage ref="chartPage" dark={this.state.isDarkMode} />}
              {<TablePage                   visible={this.state.page === 'table'}
                                                />}
              {this.state.page === 'settings' && <SettingsPage />}
              {this.state.page === 'support' && <SupportPage />}


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
                            Navigate to Miner List
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
