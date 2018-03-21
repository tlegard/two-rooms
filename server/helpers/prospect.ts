import { UnstartedGame, AllowedToStartGame } from "../types/game";
import { shuffle, times } from "./utils";
import { ProspectivePlayer } from "../types/player";
import {
  AllCharacters,
  BlueCharacter,
  GreyCharacter,
  RedCharacter
} from "../types/characters";

export const enoughPlayers = (
  character: AllCharacters,
  numberOfPlayers: number
): boolean => {
  const { numberNeeded = 0 } = character;
  return (
    (numberNeeded === "even" && numberOfPlayers % 2 === 0) ||
    (numberNeeded === "odd" && numberOfPlayers % 2 === 1) ||
    numberNeeded <= numberOfPlayers
  );
};

export const addProspectToGame = (
  prospect: string,
  game: UnstartedGame | AllowedToStartGame
): UnstartedGame | AllowedToStartGame => {
  return {
    ...game,
    prospects: game.prospects.concat([
      {
        name: prospect,
        wantsToStart: false,
        character: {
          team: "blue",
          role: "president"
        },
        room: 1,
        conditions: []
      }
    ])
  };
};

export const removeProspectFromGame = (
  prospect: string,
  game: UnstartedGame | AllowedToStartGame
): UnstartedGame | AllowedToStartGame => {
  return {
    ...game,
    prospects: game.prospects.filter(player => player.name !== prospect)
  };
};

export const updatePropsect = (
  prospect: string,
  props: Partial<ProspectivePlayer>,
  game: AllowedToStartGame
): AllowedToStartGame => {
  return {
    ...game,
    prospects: game.prospects.map(
      player => (player.name === prospect ? { ...player, ...props } : player)
    )
  };
};

export const assignCharacterToProspects = (
  game: AllowedToStartGame
): AllowedToStartGame => {
  const numberOfProspects = game.prospects.length;

  const getTeamCharacters = <T extends AllCharacters>(
    team: "red" | "blue" | "grey"
  ): T[] => {
    return game.playset.characters.filter(
      character =>
        character.team === team && enoughPlayers(character, numberOfProspects)
    ) as T[];
  };

  const redCards: RedCharacter[] = getTeamCharacters("red");
  const blueCards: BlueCharacter[] = getTeamCharacters("blue");
  const greyCards: GreyCharacter[] = getTeamCharacters("grey");

  let deck = [...redCards, ...blueCards, ...greyCards];

  if (game.playset.fillWithMembers) {
    const half = Math.floor((numberOfProspects - deck.length) / 2);

    deck = [
      ...deck,
      ...times(
        (): BlueCharacter => ({
          team: "blue",
          role: "member"
        }),
        half
      ),
      ...times(
        (): RedCharacter => ({
          team: "red",
          role: "member"
        }),
        half
      )
    ];
  }

  deck = shuffle(deck);

  return {
    ...game,
    prospects: game.prospects.map((prospect, index) => {
      const character = deck[index];
      prospect.character = character;
      return prospect;
    })
  };
};

export const assignRoomToProspects = (
  game: AllowedToStartGame
): AllowedToStartGame => {
  const half = Math.floor(game.prospects.length / 2);
  const rooms: (1 | 2)[] = [
    ...times<1>(() => 1, half),
    ...times<2>(() => 2, half),
    // Extra player goes in the first room allways
    ...((half * 2 < game.prospects.length ? [1] : []) as 1[])
  ];

  const shuffledRooms = shuffle(rooms);

  return {
    ...game,
    prospects: game.prospects.map((propsect, index) => {
      propsect.room = shuffledRooms[index];
      return propsect;
    })
  };
};
