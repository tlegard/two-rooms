import { AllCharacters } from "./characters";

export interface Playset {
  characters: AllCharacters[];
  minPlayers: number;
  maxPlayers: number;
  fillWithMembers: boolean;
}
