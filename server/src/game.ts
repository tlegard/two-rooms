import {
  UnstartedMessageData,
  AllowedToStartMessageData,
  ActiveMessageData,
  TransitioningMessageData,
  EndingMessageData,
  MessageTypes
} from "../../types/messages";
import { Playset } from "../../types/playset";
import {
  ActiveGame,
  AllowedToStartGame,
  EndingGame,
  Game,
  GameStatus,
  InitializingGame,
  TransitioningGame,
  UnstartedGame
} from "../..//types/game";

import {
  addProspectToGame,
  removeProspectFromGame,
  updatePropsect,
  assignRoomToProspects,
  assignCharacterToProspects
} from "./helpers/prospect";
import { TIME_TO_INITIALIZE } from "./constants/rounds";
import {
  getRoundDuration,
  getNumberOfRounds,
  getRoundHostages
} from "./helpers/rounds";
import { usurp, relinquish } from "./helpers/usurp";
import { capture, release, abdicate, swapHostages } from "./helpers/leader";

import { Room, Client } from "colyseus";

type GameOptions = {
  playset: Playset;
};

type GameRoomState = {
  game: Game;
};

const getNextRound = (game: TransitioningGame): ActiveGame => {
  const duration = getRoundDuration(game.currentRound + 1, game);

  // Swap those hostages!
  const players = game.players.map(player => {
    player.room = game.roomOne.hostages.includes(player.id)
      ? 1
      : game.roomTwo.hostages.includes(player.id) ? 2 : player.room;
    return player;
  });

  return {
    gameStatus: GameStatus.Active,
    duration: duration,
    timeElapsed: 0,
    players: players,
    playset: game.playset,
    currentRound: game.currentRound + 1,
    totalRounds: getNumberOfRounds(game),
    hostagesNeeded: getRoundHostages(game.currentRound + 1, game),
    roomOne: {
      hostages: [],
      leader: game.roomOne.leader,
      usurpVotes: {}
    },
    roomTwo: {
      hostages: [],
      leader: game.roomTwo.leader,
      usurpVotes: {}
    }
  };
};

const getInitialActiveGame = (game: InitializingGame): ActiveGame => {
  const duration = getRoundDuration(1, game);

  return {
    gameStatus: GameStatus.Active,
    roomOne: {
      hostages: [],
      leader: "",
      usurpVotes: {}
    },
    roomTwo: {
      hostages: [],
      usurpVotes: {},
      leader: ""
    },
    hostagesNeeded: getRoundHostages(1, game),
    duration: duration,
    timeElapsed: 0,
    currentRound: 1,
    totalRounds: getNumberOfRounds(game),
    players: game.players,
    playset: game.playset
  };
};

const getEndingGame = (game: ActiveGame): EndingGame => {
  return {
    playset: game.playset,
    players: game.players,
    currentRound: 0,
    gameStatus: GameStatus.Ending
  };
};

const getTransitioningGame = (game: ActiveGame): TransitioningGame => {
  return {
    gameStatus: GameStatus.Transitioning,
    playset: game.playset,
    currentRound: game.currentRound,
    players: game.players,
    hostagesNeeded: getRoundHostages(game.currentRound, game),
    totalRounds: getNumberOfRounds(game),
    roomOne: {
      hostages: game.roomOne.hostages,
      leader: game.roomOne.leader!,
      exchanged: false
    },
    roomTwo: {
      hostages: game.roomTwo.hostages,
      leader: game.roomTwo.leader!,
      exchanged: false
    }
  };
};

export class GameRoom extends Room<GameRoomState> {
  initialGame: UnstartedGame;

  onInit(options: GameOptions) {
    this.initialGame = {
      playset: options.playset,
      neededToStart: 0,
      prospects: [],
      gameStatus: GameStatus.Unstarted
    };

    this.setState({
      game: this.initialGame
    });
  }

  public transitionToAfter<
    NewState extends ActiveGame | TransitioningGame | EndingGame,
    OldGame extends ActiveGame | InitializingGame
  >(
    oldStatus: GameStatus.Initializing | GameStatus.Active,
    getNewState: (oldState: OldGame) => NewState,
    after: number,
    callback?: (newState: NewState) => void
  ): void {
    this.clock.start();
    const timeout = setTimeout(() => {
      let game = this.state.game;

      if (game.gameStatus === oldStatus) {
        const theGame = game as OldGame;
        const duration = theGame.duration;

        const newGame = getNewState(theGame);

        this.state = { game: newGame };

        if (callback) {
          callback(newGame);
        }
      }
    }, after);
  }

  onUnstartedMessage(
    client: Client,
    data: UnstartedMessageData,
    game: UnstartedGame | AllowedToStartGame
  ): UnstartedGame | AllowedToStartGame {
    console.log(data.type);
    switch (data.type) {
      case MessageTypes.Join:
        if (game.prospects.length < game.playset.maxPlayers) {
          game = addProspectToGame(client.id, data.name, game);
        }
        break;
      case MessageTypes.Leave:
        game = removeProspectFromGame(client.id, game);
        break;
    }

    const { prospects } = game;

    game = { ...game, neededToStart: Math.floor(2 / 3 * prospects.length) };
    if (prospects.length < game.playset.minPlayers) {
      return { ...game, gameStatus: GameStatus.Unstarted };
    }

    return assignCharacterToProspects(
      assignRoomToProspects({ ...game, gameStatus: GameStatus.AllowedToStart })
    );
  }

