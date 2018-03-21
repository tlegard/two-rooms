import { Player, ProspectivePlayer } from "./player";
import { Playset } from "./playset";

export enum GameStatus {
  Unstarted,
  AllowedToStart,
  Initializing,
  Active,
  Transitioning,
  Ending
}

export interface Game {
  playset: Playset;
  gameStatus: GameStatus;
}

export interface NewGame extends Game {
  gameStatus: GameStatus.Unstarted | GameStatus.AllowedToStart;
  neededToStart: number;
  prospects: ProspectivePlayer[];
}

export interface UnstartedGame extends NewGame {
  gameStatus: GameStatus.Unstarted;
}

export interface AllowedToStartGame extends NewGame {
  gameStatus: GameStatus.AllowedToStart;
}

export interface StartedGame extends Game {
  currentRound: number;
  players: Player[];
}

export interface TimedGame extends StartedGame {
  duration: number;
  timeElapsed: number;
  currentRound: number;
}

export interface InitializingGame extends TimedGame {
  gameStatus: GameStatus.Initializing;
  currentRound: 0;
}

export interface ActiveGame extends TimedGame {
  gameStatus: GameStatus.Active;
  roomOne: {
    leader?: string;
    usurpVotes: {
      [player: string]: string;
    };
    hostages: string[];
  };
  roomTwo: {
    leader?: string;
    usurpVotes: {
      [player: string]: string;
    };
    hostages: string[];
  };
}

export interface TransitioningGame extends StartedGame {
  gameStatus: GameStatus.Transitioning;
  roomOne: {
    hostages: string[];
    exchanged: boolean;
    leader: string;
  };
  roomTwo: {
    hostages: string[];
    exchanged: boolean;
    leader: string;
  };
}

export interface EndingGame extends Game {
  gameStatus: GameStatus.Ending;
  gamblerVote?: "red" | "blue";
  presidentCured?: boolean;
  bombFixed?: boolean;
}
