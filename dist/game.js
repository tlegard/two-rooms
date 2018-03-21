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
exports.__esModule = true;
var messages_1 = require("./types/messages");
var game_1 = require("./types/game");
var prospect_1 = require("./helpers/prospect");
var rounds_1 = require("./constants/rounds");
var rounds_2 = require("./helpers/rounds");
var usurp_1 = require("./helpers/usurp");
var leader_1 = require("./helpers/leader");
var colyseus_1 = require("colyseus");
var getNextRound = function (game) {
    var duration = rounds_2.getRoundDuration(game.currentRound, game);
    // Swap those hostages!
    var players = game.players.map(function (player) {
        player.room = game.roomOne.hostages.includes(player.name)
            ? 1
            : game.roomTwo.hostages.includes(player.name) ? 2 : player.room;
        return player;
    });
    return {
        gameStatus: game_1.GameStatus.Active,
        duration: duration,
        timeElapsed: 0,
        players: players,
        playset: game.playset,
        currentRound: game.currentRound + 1,
        roomOne: {
            hostages: [],
            leader: game.roomOne.leader,
            usurpVotes: {}
        },
        roomTwo: {
            hostages: [],
            leader: game.roomTwo.leader,
            usurpVotes: {}
        }
    };
};
var getInitialActiveGame = function (game) {
    var duration = rounds_2.getRoundDuration(1, game);
    return {
        gameStatus: game_1.GameStatus.Active,
        roomOne: {
            hostages: [],
            leader: "",
            usurpVotes: {}
        },
        roomTwo: {
            hostages: [],
            usurpVotes: {},
            leader: ""
        },
        duration: duration,
        timeElapsed: 0,
        currentRound: 1,
        players: game.players,
        playset: game.playset
    };
};
var getEndingGame = function (game) {
    return {
        playset: game.playset,
        gameStatus: game_1.GameStatus.Ending
    };
};
var getTransitioningGame = function (game) {
    return {
        gameStatus: game_1.GameStatus.Transitioning,
        playset: game.playset,
        currentRound: game.currentRound,
        players: game.players,
        roomOne: {
            hostages: game.roomOne.hostages,
            leader: game.roomOne.leader,
            exchanged: false
        },
        roomTwo: {
            hostages: game.roomTwo.hostages,
            leader: game.roomTwo.leader,
            exchanged: false
        }
    };
};
var GameRoom = /** @class */ (function (_super) {
    __extends(GameRoom, _super);
    function GameRoom() {
        return _super.call(this) || this;
    }
    GameRoom.prototype.onInit = function (options) {
        this.initialGame = {
            playset: options.playset,
            neededToStart: 0,
            prospects: [],
            gameStatus: game_1.GameStatus.Unstarted
        };
        this.setState({
            game: this.initialGame
        });
        console.log("Inited");
    };
    GameRoom.prototype.transitionToAfter = function (oldStatus, getNewState, after, callback) {
        var _this = this;
        this.clock.start();
        this.clock.setInterval(function () {
            var game = _this.state.game;
            var elapsedTime = _this.clock.elapsedTime;
            if (game.gameStatus === oldStatus) {
                var theGame = game;
                var duration = theGame.duration;
                if (elapsedTime > duration) {
                    var newGame = getNewState(theGame);
                    _this.setState({ game: newGame });
                    _this.clock.stop();
                    _this.clock.clear();
                    if (callback) {
                        callback(newGame);
                    }
                }
            }
            else {
                _this.clock.stop();
                _this.clock.clear();
            }
        }, after);
    };
    GameRoom.prototype.requestJoin = function () {
        console.log("Client requested to join");
        return true;
    };
    GameRoom.prototype.onUnstartedMessage = function (client, data, game) {
        switch (data.type) {
            case messages_1.MessageTypes.Join:
                if (game.prospects.length < game.playset.maxPlayers) {
                    game = prospect_1.addProspectToGame(client.id, game);
                }
                break;
            case messages_1.MessageTypes.Leave:
                game = prospect_1.removeProspectFromGame(client.id, game);
                break;
        }
        var prospects = game.prospects;
        game = __assign({}, game, { neededToStart: Math.floor(2 / 3 * prospects.length) });
        if (prospects.length < game.playset.minPlayers) {
            return __assign({}, game, { gameStatus: game_1.GameStatus.Unstarted });
        }
        return prospect_1.assignCharacterToProspects(prospect_1.assignRoomToProspects(__assign({}, game, { gameStatus: game_1.GameStatus.AllowedToStart })));
    };
    GameRoom.prototype.onAllowedToStartMessage = function (client, data, game) {
        var _this = this;
        switch (data.type) {
            case messages_1.MessageTypes.Join:
            case messages_1.MessageTypes.Leave:
                return this.onUnstartedMessage(client, data, game);
            case messages_1.MessageTypes.ForceStart:
                game = prospect_1.updatePropsect(client.id, { wantsToStart: true }, game);
            case messages_1.MessageTypes.UnforceStart:
                game = prospect_1.updatePropsect(client.id, { wantsToStart: false }, game);
        }
        if (game.prospects.filter(function (player) { return player.wantsToStart; }).length >
            game.neededToStart) {
            this.transitionToAfter(game_1.GameStatus.Initializing, getInitialActiveGame, rounds_1.TIME_TO_INITIALIZE, function (newGame) {
                _this.transitionToAfter(game_1.GameStatus.Active, getTransitioningGame, newGame.duration);
            });
            return {
                gameStatus: game_1.GameStatus.Initializing,
                currentRound: 0,
                players: game.prospects,
                duration: rounds_1.TIME_TO_INITIALIZE,
                timeElapsed: 0,
                playset: game.playset
            };
        }
        return game;
    };
    GameRoom.prototype.onActiveMessage = function (client, data, game) {
        var player = game.players.find(function (player) { return player.name === client.id; });
        if (player) {
            var room = player.room === 1 ? "roomOne" : "roomTwo";
            if (player.name == game[room].leader) {
                // Leaders can capture and release hostages
                switch (data.type) {
                    case messages_1.MessageTypes.Capture:
                        game = leader_1.capture(room, data.player, game);
                        break;
                    case messages_1.MessageTypes.Release:
                        game = leader_1.release(room, data.player, game);
                        break;
                    case messages_1.MessageTypes.End:
                        return this.initialGame;
                }
            }
            else {
                // Non leaders can vote to usurp.
                switch (data.type) {
                    case messages_1.MessageTypes.Usurp:
                        game = usurp_1.usurp(room, client.id, data.player, game);
                    case messages_1.MessageTypes.Relinquish:
                        game = usurp_1.relinquish(room, client.id, game);
                }
            }
        }
        return game;
    };
    GameRoom.prototype.onTransitioningMessage = function (client, data, game) {
        var player = game.players.find(function (player) { return player.name === client.id; });
        if (player) {
            var room = player.room === 1 ? "roomOne" : "roomTwo";
            if (player.name === game[room].leader) {
                // Leaders can still capture, release and exchange their hostages
                switch (data.type) {
                    case messages_1.MessageTypes.Capture:
                        game = leader_1.capture(room, data.player, game);
                        break;
                    case messages_1.MessageTypes.Release:
                        game = leader_1.release(room, data.player, game);
                        break;
                    case messages_1.MessageTypes.Exchange:
                        game = __assign({}, game, (_a = {}, _a[room] = __assign({}, game[room], { exchanged: true }), _a));
                        var numHostages = rounds_2.getRoundHostages(game.currentRound, game);
                        if (game.roomOne.exchanged &&
                            game.roomOne.hostages.length === numHostages &&
                            game.roomTwo.exchanged &&
                            game.roomTwo.hostages.length === numHostages) {
                            var activeGame = getNextRound(game);
                            if (game.currentRound < rounds_2.getNumberOfRounds(game)) {
                                this.transitionToAfter(game_1.GameStatus.Active, getTransitioningGame, activeGame.duration);
                            }
                            else {
                                this.transitionToAfter(game_1.GameStatus.Active, getEndingGame, activeGame.duration);
                            }
                            return activeGame;
                        }
                        break;
                    case messages_1.MessageTypes.End:
                        return this.initialGame;
                }
            }
        }
        return game;
        var _a;
    };
    GameRoom.prototype.onEndingMessage = function (client, data, game) {
        switch (data.type) {
            case messages_1.MessageTypes.End:
                return this.initialGame;
            case messages_1.MessageTypes.GamblerBet:
                game = __assign({}, game, { gamblerVote: data.vote });
                break;
        }
        return game;
    };
    GameRoom.prototype.onMessage = function (client, data) {
        var game = this.state.game;
        if (game.gameStatus === game_1.GameStatus.Unstarted) {
            this.setState({
                game: this.onUnstartedMessage(client, data, game)
            });
        }
        if (game.gameStatus === game_1.GameStatus.AllowedToStart) {
            this.setState({
                game: this.onAllowedToStartMessage(client, data, game)
            });
        }
        if (game.gameStatus === game_1.GameStatus.Initializing) {
            // Not really doing anything while initializing;
        }
        if (game.gameStatus === game_1.GameStatus.Active) {
            this.setState({
                game: this.onActiveMessage(client, data, game)
            });
        }
        if (game.gameStatus === game_1.GameStatus.Transitioning) {
            this.setState({
                game: this.onTransitioningMessage(client, data, game)
            });
        }
        if (game.gameStatus === game_1.GameStatus.Ending) {
            this.setState({
                game: this.onEndingMessage(client, data, game)
            });
        }
    };
    return GameRoom;
}(colyseus_1.Room));
exports.GameRoom = GameRoom;
//# sourceMappingURL=game.js.map