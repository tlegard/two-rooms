"use strict";
exports.__esModule = true;
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["Unstarted"] = 0] = "Unstarted";
    GameStatus[GameStatus["AllowedToStart"] = 1] = "AllowedToStart";
    GameStatus[GameStatus["Initializing"] = 2] = "Initializing";
    GameStatus[GameStatus["Active"] = 3] = "Active";
    GameStatus[GameStatus["Transitioning"] = 4] = "Transitioning";
    GameStatus[GameStatus["Ending"] = 5] = "Ending";
})(GameStatus = exports.GameStatus || (exports.GameStatus = {}));
//# sourceMappingURL=game.js.map