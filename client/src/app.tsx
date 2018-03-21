import { GameStatus } from "../../types/game";
import * as React from "react";
import { Client, Room, DataChange } from "colyseus.js";
import "./app.css";

interface State {
  gameStatus: GameStatus;
  room?: Room;
}

interface Props {}

class App extends React.Component<Props, State> {
  client: Client;

  constructor(props: Props) {
    super(props);

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const client = new Client(`${protocol}//localhost:7001`);
    this.client = client;

    this.client.onError.add(() => {
      window.console.error(`Connection.onError`);
    });

    this.client.onClose.addOnce(() => {
      window.console.log("Connection closing");
    });

    this.client.onOpen.addOnce(() => {
      window.console.log("Connection open");
    });

    this.client.onMessage.addOnce(() => {
      window.console.log("Conection Message");
    });

    this.state = {
      gameStatus: GameStatus.Unstarted
    };
  }

  componentDidMount() {
    const room = this.client.join("beginner");

    this.client.onError.add(error => {
      window.console.error(error);
    });

    room.onJoin.add(() => {
      this.setState({ room });
    });

    room.listen("game/gameStatus", (change: DataChange) => {
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({ gameStatus: change.value });
      }
    });
  }

  render() {
    return (
      <div className="app">
        <header className="app-header" />
        {(this.state.gameStatus === GameStatus.Unstarted ||
          this.state.gameStatus === GameStatus.AllowedToStart) && (
          <ul>Game is Starting</ul>
        )}
      </div>
    );
  }
}

export default App;
