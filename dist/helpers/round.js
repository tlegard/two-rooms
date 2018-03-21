"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MINUTE = 60 * 1000;
exports.getRoundDuration = function (round, game) {
    var numberOfPlayers = game.players.length;
    var currentRound = game.currentRound;
    if (numberOfPlayers <= 10 && currentRound <= 3) {
        return 1 * MINUTE;
    }
    else if (numberOfPlayers <= 13) {
        return currentRound <= 3 ? 2 * MINUTE : 1 * MINUTE;
    }
    else if (numberOfPlayers <= 17) {
        return currentRound === 1
            ? 3 * MINUTE
            : currentRound <= 3 ? 2 * MINUTE : 1 * MINUTE;
    }
    else if (numberOfPlayers <= 21) {
        return currentRound === 1
            ? 4 * MINUTE
            : currentRound === 2
                ? 3 * MINUTE
                : currentRound === 3 ? 2 * MINUTE : 1 * MINUTE;
    }
    else {
        return 5 - (currentRound - 1);
    }
};
exports.getNumberOfRounds = function (game) {
    return game.players.length > 10 ? 5 : 3;
};
//# sourceMappingURL=round.js.map