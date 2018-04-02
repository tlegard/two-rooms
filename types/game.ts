import { Player, ProspectivePlayer } from "./player";
import { Playset } from "./playset";
import { ActiveBoomRoom, TradingBoomRoom } from "./boom-room";
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
  totalRounds: number;
  roomOne: ActiveBoomRoom;
  roomTwo: ActiveBoomRoom;
  hostagesNeeded: number;
}

export interface TransitioningGame extends StartedGame {
  gameStatus: GameStatus.Transitioning;
  roomOne: TradingBoomRoom;
  totalRounds: number;
  roomTwo: TradingBoomRoom;
  hostagesNeeded: number;
}

export interface EndingGame extends StartedGame {
  gameStatus: GameStatus.Ending;
  gamblerVote?: "red" | "blue";
  presidentCured?: boolean;
  bombFixed?: boolean;
}
