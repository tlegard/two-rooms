import { Playset } from "../../../types/playset";

const BeginnerPlayset: Playset = {
  characters: [
    {
      team: "red",
      role: "bomber",
      zIndex: 100
    },
    {
      team: "blue",
      role: "president",
      zIndex: 100
    },
    {
      team: "grey",
      role: "gambler",
      numberNeeded: "odd",
      zIndex: 100
    }
  ],
  fillWithMembers: true,
  minPlayers: 6,
  maxPlayers: 17
};

export default BeginnerPlayset;
