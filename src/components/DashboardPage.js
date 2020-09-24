import React from 'react'
import { Card, Elevation } from '@blueprintjs/core'
import './DashboardPage.css'

class DashboardPage extends React.Component {
    render () {
        return (
            <div className="dashboardCardContainer">
                <div className="dashboardRowContainer">
                    <Card>
                        <h5>Card heading 1</h5>
                        <p>Card content</p>
                    </Card>
                    <Card>
                        <h5>Card heading 2</h5>
                        <p>Card content</p>
                    </Card>
                    <Card>
                        <h5>Card heading 3</h5>
                        <p>Card content</p>
                    </Card>
                </div>
                <div className="dashboardRowContainer">
                    <Card>
                        <h5>Card heading 4</h5>
                        <p>Card content</p>
                    </Card>
                    <Card>
                        <h5>Card heading 5</h5>
                        <p>Card content</p>
                    </Card>
                    <Card>
                        <h5>Card heading 6</h5>
                        <p>Card content</p>
                    </Card>
                </div>
            </div>
        );
    }
}

export default DashboardPage;
