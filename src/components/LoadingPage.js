import React from 'react'

import { Spinner } from '@blueprintjs/core'

import './LoadingPage.css'

class LoadingPage extends React.Component {
    
    render(){
        return (
            <Spinner className="spinner" size={200} />
        )
    }

}

export default LoadingPage;