  onAllowedToStartMessage(
    client: Client,
    data: AllowedToStartMessageData,
    game: AllowedToStartGame
  ): AllowedToStartGame | UnstartedGame | InitializingGame {
    switch (data.type) {
      case MessageTypes.Join:
      case MessageTypes.Leave:
        return this.onUnstartedMessage(
          client,
          data as UnstartedMessageData,
          game
        );
      case MessageTypes.ForceStart:
        game = updatePropsect(client.id, { wantsToStart: true }, game);
        break;
      case MessageTypes.UnforceStart:
        game = updatePropsect(client.id, { wantsToStart: false }, game);
        break;
    }

    if (
      game.prospects.filter(player => player.wantsToStart).length >=
      game.neededToStart
    ) {
      this.transitionToAfter(
        GameStatus.Initializing,
        getInitialActiveGame,
        TIME_TO_INITIALIZE,
        newGame => {
          this.transitionToAfter(
            GameStatus.Active,
            getTransitioningGame,
            newGame.duration
          );
        }
      );

      return {
        gameStatus: GameStatus.Initializing,
        currentRound: 0,
        players: game.prospects,
        duration: TIME_TO_INITIALIZE,
        timeElapsed: 0,
        playset: game.playset
      };
    }

    return game;
  }

  onActiveMessage(
    client: Client,
    data: ActiveMessageData,
    game: ActiveGame
  ): ActiveGame | UnstartedGame {
    const player = game.players.find(player => player.id === client.id);
    if (player) {
      const room = player.room === 1 ? "roomOne" : "roomTwo";

      if (player.id === game[room].leader) {
        // Leaders can capture and release hostages
        switch (data.type) {
          case MessageTypes.Capture:
            game = capture(room, data.player, game);
            break;
          case MessageTypes.Release:
            game = release(room, data.player, game);
            break;
          case MessageTypes.End:
            return this.initialGame;
          case MessageTypes.Abdicate:
            game = abdicate(room, data.player, game);
            break;
        }
      } else {
        // Non leaders can vote to usurp.
        switch (data.type) {
          case MessageTypes.Usurp:
            game = usurp(room, client.id, data.player, game);
            console.log(game);
            console.log(data.player);
            break;
          case MessageTypes.Relinquish:
            game = relinquish(room, client.id, game);
            break;
        }
      }
    }

    return game;
  }

  onTransitioningMessage(
    client: Client,
    data: TransitioningMessageData,
    game: TransitioningGame
  ): TransitioningGame | ActiveGame | UnstartedGame {
    const player = game.players.find(player => player.id === client.id);
    if (player) {
      const room = player.room === 1 ? "roomOne" : "roomTwo";

      if (player.id === game[room].leader) {
        // Leaders can still capture, release and exchange their hostages
        switch (data.type) {
          case MessageTypes.Capture:
            console.log("Caputing");
            game = capture(room, data.player, game);
            break;
          case MessageTypes.Release:
            game = release(room, data.player, game);
            break;
          case MessageTypes.Exchange:
            game = { ...game, [room]: { ...game[room], exchanged: true } };

            const numHostages = getRoundHostages(game.currentRound, game);

            if (
              game.roomOne.exchanged &&
              game.roomOne.hostages.length === numHostages &&
              game.roomTwo.exchanged &&
              game.roomTwo.hostages.length === numHostages
            ) {
              console.log(game.players);
              const swapped = swapHostages(game);
              console.log(swapped.players);
              const activeGame = getNextRound(swapped);

              if (game.currentRound < getNumberOfRounds(game)) {
                this.transitionToAfter(
                  GameStatus.Active,
                  getTransitioningGame,
                  activeGame.duration
                );
              } else {
                this.transitionToAfter(
                  GameStatus.Active,
                  getEndingGame,
                  activeGame.duration
                );
              }

              return activeGame;
            }
            break;
          case MessageTypes.End:
            return this.initialGame;
        }
      }
    }

    return game;
  }

  onEndingMessage(
    client: Client,
    data: EndingMessageData,
    game: EndingGame
  ): EndingGame | UnstartedGame {
    switch (data.type) {
      case MessageTypes.End:
        return this.initialGame;
      case MessageTypes.GamblerBet:
        game = { ...game, gamblerVote: data.vote };
        break;
    }
    return game;
  }

  onMessage(client: Client, data: any) {
    const game = this.state.game;

    if (game.gameStatus === GameStatus.Unstarted) {
      this.state.game = this.onUnstartedMessage(
        client,
        data,
        game as UnstartedGame
      );
    }

    if (game.gameStatus === GameStatus.AllowedToStart) {
      this.state.game = this.onAllowedToStartMessage(
        client,
        data,
        game as AllowedToStartGame
      );
    }

    if (game.gameStatus === GameStatus.Initializing) {
      // Not really doing anything while initializing;
    }

    if (game.gameStatus === GameStatus.Active) {
      this.state.game = this.onActiveMessage(client, data, game as ActiveGame);
    }

    if (game.gameStatus === GameStatus.Transitioning) {
      this.state.game = this.onTransitioningMessage(
        client,
        data,
        game as TransitioningGame
      );
    }

    if (game.gameStatus === GameStatus.Ending) {
      this.state.game = this.onEndingMessage(client, data, game as EndingGame);
    }
  }
}
