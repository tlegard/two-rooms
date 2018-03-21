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
