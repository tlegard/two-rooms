import { ActiveGame, TransitioningGame } from "../../../types/game";
import { getRoundHostages } from "./rounds";

export function capture(
  room: "roomOne" | "roomTwo",
  hostage: string,
  game: ActiveGame
): ActiveGame;
export function capture(
  room: "roomOne" | "roomTwo",
  hostage: string,
  game: TransitioningGame
): TransitioningGame;
export function capture(
  room: "roomOne" | "roomTwo",
  hostage: string,
  game: ActiveGame | TransitioningGame
): ActiveGame | TransitioningGame {
  return {
    ...game,
    [room]: {
      ...game[room],
      hostages:
        game[room].hostages.length < getRoundHostages(game.currentRound, game)
          ? game[room].hostages.concat([hostage])
          : game[room].hostages
    }
  };
}

export function release(
  room: "roomOne" | "roomTwo",
  hostage: string,
  game: ActiveGame
): ActiveGame;
export function release(
  room: "roomOne" | "roomTwo",
  hostage: string,
  game: TransitioningGame
): TransitioningGame;
export function release(
  room: "roomOne" | "roomTwo",
  hostage: string,
  game: ActiveGame | TransitioningGame
): ActiveGame | TransitioningGame {
  return {
    ...game,
    [room]: {
      ...game[room],
      hostages: game[room].hostages.filter(capturee => capturee !== hostage)
    }
  };
}

export const abdicate = (
  room: "roomOne" | "roomTwo",
  player: string,
  game: ActiveGame
): ActiveGame => {
  return {
    ...game,
    [room]: {
      ...game[room],
      usurpVotes: {},
      hostages: [],
      leader: player
    }
  };
};

export const swapHostages = (game: TransitioningGame): TransitioningGame => {
  return {
    ...game,
    players: game.players.map(player => {
      return {
        ...player,
        room: game.roomOne.hostages.includes(player.id)
          ? 2
          : game.roomTwo.hostages.includes(player.id) ? 1 : player.room
      };
    }),
    roomOne: {
      ...game.roomOne,
      hostages: []
    },
    roomTwo: {
      ...game.roomTwo,
      hostages: []
    }
  };
};
