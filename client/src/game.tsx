import * as React from "react";
import "./game.css";

import { GameStatus } from "../../types/game";
import { AllPlayers } from "../../types/player";
import { ActiveBoomRoom, TradingBoomRoom } from "../../types/boom-room";
import { MessageTypes } from "../../types/messages";
import { Room, DataChange } from "colyseus.js";

const leader = require("./images/leader.png");
const member = require("./images/member.png");
const hostage = require("./images/hostage.png");

import Round from "./round";

function times<T>(foo: (idx?: number) => T, len: number): T[] {
  let list = new Array<T>(len);
  let index = 0;
  while (index < len) {
    list[index] = foo(index);
    index += 1;
  }

  return list;
}

interface CommonProps {
  room: Room;
  players: AllPlayers[];
  playerId: string;
}

interface InitializingGameProps extends CommonProps {
  gameStatus: GameStatus.Initializing;
  roundDuration: number;
}

interface ActiveGameProps extends CommonProps {
  gameStatus: GameStatus.Active;
  boomRooms: ActiveBoomRoom[];
  roundDuration: number;
  hostagesNeeded: number;
  currentRound: number;
  totalRounds: number;
}

interface TransitioningGameProps extends CommonProps {
  hostagesNeeded: number;
  roundDuration: number;
  boomRooms: TradingBoomRoom[];
  gameStatus: GameStatus.Transitioning;
  currentRound: number;
  totalRounds: number;
}

interface EndingGameProps extends CommonProps {
  gameStatus: GameStatus.Ending;
  roundDuration: undefined;
}

type GameProps =
  | InitializingGameProps
  | ActiveGameProps
  | TransitioningGameProps
  | EndingGameProps;

type GameState = {
  timeRemaining?: number;
  boomRoom?: ActiveBoomRoom | TradingBoomRoom;
  currentPlayer?: AllPlayers;
  lastTick?: Date;
  usurp?: string;
  abdicating: boolean;
  showingRoom: boolean;
  colorSharing: boolean;
  cardSharing: boolean;
  gamblerVote?: "red" | "blue";
};

const formatSeconds = (time: number): string => {
  const seconds = Math.floor(time / 1000);
  return `${seconds < 10 ? "0" : ""}${seconds}`;
};

const formatMinuteSeconds = (time: number): string => {
  return `${Math.floor(time / 60000)}:${formatSeconds(time % 60000)}`;
};

class Game extends React.Component<GameProps, GameState> {
  timeRemaining?: number;

  constructor(props: GameProps) {
    super(props);

    const player = props.players.find(play => play.id === this.props.playerId);

    this.state = {
      currentPlayer: player,
      boomRoom:
        (this.props.gameStatus === GameStatus.Active ||
          this.props.gameStatus === GameStatus.Transitioning) &&
        player
          ? this.props.boomRooms[player.room - 1]
          : undefined,
      timeRemaining: this.props.roundDuration,
      abdicating: false,
      showingRoom: true,
      colorSharing: false,
      cardSharing: false,
      gamblerVote: undefined
    };

    this.updateTimeRemaining = this.updateTimeRemaining.bind(this);
    this.onData = this.onData.bind(this);
    this.toggleAbdicating = this.toggleAbdicating.bind(this);
    this.exchangeHostages = this.exchangeHostages.bind(this);
  }

  componentDidMount() {
    if (
      this.props.roundDuration &&
      this.props.gameStatus !== GameStatus.Transitioning
    ) {
      this.setState({
        timeRemaining: this.props.roundDuration,
        lastTick: new Date()
      });

      this.timeRemaining = window.setTimeout(this.updateTimeRemaining, 500);
    }

    this.props.room.listen("game/gamblerVote", (change: DataChange) => {
      if (change.operation === "add" || change.operation === "replace") {
        this.setState({
          gamblerVote: change.value
        });
      }
    });

    this.props.room.onUpdate.add(this.onData);
  }

