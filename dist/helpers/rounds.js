"use strict";
exports.__esModule = true;
var MINUTE = 60 * 1000;
exports.getRoundDuration = function (round, game) {
    return game.players.length <= 10
        ? (3 - round + 1) * MINUTE
        : (5 - round + 1) * MINUTE;
};
exports.getRoundHostages = function (round, game) {
    var numberOfPlayers = game.players.length;
    var currentRound = game.currentRound;
    if (numberOfPlayers <= 10 && currentRound <= 3) {
        return 1;
    }
    else if (numberOfPlayers <= 13) {
        return currentRound <= 3 ? 2 : 1;
    }
    else if (numberOfPlayers <= 17) {
        return currentRound === 1 ? 3 : currentRound <= 3 ? 2 : 1;
    }
    else if (numberOfPlayers <= 21) {
        return currentRound === 1
            ? 4
            : currentRound === 2 ? 3 : currentRound === 3 ? 2 : 1;
    }
    else {
        return 5 - (currentRound - 1);
    }
};
exports.getNumberOfRounds = function (game) {
    return game.players.length > 10 ? 5 : 3;
};
//# sourceMappingURL=rounds.js.map