"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BeginnerDeck = {
    characters: [
        "president",
        "bomber",
        {
            character: "gambler",
            minPlayersNeeded: function (number) {
                return !!(number % 2);
            }
        }
    ],
    fillWithMembers: true,
    minPlayers: 6,
    maxPlayers: 17
};
exports.default = BeginnerDeck;
//# sourceMappingURL=beginner.js.map