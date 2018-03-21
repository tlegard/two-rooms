import { StartedGame } from "../../../types/game";

const MINUTE = 60 * 1000;

export const getRoundDuration = (round: number, game: StartedGame): number => {
  return game.players.length <= 10
    ? (3 - round + 1) * MINUTE
    : (5 - round + 1) * MINUTE;
};
export const getRoundHostages = (round: number, game: StartedGame): number => {
  const numberOfPlayers = game.players.length;
  const currentRound = game.currentRound;

  if (numberOfPlayers <= 10 && currentRound <= 3) {
    return 1;
  } else if (numberOfPlayers <= 13) {
    return currentRound <= 3 ? 2 : 1;
  } else if (numberOfPlayers <= 17) {
    return currentRound === 1 ? 3 : currentRound <= 3 ? 2 : 1;
  } else if (numberOfPlayers <= 21) {
    return currentRound === 1
      ? 4
      : currentRound === 2 ? 3 : currentRound === 3 ? 2 : 1;
  } else {
    return 5 - (currentRound - 1);
  }
};

export const getNumberOfRounds = (game: StartedGame): number => {
  return game.players.length > 10 ? 5 : 3;
};
