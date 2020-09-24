import React from 'react'
import Sidebar from 'react-sidebar'
import DashboardPage from './components/DashboardPage'
import ChartPage from './components/ChartPage'
import SettingsPage from './components/SettingsPage'
import TablePage from './components/TablePage'
import {Button, Menu, MenuItem, MenuDivider} from '@blueprintjs/core'
import logo from './assets/img/EpicLogo-Vertical.png'
import axios from 'axios'

import { connect, useSelector } from 'react-redux'
import { minersAdded } from './features/miners/minersSlice'

//blueprnt js css files vvvvvv
//import "@blueprintjs/core/lib/css/blueprint-icons.css";
import "@blueprintjs/table/lib/css/table.css"
import "@blueprintjs/core/lib/css/blueprint.css"
import './App.css' //this was loaded before anything in the examples


const electron = window.require('electron');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: true,
      page: "loading"
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    electron.ipcRenderer.on('update-miner-ips', (event, message) => {
        const newMiners = JSON.parse(message);
        this.props.dispatch(
            minersAdded(newMiners)
        ) 
    });
  }
 

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  handlePageChangeClick(newPage){
      this.setState({page: newPage});
  }

  render() {
    var page;
    if (this.state.page === "dashboard") {
        page = <DashboardPage />
    } else if (this.state.page === "chart") {
        page = <ChartPage />
    } else if (this.state.page === "table") {
        page = <TablePage />
    } else if (this.state.page === "settings") {
        page = <SettingsPage />
    }
    return (
        <div>
            <p>{useSelector(state => state.miners))}</p>
            <Sidebar 
                sidebar={
                        <Menu> 
                           <Button className="minimizeSidebarButton" icon="caret-left" onClick={() => this.onSetSidebarOpen(false)}/>
                           <img id="epicSidebarLogo" src={logo} alt=""/> 
                           <MenuDivider />
                           <MenuItem icon="dashboard" text="Dashboard" onClick={(e)=>this.handlePageChangeClick("dashboard")} /> 
                           <MenuItem icon="chart" text="Hashrate Chart" onClick={(e)=>this.handlePageChangeClick("chart")}/> 
                           <MenuItem icon="th" text="Miners" onClick={(e)=>this.handlePageChangeClick("table")}/> 
                           <MenuItem icon="cog" text="Settings" onClick={(e)=>this.handlePageChangeClick("settings")}/> 
                        </Menu>
                }
                open={this.state.sidebarOpen}
                onSetOpen={this.onSetSidebarOpen}
                styles={{ sidebar: { background: "white" } }} >
            <Button className="maximizeSidebarButton" icon="caret-right" onClick={() => this.onSetSidebarOpen(true)} />
            </Sidebar>
            {page}
        </div>
    );
  }
}

export default connect()(App);
