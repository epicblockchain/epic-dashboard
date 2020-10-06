import React from 'react'

import { Button, InputGroup } from '@blueprintjs/core'
import './Inputs.css'

class MiningPoolTab extends React.Component {

    render() {
        return (
            <div>
                <InputGroup className="inputClass"
                        placeholder="Mining pool"
                        value={this.props.miningpool}
                        onChange={this.props.changeminingpool} />
                <InputGroup className="inputClass" placeholder="Password" type="password"/>
                <Button>Apply</Button>
            </div>
        );
    }
}

export default MiningPoolTab;
