import React from 'react'
import { Card, Elevation } from '@blueprintjs/core'
import './DashboardPage.css'
import '@blueprintjs/core/lib/css/blueprint.css'

const electron = window.require('electron')

class DashboardPage extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            pageState: 'loading',
            dashboardData: null
        }
        this.dashboardGetterHandler = this.dashboardGetterHandler.bind(this);
    }

    dashboardGetterHandler(event, args){
        this.setState({dashboardData: args})
        this.setState({pageState: 'loaded'})
    }

    componentDidMount(){
        electron.ipcRenderer.send('get-dashboard')
        electron.ipcRenderer.on('get-dashboard-reply', this.dashboardGetterHandler)
    }

    componentWillUnmount(){
        electron.ipcRenderer.removeListener('get-dashboard-reply', this.dashboardGetterHandler)
    }

    render () {
        return (
            <>{this.state.pageState === 'loaded' &&
                <div className="flex-grid dashboardCards">
                    <div className="col">
                        <Card className="dashboardCard" interactive={true} elevation={Elevation.FOUR}>
                            <h3>{this.state.dashboardData.card1.heading}</h3>
                            <h2>{this.state.dashboardData.card1.content}</h2>
                        </Card>
                        <Card className="dashboardCard" interactive={true} elevation={Elevation.FOUR}>
                            <h3>{this.state.dashboardData.card2.heading}</h3>
                            <h2>{this.state.dashboardData.card2.content}</h2>
                        </Card>
                    </div>
                    <div className="col">
                        <Card className="dashboardCard" interactive={true} elevation={Elevation.FOUR}>
                            <h3>{this.state.dashboardData.card3.heading}</h3>
                            <h2>{this.state.dashboardData.card3.content}</h2>
                        </Card>
                        <Card className="dashboardCard" interactive={true} elevation={Elevation.FOUR}>
                            <h3>{this.state.dashboardData.card4.heading}</h3>
                            <h2>{this.state.dashboardData.card4.content}</h2>
                        </Card>
                    </div>
                    <div className="col">
                        <Card className="dashboardCard" interactive={true} elevation={Elevation.FOUR}>
                            <h3>{this.state.dashboardData.card5.heading}</h3>
                            <h2>{this.state.dashboardData.card5.content}</h2>
                        </Card>
                        <Card className="dashboardCard" interactive={true} elevation={Elevation.FOUR}>
                            <h3>{this.state.dashboardData.card6.heading}</h3>
                            <h2>{this.state.dashboardData.card6.content}</h2>
                        </Card>
                    </div>
                </div>
                }</>
        );
    }
}

export default DashboardPage;
