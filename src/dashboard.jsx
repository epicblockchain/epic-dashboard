import * as React from 'react';
const got = require('got');

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        //this.state = {miners: []};

        //this.func = this.func.bind(this);
    }

    /*async func() {
        var miners = [];
        for (let miner of this.props.data) {
            try {
                const data = await got(`http://${miner.address}:${miner.service.port}/summary`);
            } catch(err) {
                miners.push(err);
            }
            
            miners.push(data.body);
        }
        console.log(miners);
        this.setState({miners: miners});
    }*/

    render() {
        return (
            <div>
                <h1>Table</h1>
                <ul>
                    {
                        this.props.data.map(function(item, i) {
                            return <li key={i}>{JSON.stringify(item)}</li>
                        })
                    }
                </ul>
            </div>   
        );
    }
}