import React from 'react'

import { Spinner } from '@blueprintjs/core'

class LoadingPage extends React.Component {
    
    render(){
        return (
            <Spinner size={200} />
        )
    }

}

export default LoadingPage;