  onData(data: any): void {
    // Prospects array are weird... so I'm just going to circumvent the heck out of it.
    const room =
      this.state.currentPlayer &&
      (this.state.currentPlayer.room === 1 ? "roomOne" : "roomTwo");

    if (room && data.game[room]) {
      this.setState({
        boomRoom: data.game[room]
      });
    }
  }

  componentWillReceiveProps(newProps: GameProps) {
    if (this.props.roundDuration !== newProps.roundDuration) {
      if (this.timeRemaining) {
        window.clearTimeout(this.timeRemaining);
      }

      this.setState({
        timeRemaining: newProps.roundDuration,
        lastTick: new Date()
      });
      this.timeRemaining = window.setTimeout(this.updateTimeRemaining, 500);
    }
  }

  updateTimeRemaining(): void {
    if (this.state.timeRemaining) {
      const currentTime = new Date();
      const deltaMilliseconds =
        currentTime.getTime() - this.state.lastTick!.getTime();
      const timeRemaining = this.state.timeRemaining - deltaMilliseconds;
      this.setState({ timeRemaining: timeRemaining, lastTick: new Date() });

      if (timeRemaining > 0) {
        window.setTimeout(this.updateTimeRemaining, 500);
      }
    }
  }

  componentDidUpdate(oldProps: GameProps, oldState: GameState) {
    if (
      oldProps.gameStatus === GameStatus.Active &&
      this.props.gameStatus === GameStatus.Transitioning
    ) {
      this.setState({ showingRoom: true });
    }
  }

  onGamblerBet(vote: "red" | "blue") {
    this.props.room.send({
      type: MessageTypes.GamblerBet,
      vote
    });
  }

  endGame() {
    this.props.room.send({
      type: MessageTypes.End
    });
  }

  onPlayerClick(playerId: string) {
    if (!this.state.boomRoom) {
      return;
    }

    const isLeader = this.props.playerId === this.state.boomRoom.leader;

    const isPlayerHostage = this.state.boomRoom.hostages.find(
      player => player === playerId
    );

    if (isLeader) {
      if (this.state.abdicating) {
        this.props.room.send({
          type: MessageTypes.Abdicate,
          player: playerId
        });
        this.setState({ abdicating: false });
      } else if (isPlayerHostage) {
        this.props.room.send({
          type: MessageTypes.Release,
          player: playerId
        });
      } else {
        this.props.room.send({
          type: MessageTypes.Capture,
          player: playerId
        });
      }
    } else {
      if (this.state.usurp) {
        this.props.room.send({
          type: MessageTypes.Relinquish,
          player: this.state.usurp
        });
      }

      if (this.state.usurp === playerId) {
        this.setState({ usurp: undefined });
      } else {
        this.props.room.send({ type: MessageTypes.Usurp, player: playerId });

        if (this.state.boomRoom && this.state.boomRoom.leader) {
          this.setState({ usurp: playerId });
        }
      }
    }
  }

  toggleAbdicating() {
    this.setState({ abdicating: !this.state.abdicating });
  }

  exchangeHostages() {
    this.props.room.send({
      type: MessageTypes.Exchange
    });
  }

