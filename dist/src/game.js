"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var colyseus_1 = require("colyseus");
var ramda_1 = require("ramda");
var shuffle = require("shuffle-array");
var GameMode;
(function (GameMode) {
    GameMode[GameMode["Beginner"] = 0] = "Beginner";
    GameMode[GameMode["Intermediate"] = 1] = "Intermediate";
})(GameMode || (GameMode = {}));
var GAME_MODE = GameMode.Beginner;
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["Unstarted"] = 0] = "Unstarted";
    GameStatus[GameStatus["AllowedToStart"] = 1] = "AllowedToStart";
    GameStatus[GameStatus["Started"] = 2] = "Started";
})(GameStatus = exports.GameStatus || (exports.GameStatus = {}));
var State = /** @class */ (function () {
    function State() {
        this.players = {};
        this.gameStatus = GameStatus.Unstarted;
        this.neededToStart = GAME_MODE === GameMode.Beginner ? 4 : 6;
        this.round = NaN;
        this.hostagesNeeded = NaN;
        this.timeRemaining = NaN;
        this.gameMode = GAME_MODE;
    }
    State.prototype.createPlayer = function (id) {
        var numberOfPlayers = Object.keys(this.players).length;
        if (GameStatus.Unstarted || GameStatus.AllowedToStart) {
            this.players[id] = { type: "prospect", wantsToStart: false };
            this.neededToStart = Math.max(Math.floor((numberOfPlayers + 1) / 3 * 2), this.neededToStart);
        }
    };
    State.prototype.startIntermidateGame = function () {
        var prospectivePlayers = Object.values(this.players).filter(function (player) { return player.type === "prospect"; });
        var greyTeam = prospectivePlayers.length % 2
            ? [{ team: "grey", type: "player", role: "gambler" }]
            : [];
        var equalTeamNumber = Math.floor((prospectivePlayers.length - greyTeam.length) / 2);
        var staticRedTeam = [
            { team: "red", type: "player", role: "bomber" },
            { team: "red", type: "player", role: "engineer" },
            { team: "red", type: "player", role: "coy boy" },
            { team: "red", type: "player", role: "spy" },
            { team: "red", type: "player", role: "negotiator" }
        ];
        var staticBlueTeam = [
            { team: "blue", type: "player", role: "president" },
            { team: "blue", type: "player", role: "doctor" },
            { team: "blue", type: "player", role: "coy boy" },
            { team: "blue", type: "player", role: "spy" },
            { team: "blue", type: "player", role: "negotiator" }
        ];
        var allTeams = greyTeam.concat(staticBlueTeam, staticRedTeam, [
            ramda_1.times(function () { return ({
                team: "blue",
                type: "player",
                role: "member"
            }); }, equalTeamNumber - staticBlueTeam.length),
            ramda_1.times(function () { return ({
                team: "red",
                type: "player",
                role: "member"
            }); }, equalTeamNumber - staticRedTeam.length)
        ]);
        var randomizedTeams = shuffle(allTeams);
        var mapIndex = ramda_1.addIndex(ramda_1.map);
        var finalDeck = ramda_1.compose(ramda_1.mergeAll, mapIndex(function (player, index) {
            return (_a = {}, _a[player] = randomizedTeams[index], _a);
            var _a;
        }))(Object.keys(this.players));
        this.players = __assign({}, this.players, finalDeck);
        this.gameStatus = GameStatus.Started;
    };
    State.prototype.startGame = function () {
        var prospectivePlayers = Object.values(this.players).filter(function (player) { return player.type === "prospect"; });
        var greyTeam = prospectivePlayers.length % 2
            ? [{ team: "grey", type: "player", role: "gambler" }]
            : [];
        var equalTeamNumber = Math.floor((prospectivePlayers.length - greyTeam.length) / 2);
        var redTeam = [
            { team: "red", type: "player", role: "bomber" }
        ].concat(ramda_1.times(function () { return ({ team: "red", type: "player", role: "member" }); }, equalTeamNumber - 1));
        var blueTeam = [
            { team: "blue", type: "player", role: "president" }
        ].concat(ramda_1.times(function () { return ({
            team: "blue",
            type: "player",
            role: "member"
        }); }, equalTeamNumber - 1));
        var allTeams = greyTeam.concat(blueTeam, redTeam);
        var randomizedTeams = shuffle(allTeams);
        var mapIndex = ramda_1.addIndex(ramda_1.map);
        var finalDeck = ramda_1.compose(ramda_1.mergeAll, mapIndex(function (player, index) {
            return (_a = {}, _a[player] = randomizedTeams[index], _a);
            var _a;
        }))(Object.keys(this.players));
        this.players = __assign({}, this.players, finalDeck);
        this.gameStatus = GameStatus.Started;
    };
    State.prototype.removePlayer = function (id) {
        delete this.players[id];
        var numberOfPlayers = Object.keys(this.players).length;
        if (GameStatus.Unstarted || GameStatus.AllowedToStart) {
            this.neededToStart = Math.max(Math.floor(numberOfPlayers / 3 * 2), GAME_MODE === GameMode.Beginner ? 4 : 6);
        }
    };
    State.prototype.allowForceStart = function () {
        if (this.gameStatus === GameStatus.Unstarted) {
            this.gameStatus = GameStatus.AllowedToStart;
        }
    };
    State.prototype.disallowForceStart = function () {
        if (this.gameStatus === GameStatus.AllowedToStart) {
            this.gameStatus = GameStatus.Unstarted;
        }
    };
    return State;
}());
var BeginnerGame = /** @class */ (function (_super) {
    __extends(BeginnerGame, _super);
    function BeginnerGame() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.maxPlayers = GAME_MODE === GameMode.Beginner ? 17 : 25;
        _this.minPlayers = GAME_MODE === GameMode.Beginner ? 6 : 11;
        return _this;
    }
    BeginnerGame.prototype.onInit = function () {
        console.log("BeginnerGame Created");
        this.setState(new State());
    };
    BeginnerGame.prototype.onJoin = function (client) { };
    BeginnerGame.prototype.onLeave = function (client) { };
    BeginnerGame.prototype.onMessage = function (client, data) {
        if (this.state.gameStatus === GameStatus.Unstarted ||
            this.state.gameStatus === GameStatus.AllowedToStart) {
            this.listenForStartUpMessages(client, data);
        }
        if (this.state.gameStatus === GameStatus.Started) {
            if (data.type === "END") {
                this.state.gameStatus = GameStatus.Unstarted;
                this.state.players = {};
            }
        }
    };
    BeginnerGame.prototype.listenForStartUpMessages = function (client, data) {
        var numberOfPlayers = Object.keys(this.state.players).length;
        if (data.type === "JOIN" && numberOfPlayers < this.maxPlayers) {
            this.state.createPlayer(client.id);
            if (numberOfPlayers + 1 >= this.minPlayers) {
                this.state.allowForceStart();
            }
        }
        if (data.type === "LEAVE") {
            this.state.removePlayer(client.id);
            if (numberOfPlayers - 1 < this.minPlayers &&
                this.state.gameStatus === GameStatus.AllowedToStart) {
                this.state.disallowForceStart();
                console.log("Problem");
            }
        }
        if (data.type === "FORCE_START") {
            var player = this.state.players[client.id];
            if (player && this.state.gameStatus === GameStatus.AllowedToStart) {
                this.state.players[client.id] = {
                    wantsToStart: true,
                    type: "prospect"
                };
                if (Object.values(this.state.players).filter(function (player) { return player.type === "prospect" && player.wantsToStart; }).length >= this.state.neededToStart) {
                    this.state.gameMode === GameMode.Beginner
                        ? this.state.startGame()
                        : this.state.startIntermidateGame();
                }
            }
        }
        if (data.type === "UNFORCE_START") {
            var player = this.state.players[client.id];
            if (player && this.state.gameStatus === GameStatus.AllowedToStart) {
                this.state.players[client.id] = {
                    wantsToStart: false,
                    type: "prospect"
                };
            }
        }
    };
    BeginnerGame.prototype.onDispose = function () {
        console.log("Dispoing BeginnerGame");
    };
    return BeginnerGame;
}(colyseus_1.Room));
exports.BeginnerGame = BeginnerGame;
run: ;
//# sourceMappingURL=game.js.map