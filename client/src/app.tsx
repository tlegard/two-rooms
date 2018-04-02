import { GameStatus } from "../../types/game";
import { Playset } from "../../types/playset";
import { AllPlayers } from "../../types/player";
import { ActiveBoomRoom, TradingBoomRoom } from "../../types/boom-room";

import * as localForage from "localforage";

import * as React from "react";
import { Client, Room, DataChange } from "colyseus.js";
import "./app.css";

import Lobby from "./lobby";
import Game from "./game";

interface State {
  gameStatus: GameStatus;
  playset: Partial<Playset>;
  players: AllPlayers[];
  playerName?: string;
  serializedPlayerName?: string;
  roundDuration?: number;
  room?: Room;
  roomOne?: ActiveBoomRoom | TradingBoomRoom;
  roomTwo?: ActiveBoomRoom | TradingBoomRoom;
  hostagesNeeded?: number;
  currentRound?: number;
  totalRounds?: number;
}

interface Props {}

const url =
  process.env.NODE_ENV === "production"
    ? "aqueous-spire-37539.herokuapp.com"
    : "127.0.0.1:7001";

class App extends React.Component<Props, State> {
  client: Client;

  constructor(props: Props) {
    super(props);

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const client = new Client(`${protocol}//${url}`);
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
      gameStatus: GameStatus.Unstarted,
      playset: {},
      players: []
    };

    localForage.getItem("name").then((name: string) => {
      this.setState({ playerName: name });
      this.setState({ serializedPlayerName: name });
    });

    this.onData = this.onData.bind(this);
  }

  componentDidMount() {
    const room = this.client.join("beginner");

    this.client.onError.add(error => {
      window.console.error(error);
    });

    room.onJoin.add(() => {
      this.setState({ room });
    });

    room.onUpdate.add(this.onData);

    room.listen("game/gameStatus", (change: DataChange) => {
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({ gameStatus: change.value });
      }
    });

    room.listen("game/playset/:attribute", (change: DataChange) => {
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({
          playset: {
            ...this.state.playset || {},
            [change.path.attribute]: change.value
          }
        });
      }
    });

    room.listen("game/duration", (change: DataChange) => {
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({
          roundDuration: change.value
        });
      }
    });

    room.listen("game/roomOne", (change: DataChange) => {
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({
          roomOne: change.value
        });
      }
    });

    room.listen("game/roomTwo", (change: DataChange) => {
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({
          roomTwo: change.value
        });
      }
    });

    room.listen("game/hostagesNeeded", (change: DataChange) => {
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({
          hostagesNeeded: change.value
        });
      }
    });

    room.listen("game/totalRounds", (change: DataChange) => {
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({
          totalRounds: change.value
        });
      }
    });

    room.listen("game/currentRound", (change: DataChange) => {
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({
          currentRound: change.value
        });
      }
    });
  }

  onData(data: any): void {
    console.log(data.game);
    // Players array are weird... so I'm just going to circumvent the heck out of it.
    this.setState({
      players: data.game.players || []
    });
  }

  render() {
    if (!this.state.room || !this.client.id) {
      return null;
    }

    if (!this.state.serializedPlayerName) {
      return (
        <div className="app">
          <header className="app-header" />
          <form
            onSubmit={() => {
              this.setState({
                serializedPlayerName: this.state.playerName
              });
              localForage.setItem("name", this.state.playerName);
            }}
          >
            <label>Your Name:</label>
            <input
              type="text"
              value={this.state.playerName}
              onChange={event =>
                this.setState({ playerName: event.target.value })}
            />
            <button>Go</button>
          </form>
        </div>
      );
    }

    return (
      <div className="app">
        <header className="app-header" />
        {(this.state.gameStatus === GameStatus.Unstarted ||
          this.state.gameStatus === GameStatus.AllowedToStart) && (
          <Lobby
            clientId={this.client.id}
            playerName={this.state.serializedPlayerName}
            displayString="Beginner Room"
            room={this.state.room}
            gameStatus={this.state.gameStatus}
            playset={this.state.playset}
          />
        )}
        {this.state.gameStatus === GameStatus.Initializing && (
          <Game
            gameStatus={this.state.gameStatus}
            room={this.state.room}
            players={this.state.players}
            playerId={this.client.id}
            roundDuration={this.state.roundDuration!}
          />
        )}
        {this.state.gameStatus === GameStatus.Active && (
          <Game
            gameStatus={this.state.gameStatus}
            room={this.state.room}
            boomRooms={[
              this.state.roomOne as ActiveBoomRoom,
              this.state.roomTwo as ActiveBoomRoom
            ]}
            hostagesNeeded={this.state.hostagesNeeded!}
            players={this.state.players}
            playerId={this.client.id}
            roundDuration={this.state.roundDuration!}
            currentRound={this.state.currentRound || 0}
            totalRounds={this.state.totalRounds || 0}
          />
        )}
        {this.state.gameStatus === GameStatus.Transitioning && (
          <Game
            gameStatus={this.state.gameStatus}
            room={this.state.room}
            boomRooms={[
              this.state.roomOne as TradingBoomRoom,
              this.state.roomTwo as TradingBoomRoom
            ]}
            hostagesNeeded={this.state.hostagesNeeded!}
            players={this.state.players}
            playerId={this.client.id}
            roundDuration={this.state.roundDuration!}
            currentRound={this.state.currentRound || 0}
            totalRounds={this.state.totalRounds || 0}
          />
        )}
        {this.state.gameStatus === GameStatus.Ending && (
          <Game
            gameStatus={this.state.gameStatus}
            room={this.state.room}
            roundDuration={undefined}
            boomRooms={[
              this.state.roomOne as TradingBoomRoom,
              this.state.roomTwo as TradingBoomRoom
            ]}
            players={this.state.players}
            playerId={this.client.id}
          />
        )}
      </div>
    );
  }
}

export default App;
