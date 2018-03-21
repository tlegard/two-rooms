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
var rounds_1 = require("./rounds");
function capture(room, hostage, game) {
    return __assign({}, game, (_a = {}, _a[room] = __assign({}, game[room], { hostages: game[room].hostages.length < rounds_1.getRoundHostages(game.currentRound, game)
            ? game[room].hostages.concat([hostage])
            : game[room].hostages }), _a));
    var _a;
}
exports.capture = capture;
function release(room, hostage, game) {
    return __assign({}, game, (_a = {}, _a[room] = __assign({}, game[room], { hostages: game[room].hostages.filter(function (capturee) { return capturee !== hostage; }) }), _a));
    var _a;
}
exports.release = release;