  renderRoom() {
    if (
      this.state.currentPlayer &&
      (this.props.gameStatus === GameStatus.Active ||
        this.props.gameStatus === GameStatus.Transitioning)
    ) {
      const player = this.state.currentPlayer;
      const boomRoom = this.state.boomRoom!;
      const playersInRoom = this.props.players.filter(
        play => play.room === player!.room && play.id !== player.id
      );

      const isLeader = boomRoom.leader === player.id;
      const isHostage = boomRoom.hostages.find(playa => playa === player.id);

      return (
        <div className="room">
          <header className="current-player">
            <img
              className="room-status"
              src={isLeader ? leader : isHostage ? hostage : member}
            />
            <h1>{player.name}</h1>
            <h2>
              {this.state.abdicating ? (
                `You are abdicating your leadership`
              ) : isLeader ? (
                `You are the leader of the room`
              ) : isHostage ? (
                `You are a hostage`
              ) : (
                `You are a member of the room.`
              )}
            </h2>
            <h3>
              {this.state.abdicating ? (
                `Choose the next leader`
              ) : isLeader ? (
                `Choose your hostages`
              ) : isHostage ? (
                `Prepare to change rooms`
              ) : (
                `Vote to usurp a leader`
              )}
            </h3>
            {isLeader && this.props.gameStatus === GameStatus.Active ? (
              <React.Fragment>
                <button onClick={this.toggleAbdicating}>Abdicate</button>
                <button onClick={() => this.endGame()}>End Game</button>
              </React.Fragment>
            ) : isLeader &&
            this.props.gameStatus === GameStatus.Transitioning &&
            boomRoom.hostages.length >= this.props.hostagesNeeded ? (
              <React.Fragment>
                <button onClick={this.exchangeHostages}>Exchange</button>
                <button onClick={() => this.endGame()}>End Game</button>
              </React.Fragment>
            ) : null}
          </header>
          <ul className="players">
            {playersInRoom.map((play, idx) => {
              const usurpVotes = Object.values(
                "usurpVotes" in boomRoom
                  ? (boomRoom as ActiveBoomRoom).usurpVotes
                  : {}
              ).filter(p => p === play.id).length;

              const imgSrc =
                boomRoom.leader === play.id
                  ? leader
                  : boomRoom.hostages.find(playa => play.id === playa)
                    ? hostage
                    : member;

              return (
                <li key={idx}>
                  <div
                    onClick={() => {
                      this.onPlayerClick(play.id);
                    }}
                    className="player"
                  >
                    <img src={imgSrc} className="player-status" />
                    <span className="player-name">{play.name}</span>

                    <div className="votes">
                      {times(
                        i => <span key={`usurp${i}`} className="usurp-vote" />,
                        usurpVotes
                      )}
                      {times(
                        i => (
                          <span key={`needed${i}`} className="needed-vote" />
                        ),
                        Math.ceil(playersInRoom.length) - usurpVotes
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
  }

  renderOverlay() {
    const player = this.props.players.find(
      play => play.id === this.props.playerId
    );

    const objectives = {
      bomber: "Be in the room with the president by the end of the game",
      president:
        "Avoid being in the room with the bomber at the end of the game",
      gambler: "Vote on which team you think one after the last round",
      red: "Kill the president",
      blue: "Keep the president alive"
    };

    if (player) {
      const team = player && player.character.team;
      const role = player && player.character.role;
      return (
        <div className="overlay">
          <dl className="objective">
            <dt>Role:</dt>
            <dd>
              <span className={`role ${team}`}>
                {` ${team} ${player.character.role}`}
              </span>
            </dd>
            <dt>Objective:</dt>
            <dd>{role === "member" ? objectives[team] : objectives[role]}</dd>
            <dt>Room:</dt>
            <dd>{player.room === 1 ? "Room One" : "Room Two"}</dd>
          </dl>
          <p>
            The game will begin in{" "}
            {formatSeconds(this.state.timeRemaining || 0)}
          </p>
          <p>
            Once the game begins, quickly vote for a leader. The first person
            nominated will become the leader.
          </p>
          <p>
            You may usurp the leader at any time during the round with a simple
            majority.
          </p>
          <p>As leader, nominate hostages to trade with the other room.</p>
          <p>Tap on the card tab to share your card with other players</p>
          <span className="time-remaining">
            {formatSeconds(this.state.timeRemaining || 0)}
          </span>
        </div>
      );
    }
  }

  renderTransitioningOverlay() {
    if (this.props.gameStatus === GameStatus.Transitioning) {
      if (
        !this.state.boomRoom!.leader ||
        this.state.boomRoom!.leader === this.props.playerId
      ) {
        return null;
      } else {
        return (
          <div className="overlay">
            <p>Waiting on the leader to select and exchange hostages.</p>
          </div>
        );
      }
    }
  }

  renderEndingOverlay(currentPlayer: AllPlayers) {
    const gambler = this.props.players.find(
      player => player.character.role === "gambler"
    );

    if (this.props.gameStatus === GameStatus.Ending) {
      if (gambler && !this.state.gamblerVote) {
        if (currentPlayer.character.role === "gambler") {
          return (
            <div className="overlay">
              <p>You are the gambler place your team beat</p>
              <button onClick={() => this.onGamblerBet("red")}>Red Team</button>
              <button onClick={() => this.onGamblerBet("blue")}>
                Blue Team
              </button>
            </div>
          );
        }

        return (
          <div className="overlay">
            <p>Waiting on the gambler to place their bets.</p>
          </div>
        );
      }

      const bomber = this.props.players.find(
        player => player.character.role === "bomber"
      );

      const president = this.props.players.find(
        player => player.character.role === "president"
      );

      const winningTeam = president!.room === bomber!.room ? "red" : "blue";

      return (
        <div className="overlay">
          <p>
            The <span className="role blue">president</span>{" "}
            <b>{winningTeam === "red" ? "was" : "wasn't"}</b> in the room with
            the <span className="role red">bomber</span>.
          </p>

          <p>
            The{" "}
            <span className={`role ${winningTeam}`}>
              {winningTeam} team
            </span>{" "}
            wins!
          </p>

          {this.state.gamblerVote && (
            <p>
              The gambler voted on the{" "}
              <span className={`role ${this.state.gamblerVote}`}>
                {this.state.gamblerVote}
              </span>{" "}
              team. The gambler{" "}
              <b>
                {this.state.gamblerVote === winningTeam ? (
                  "also wins!"
                ) : (
                  "loses."
                )}
              </b>
            </p>
          )}
          <button onClick={() => this.endGame()}>End Game</button>
        </div>
      );
    }
  }

  renderHeader(room?: 1 | 2) {
    if (
      this.props.gameStatus === GameStatus.Active ||
      this.props.gameStatus === GameStatus.Transitioning
    ) {
      return (
        <header className="room-header">
          {room && <h1>{room === 1 ? "Room 1" : "Room 2"}</h1>}
          <div className="round-breakdown">
            <span>
              Round: {this.props.currentRound} / {this.props.totalRounds}
            </span>
            <span>
              Time Remaining:{" "}
              {formatMinuteSeconds(this.state.timeRemaining || 0)} /{" "}
              {formatMinuteSeconds(this.props.roundDuration)}
            </span>
            <span>
              {this.props.hostagesNeeded &&
                `Hostages: ${this.state.boomRoom!.hostages.length} / ${this
                  .props.hostagesNeeded}`}
            </span>
          </div>
        </header>
      );
    }
  }

  render() {
    const currentPlayer = this.props.players.find(
      player => this.props.playerId === player.id
    );

    return (
      <section>
        {this.renderHeader(currentPlayer && currentPlayer.room)}
        {this.props.gameStatus === GameStatus.Initializing &&
          this.renderOverlay()}

        {this.props.gameStatus === GameStatus.Transitioning &&
          this.renderTransitioningOverlay()}

        {currentPlayer &&
          this.props.gameStatus === GameStatus.Ending &&
          this.renderEndingOverlay(currentPlayer)}

        {this.state.showingRoom ? (
          this.renderRoom()
        ) : (
          currentPlayer && (
            <Round
              team={currentPlayer.character.team}
              role={currentPlayer.character.role}
              allowedToColorShare={this.props.players.length >= 10}
              onEndGame={() => {
                console.log("Game end nerd");
              }}
            />
          )
        )}
        <nav className="game-actions">
          <ul>
            <li>
              <button
                onClick={() => this.setState({ showingRoom: false })}
                className="game-action"
              >
                Card
              </button>
            </li>
            <li>
              <button
                onClick={() => this.setState({ showingRoom: true })}
                className="game-action"
              >
                Room
              </button>
            </li>
          </ul>
        </nav>
      </section>
    );
  }
}

export default Game;
