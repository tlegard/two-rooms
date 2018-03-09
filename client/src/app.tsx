import * as React from "react";
import { Client, Room, DataChange } from "colyseus.js";
import "./app.css";
import Lobby from "./lobby";
import Round from "./round";

type GameRoom = Room<{}>;

type GenericRole = "member" | "spy" | "negotiator" | "coy boy";

interface RedTeamPlayer {
  type: "player";
  team: "red";
  role: "bomber" | "engineer" | GenericRole;
}

interface BlueTeamPlayer {
  type: "player";
  team: "blue";
  role: "president" | "doctor" | GenericRole;
}

interface GreyTeamPlayer {
  type: "player";
  team: "grey";
  role: "gambler";
}

export interface ProspectivePlayer {
  type: "prospect";
  wantsToStart: boolean;
}

type Player =
  | GreyTeamPlayer
  | BlueTeamPlayer
  | RedTeamPlayer
  | ProspectivePlayer;

interface State {
  room?: GameRoom;
  players: {
    [key: string]: Player;
  };
  gameStatus: number;
  gameMode: number;
  neededToStart: number;
  client?: Client;
}

interface Props {}

const forceStart = (room: GameRoom): void => {
  return room.send({ type: "FORCE_START" });
};

const unforceStart = (room: GameRoom): void => {
  return room.send({ type: "UNFORCE_START" });
};

const joinGame = (room: GameRoom): void => {
  return room.send({ type: "JOIN" });
};

const leaveGame = (room: GameRoom): void => {
  return room.send({ type: "LEAVE" });
};

class App extends React.Component<Props, State> {
  client: Client;

  constructor(props: Props) {
    super(props);

    const protocol = window.location.protocol === "https" ? "wss" : "ws";
    const client = new Client(
      `${protocol}://aqueous-spire-37539.herokuapp.com`
    );
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
      players: {},
      neededToStart: NaN,
      gameStatus: 0,
      gameMode: 0
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

    room.listen("neededToStart", (change: DataChange) => {
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({ neededToStart: change.value });
      }
    });

    room.listen("gameStatus", (change: DataChange) => {
      console.debug(change);
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({ gameStatus: change.value });
      }
    });

    room.listen("gameMode", (change: DataChange) => {
      console.debug(change);
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({ gameMode: change.value });
      }
    });

    room.listen("players/:id", (change: DataChange) => {
      if (change.operation === "add") {
        this.setState({
          players: {
            ...this.state.players,
            [change.path.id]: change.value
          }
        });
      } else if (change.operation === "remove") {
        delete this.state.players[change.path.id];
        this.setState({ players: this.state.players });
      }
    });

    room.listen("players/:id/:attribute", (change: DataChange) => {
      const player = this.state.players[change.path.id];

      if (change.operation === "add") {
        this.setState({
          players: {
            ...this.state.players,
            [change.path.id]: {
              ...player,
              [change.path.attribute]: change.value
            }
          }
        });
      } else if (change.operation === "replace") {
        this.state.players[change.path.id][change.path.attribute] =
          change.value;
        this.setState({ players: this.state.players });
      } else if (change.operation === "remove") {
        delete this.state.players[change.path.id][change.path.attribute];
        this.setState({ players: this.state.players });
      }
    });
  }

  render() {
    const players = Object.values(this.state.players);
    const currentPlayer = this.client && this.state.players[this.client.id!];

    if (players) {
      console.log(players);
    }
    return (
      <div className="app">
        <header className="app-header" />

        {this.state.room &&
        (!currentPlayer || currentPlayer.type === "prospect") && (
          <Lobby
            rooms={[
              {
                displayString:
                  this.state.gameMode === 0
                    ? "Beginner Room"
                    : "Intermediate Room",
                joined: !!currentPlayer,
                totalPlayers: players.filter(
                  (player: Player) => player.type === "prospect"
                ).length,
                wantsToStart: players.filter(
                  player => player.type === "prospect" && player.wantsToStart
                ).length,
                neededToStart: this.state.neededToStart,
                maxPlayers: this.state.gameMode === 0 ? 17 : 25,
                minPlayers: this.state.gameMode === 0 ? 6 : 11,
                gameMode: this.state.gameMode,
                onForceStart: event =>
                  this.state.room &&
                  (currentPlayer.wantsToStart
                    ? unforceStart(this.state.room)
                    : forceStart(this.state.room)),
                onJoin: event => this.state.room && joinGame(this.state.room),
                onLeave: event => this.state.room && leaveGame(this.state.room)
              }
            ]}
          />
        )}
        {this.state.room &&
        currentPlayer &&
        currentPlayer.type === "player" && (
          <Round
            team={currentPlayer.team}
            role={currentPlayer.role}
            allowedToColorShare={
              this.state.gameMode === 0 ? (
                players.filter(player => player.type === "player").length > 10
              ) : (
                true
              )
            }
          />
        )}
      </div>
    );
  }
}

export default App;
