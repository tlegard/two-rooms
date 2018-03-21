"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
exports.usurp = function (roomName, usurpee, vote, game) {
    var room = game[roomName];
    game = __assign({}, game, (_a = {}, _a[roomName] = __assign({}, room, { usurpVotes: (_b = {},
            _b[usurpee] = vote,
            _b) }), _a));
    var playersInRoom = game.players.filter(function (player) { return player.room === (roomName === "roomOne" ? 1 : 2); });
    var winner = playersInRoom.reduce(function (winner, player) {
        var numberOfVotes = Object.values(room.usurpVotes).filter(function (vote) { return vote === player.name; }).length;
        if (numberOfVotes > winner.votes) {
            return {
                winner: player.name,
                votes: numberOfVotes
            };
        }
        else {
            return winner;
        }
    }, { winner: "", votes: -1 }).winner;
    if (winner !== room.leader) {
        game = __assign({}, game, (_c = {}, _c[roomName] = __assign({}, room, { leader: winner }), _c));
    }
    return game;
    var _a, _b, _c;
};
exports.relinquish = function (room, player, game) {
    return __assign({}, game, (_a = {}, _a[room] = __assign({}, game[room], { usurpVotes: (_b = {},
            _b[player] = "",
            _b) }), _a));
    var _a, _b;
};
//# sourceMappingURL=usurp.js.map