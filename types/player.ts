import {
  BlueCharacter,
  GreyCharacter,
  RedCharacter,
  AllCharacters
} from "./characters";
import { Conditions } from "./conditions";

export interface Player {
  character: AllCharacters;
  id: string;
  name: string;
  room: 1 | 2;
  conditions: Conditions[];
}

export interface ProspectivePlayer extends Player {
  wantsToStart: boolean;
}

export interface RedPlayer extends Player, RedCharacter {}

export interface BluePlayer extends Player, BlueCharacter {}

export interface GreyPlayer extends Player, GreyCharacter {}

export type AllPlayers = RedPlayer | BluePlayer | GreyPlayer;
