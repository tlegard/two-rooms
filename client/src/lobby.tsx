import * as React from "react";
import "./lobby.css";

import {
  UnstartedGame,
  AllowedToStartGame,
  GameStatus
} from "../../types/game";
import { MessageTypes } from "../../types/messages";

import { Playset } from "../../types/playset";

import { Room, DataChange } from "colyseus.js";
import { Listener } from "delta-listener";

import { ProspectivePlayer } from "../../types/player";
import { AllCharacters } from "../../types/characters";

type LobbyRoomProps = {
  clientId: string;
  playerName: string;
  displayString: string;
  room: Room;
  gameStatus: GameStatus.Unstarted | GameStatus.AllowedToStart;
  playset: Partial<Playset>;
};

interface LobbyState {
  game: Partial<UnstartedGame | AllowedToStartGame>;
}

const currentProspect = (
  clientId: string,
  prospects: ProspectivePlayer[]
): ProspectivePlayer | undefined => {
  return prospects.find(prospect => prospect.id === clientId);
};

class LobbyRoom extends React.Component<LobbyRoomProps, LobbyState> {
  neededListener?: Listener;
  constructor(props: LobbyRoomProps) {
    super(props);

    this.state = {
      game: {
        gameStatus: GameStatus.Unstarted,
        neededToStart: 0,
        prospects: []
      }
    };

    this.onJoin = this.onJoin.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onForceStart = this.onForceStart.bind(this);
    this.onProspectsChange = this.onProspectsChange.bind(this);

    this.onNeededToStartChange = this.onNeededToStartChange.bind(this);
  }

  componentDidMount() {
    this.neededListener = this.props.room.listen(
      "game/neededToStart",
      this.onNeededToStartChange
    );

    this.props.room.onUpdate.add(this.onProspectsChange);
  }

  componentWillUnmount() {
    if (this.neededListener) {
      this.props.room.removeListener(this.neededListener);
    }

    this.props.room.onUpdate.remove(this.onProspectsChange);
  }

  onNeededToStartChange(change: DataChange): void {
    if (change.operation === "add" || change.operation === "replace") {
      this.setState({
        game: {
          ...this.state.game,
          neededToStart: change.value
        }
      });
    }
  }

  onProspectsChange(data: any): void {
    // Prospects array are weird... so I'm just going to circumvent the heck out of it.
    this.setState({
      game: {
        ...this.state.game,
        prospects: (data.game as UnstartedGame).prospects
      }
    });
  }

  onJoin() {
    this.props.room.send({
      type: MessageTypes.Join,
      name: this.props.playerName
    });
  }

  onLeave() {
    this.props.room.send({ type: MessageTypes.Leave });
  }

  onForceStart() {
    const player = currentProspect(
      this.props.clientId,
      this.state.game.prospects || []
    );

    if (player) {
      if (player.wantsToStart) {
        this.props.room.send({ type: MessageTypes.UnforceStart });
      } else {
        console.log("Sending force start");
        this.props.room.send({ type: MessageTypes.ForceStart });
      }
    }
  }

  renderTeamOverview() {
    const prospects = this.state.game.prospects || [];

    const displayTeams = {
      blue: "Blue Team",
      red: "Red Team",
      grey: "Grey Team"
    };

    const organizedProspects: {
      [key: string]: AllCharacters[];
    } = prospects.reduce((memo, prospect) => {
      const team = prospect.character.team;

      memo[team] = (memo[team] || []).concat([prospect.character]);

      return memo;
    }, {});

    return (
      <div className="teams">
        {Object.keys(organizedProspects).map(team => {
          return (
            <dl key={team} className={`team ${team}`}>
              <dt className="team-header">{displayTeams[team]}</dt>
              <dd>
                <ul>
                  {organizedProspects[team]
                    .sort((charA, charB) => charB.zIndex - charA.zIndex)
                    .map((character, idx) => (
                      <li key={idx}>{character.role}</li>
                    ))}
                </ul>
              </dd>
            </dl>
          );
        })}
      </div>
    );
  }

  render() {
    const prospects = this.state.game.prospects || [];

    const totalPlayers = prospects.length;
    const { maxPlayers = 0, minPlayers = 0 } = this.props.playset;
    const neededToStart = this.state.game.neededToStart;

    const player = currentProspect(this.props.clientId, prospects);

    const wantsToStart = prospects.filter(prospect => prospect.wantsToStart)
      .length;

    return (
      <article>
        <header className="lobby-room-header">
          <h2>{this.props.displayString}</h2>
          <p>{`${totalPlayers}/${maxPlayers}`}</p>
          {player ? (
            <button onClick={this.onLeave}>Leave</button>
          ) : (
            <button onClick={this.onJoin}>Join</button>
          )}
        </header>
        {player &&
          (this.props.gameStatus === GameStatus.Unstarted ? (
            <p>You need at least {minPlayers} to play!</p>
          ) : (
            <React.Fragment>
              <button onClick={this.onForceStart}>
                {`Force Start ${wantsToStart}/${neededToStart}`}
              </button>
              {this.renderTeamOverview()}
            </React.Fragment>
          ))}
      </article>
    );
  }
}

export default LobbyRoom;
