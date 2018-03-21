"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["Unstarted"] = 0] = "Unstarted";
    GameStatus[GameStatus["AllowedToStart"] = 1] = "AllowedToStart";
    GameStatus[GameStatus["Initializing"] = 2] = "Initializing";
    GameStatus[GameStatus["Active"] = 3] = "Active";
    GameStatus[GameStatus["Transitioning"] = 4] = "Transitioning";
    GameStatus[GameStatus["Ending"] = 5] = "Ending";
})(GameStatus = exports.GameStatus || (exports.GameStatus = {}));
