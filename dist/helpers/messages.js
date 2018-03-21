"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("../types/messages");
exports.manageProspects = function (message, game) {
    switch (message.type) {
        case messages_1.MessageTypes.Join:
            if (game.prospects.length < game.playset.maxPlayers) {
                game = addProspectToGame(client.id, game);
            }
            break;
        case messages_1.MessageTypes.Leave:
            game = removeProspectFromGame(client.id, game);
            break;
    }
    var prospects = game.prospects;
    game = __assign({}, game, { neededToStart: Math.floor(2 / 3 * prospects.length) });
    if (prospects.length < game.playset.minPlayers) {
        return __assign({}, game, { gameStatus: GameStatus.Unstarted });
    }
    return __assign({}, game, { gameStatus: GameStatus.AllowedToStart });
    return game;
};
//# sourceMappingURL=messages.js.map