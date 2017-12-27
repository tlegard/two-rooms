import * as React from 'react';
import { default as axios } from 'axios'
import './App.css';

const logo = require('./logo.svg');

class App extends React.Component {
  render() {
    axios.get('/test')
      .then( (res) => {
        console.log(res.data)
      })
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
