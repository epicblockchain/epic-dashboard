const {ipcRenderer} = require('electron');

const request = (url, options) => ipcRenderer.invoke('miner-request', url, options);
request.post = (url, options) => request(url, {...options, method: 'POST'});

export default request;
