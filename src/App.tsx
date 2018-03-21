import * as React from "react";
import "./App.css";

const logo = require("./logo.svg");

import * as Colyseus from "colyseus.js";

class App extends React.Component<{}> {
  client: Colyseus.Client;

  constructor(props: {}) {
    super(props);

    this.client = new Colyseus.Client("ws://127.0.0.1:3333");

    this.client.onOpen.add(() => {
      console.log("Opened");
    });

    this.client.onError.add(() => {
      console.log("Error");
    });

    this.client.onClose.add(() => {
      console.log("Closed");
    });

    this.client.join("beginner");
  }

  componentDidMount() {}

  render() {
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
