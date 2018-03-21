import { Playset } from "../types/playset";

const BeginnerPlayset: Playset = {
  characters: [
    {
      team: "red",
      role: "bomber"
    },
    {
      team: "blue",
      role: "doctor"
    },
    {
      team: "grey",
      role: "gambler",
      numberNeeded: "odd"
    }
  ],
  fillWithMembers: true,
  minPlayers: 6,
  maxPlayers: 17
};

export default BeginnerPlayset;
