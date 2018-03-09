import * as React from "react";
import "./lobby.css";
type Room = {
  displayString: string;
  joined: boolean;
  totalPlayers: number;
  wantsToStart: number;
  neededToStart: number;
  onJoin: Function;
  onForceStart: Function;
  onLeave: Function;
  maxPlayers: number;
  minPlayers: number;
  gameMode: number;
};

type LobbyProps = {
  rooms: Room[];
};

class LobbyRoom extends React.Component<Room, {}> {
  renderBeginnerOverview(
    isGambler: boolean,
    isColorShare: boolean,
    regularTeamMembers: number
  ) {
    return (
      <dl className="overview">
        <dt className="blue-team">Blue Team Members:</dt>
        <dd>
          <dl className="roster">
            <dt>President:</dt>
            <dd>1</dd>
            <dt>Blue Team:</dt>
            <dd>{regularTeamMembers}</dd>
          </dl>
        </dd>
        <dt className="blue-team">Red Team Members:</dt>
        <dd>
          <dl className="roster">
            <dt>Bomber:</dt>
            <dd>1</dd>
            <dt>Blue Team:</dt>
            <dd>{regularTeamMembers}</dd>
          </dl>
        </dd>
        <dt className="grey-team">Grey Team Members:</dt>
        <dd>
          <dl className="roster">
            <dt>Gambler:</dt>
            <dd>{isGambler ? 1 : 0}</dd>
          </dl>
        </dd>
        <dt>Allowed to Color Share:</dt>
        <dd>{isColorShare ? "Yes" : "No"}</dd>
      </dl>
    );
  }

  renderIntermediate(isGambler: boolean, regularTeamMembers: number) {
    return (
      <dl className="overview">
        <dt className="blue-team">Blue Team Members:</dt>
        <dd>
          <dl className="roster">
            <dt>President:</dt>
            <dd>1</dd>
            <dt>Doctor:</dt>
            <dd>1</dd>
            <dt>Spy:</dt>
            <dd>1</dd>
            <dt>Coy Boy:</dt>
            <dd>1</dd>
            <dt>Negotiator:</dt>
            <dd>1</dd>
            <dt>Blue Team:</dt>
            <dd>{regularTeamMembers}</dd>
          </dl>
        </dd>
        <dt className="red-team">Red Team Members:</dt>
        <dd>
          <dl className="roster">
            <dt>Bomber:</dt>
            <dd>1</dd>
            <dt>Engineer:</dt>
            <dd>1</dd>
            <dt>Spy:</dt>
            <dd>1</dd>
            <dt>Coy Boy:</dt>
            <dd>1</dd>
            <dt>Negotiator:</dt>
            <dd>1</dd>
            <dt>Red Team:</dt>
            <dd>{regularTeamMembers}</dd>
          </dl>
        </dd>
        <dt className="grey-team">Grey Team Members:</dt>
        <dd>
          <dl className="roster">
            <dt>Gambler:</dt>
            <dd>{isGambler ? 1 : 0}</dd>
          </dl>
        </dd>
        <dt>Allowed to Color Share:</dt>
        <dd>Yes</dd>
      </dl>
    );
  }
  render() {
    const isGambler = !!(this.props.totalPlayers % 2);
    const isColorShare = this.props.totalPlayers > 10;
    const regularTeamMembers = Math.floor(this.props.totalPlayers / 2 - 4) - 1;

    return (
      <article>
        <header className="lobby-room-header">
          <h2>{this.props.displayString}</h2>
          <p>{`${this.props.totalPlayers}/${this.props.maxPlayers}`}</p>
          {this.props.joined ? (
            <button onClick={() => this.props.onLeave()}>Leave</button>
          ) : (
            <button onClick={() => this.props.onJoin()}>Join</button>
          )}
        </header>
        {this.props.joined &&
          (this.props.totalPlayers < this.props.minPlayers ? (
            <p>You need at least {this.props.minPlayers} to play!</p>
          ) : (
            <React.Fragment>
              <button onClick={() => this.props.onForceStart()}>
                {`Force Start ${this.props.wantsToStart}/${this.props
                  .neededToStart}`}
              </button>
              {this.props.gameMode === 0 ? (
                this.renderBeginnerOverview(
                  isGambler,
                  isColorShare,
                  regularTeamMembers
                )
              ) : (
                this.renderIntermediate(isGambler, regularTeamMembers)
              )}
            </React.Fragment>
          ))}
      </article>
    );
  }
}

class Lobby extends React.Component<LobbyProps, {}> {
  render() {
    return (
      <ul className="lobby-game-list">
        {this.props.rooms.map(room => (
          <li key={room.displayString}>
            <LobbyRoom {...room} />
          </li>
        ))}
      </ul>
    );
  }
}

export default Lobby;
