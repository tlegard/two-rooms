import { Room, Client, EntityMap } from "colyseus";
import { times, map, addIndex, mergeAll, compose } from "ramda";
const shuffle = require("shuffle-array");

interface RedTeamPlayer {
  type: "player";
  team: "red";
  role: "bomber" | "member";
}

interface BlueTeamPlayer {
  type: "player";
  team: "blue";
  role: "president" | "member";
}

interface GreyTeamPlayer {
  type: "player";
  team: "grey";
  role: "gambler";
}

interface ProspectivePlayer {
  type: "prospect";
  wantsToStart: boolean;
}

type Player =
  | ProspectivePlayer
  | RedTeamPlayer
  | BlueTeamPlayer
  | GreyTeamPlayer;

export enum GameStatus {
  Unstarted,
  AllowedToStart,
  Started
}

class State {
  players: EntityMap<Player> = {};
  gameStatus: GameStatus = GameStatus.Unstarted;
  neededToStart: number = 4;

  createPlayer(id: string) {
    const numberOfPlayers = Object.keys(this.players).length;

    if (GameStatus.Unstarted || GameStatus.AllowedToStart) {
      this.players[id] = { type: "prospect", wantsToStart: false };

      this.neededToStart = Math.max(
        Math.floor((numberOfPlayers + 1) / 3 * 2),
        4
      );
    }
  }

  startGame() {
    const prospectivePlayers = Object.values(this.players).filter(
      player => player.type === "prospect"
    );

    const greyTeam: GreyTeamPlayer[] =
      prospectivePlayers.length % 2
        ? [{ team: "grey", type: "player", role: "gambler" }]
        : [];

    const equalTeamNumber = Math.floor(
      (prospectivePlayers.length - greyTeam.length) / 2
    );

    const redTeam: RedTeamPlayer[] = [
      { team: "red", type: "player", role: "bomber" },
      ...times(
        (): RedTeamPlayer => ({ team: "red", type: "player", role: "member" }),
        equalTeamNumber - 1
      )
    ];

    const blueTeam: BlueTeamPlayer[] = [
      { team: "blue", type: "player", role: "president" },
      ...times(
        (): BlueTeamPlayer => ({
          team: "blue",
          type: "player",
          role: "member"
        }),
        equalTeamNumber - 1
      )
    ];

    const allTeams: Player[] = [...greyTeam, ...blueTeam, ...redTeam];

    const randomizedTeams: Player[] = shuffle(allTeams);
    const mapIndex = addIndex(map);

    const finalDeck = compose(
      mergeAll,
      mapIndex((player, index) => ({ [player]: randomizedTeams[index] }))
    )(Object.keys(this.players));

    this.players = { ...this.players, ...finalDeck };
    this.gameStatus = GameStatus.Started;
  }

  removePlayer(id: string) {
    delete this.players[id];
    const numberOfPlayers = Object.keys(this.players).length;

    if (GameStatus.Unstarted || GameStatus.AllowedToStart) {
      this.neededToStart = Math.max(Math.floor(numberOfPlayers / 3 * 2), 4);
    }
  }

  allowForceStart() {
    if (this.gameStatus === GameStatus.Unstarted) {
      this.gameStatus = GameStatus.AllowedToStart;
    }
  }

  disallowForceStart() {
    if (this.gameStatus === GameStatus.AllowedToStart) {
      this.gameStatus = GameStatus.Unstarted;
    }
  }
}

export class BeginnerGame extends Room<State, string> {
  maxPlayers = 17;
  minPlayers = 6;

  onInit() {
    console.log("BeginnerGame Created");

    this.setState(new State());
  }

  onJoin(client: Client) {}

  onLeave(client: Client) {}

  onMessage(client: Client, data) {
    if (
      this.state.gameStatus === GameStatus.Unstarted ||
      this.state.gameStatus === GameStatus.AllowedToStart
    ) {
      this.listenForStartUpMessages(client, data);
    }
  }

  listenForStartUpMessages(client: Client, data) {
    const numberOfPlayers = Object.keys(this.state.players).length;

    if (data.type === "JOIN" && numberOfPlayers < this.maxPlayers) {
      this.state.createPlayer(client.id);

      if (numberOfPlayers + 1 >= this.minPlayers) {
        this.state.allowForceStart();
      }
    }

    if (data.type === "LEAVE") {
      this.state.removePlayer(client.id);

      if (
        numberOfPlayers - 1 < this.minPlayers &&
        this.state.gameStatus === GameStatus.AllowedToStart
      ) {
        this.state.disallowForceStart();
        console.log("Problem");
      }
    }

    if (data.type === "FORCE_START") {
      const player = this.state.players[client.id];

      if (player && this.state.gameStatus === GameStatus.AllowedToStart) {
        this.state.players[client.id] = {
          wantsToStart: true,
          type: "prospect"
        };

        if (
          Object.values(this.state.players).filter(
            player => player.type === "prospect" && player.wantsToStart
          ).length >= this.state.neededToStart
        ) {
          this.state.startGame();
        }
      }
    }

    if (data.type === "UNFORCE_START") {
      const player = this.state.players[client.id];

      if (player && this.state.gameStatus === GameStatus.AllowedToStart) {
        this.state.players[client.id] = {
          wantsToStart: false,
          type: "prospect"
        };
      }
    }
  }

  onDispose() {
    console.log("Dispoing BeginnerGame");
  }
}
