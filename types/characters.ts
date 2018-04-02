export type GenericRoles = "member" | "coy boy" | "negotiator" | "spy";

export type RedRoles = "bomber" | "engineer" | GenericRoles;
export type BlueRoles = "president" | "doctor" | GenericRoles;
export type GreyRoles = "gambler";

export interface Character {
  numberNeeded?: "even" | "odd" | number;
  zIndex: number;
}

export interface RedCharacter extends Character {
  team: "red";
  role: RedRoles;
}

export interface BlueCharacter extends Character {
  team: "blue";
  role: BlueRoles;
}

export interface GreyCharacter extends Character {
  team: "grey";
  role: GreyRoles;
}

export type AllCharacters = RedCharacter | BlueCharacter | GreyCharacter;
