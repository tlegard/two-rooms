import { ActiveGame } from "../types/game";

export const usurp = (
  roomName: "roomOne" | "roomTwo",
  usurpee: string,
  vote: string,
  game: ActiveGame
): ActiveGame => {
  const room = game[roomName];

  game = {
    ...game,
    [roomName]: {
      ...room,
      usurpVotes: {
        [usurpee]: vote
      }
    }
  } as ActiveGame;

  const playersInRoom = game.players.filter(
    player => player.room === (roomName === "roomOne" ? 1 : 2)
  );

  const { winner } = playersInRoom.reduce(
    (winner, player) => {
      const numberOfVotes = Object.values(room.usurpVotes).filter(
        vote => vote === player.name
      ).length;

      if (numberOfVotes > winner.votes) {
        return {
          winner: player.name,
          votes: numberOfVotes
        };
      } else {
        return winner;
      }
    },
    { winner: "", votes: -1 }
  );

  if (winner !== room.leader) {
    game = {
      ...game,
      [roomName]: {
        ...room,
        leader: winner
      }
    };
  }

  return game;
};

export const relinquish = (
  room: "roomOne" | "roomTwo",
  player: string,
  game: ActiveGame
): ActiveGame => {
  return {
    ...game,
    [room]: {
      ...game[room],
      usurpVotes: {
        [player]: ""
      }
    }
  };
};
