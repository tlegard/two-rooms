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
var utils_1 = require("./utils");
exports.enoughPlayers = function (character, numberOfPlayers) {
    var _a = character.numberNeeded, numberNeeded = _a === void 0 ? 0 : _a;
    return ((numberNeeded === "even" && numberOfPlayers % 2 === 0) ||
        (numberNeeded === "odd" && numberOfPlayers % 2 === 1) ||
        numberNeeded <= numberOfPlayers);
};
exports.addProspectToGame = function (prospect, game) {
    return __assign({}, game, { prospects: game.prospects.concat([
            {
                name: prospect,
                wantsToStart: false,
                character: {
                    team: "blue",
                    role: "president"
                },
                room: 1,
                conditions: []
            }
        ]) });
};
exports.removeProspectFromGame = function (prospect, game) {
    return __assign({}, game, { prospects: game.prospects.filter(function (player) { return player.name !== prospect; }) });
};
exports.updatePropsect = function (prospect, props, game) {
    return __assign({}, game, { prospects: game.prospects.map(function (player) { return (player.name === prospect ? __assign({}, player, props) : player); }) });
};
exports.assignCharacterToProspects = function (game) {
    var numberOfProspects = game.prospects.length;
    var getTeamCharacters = function (team) {
        return game.playset.characters.filter(function (character) {
            return character.team === team && exports.enoughPlayers(character, numberOfProspects);
        });
    };
    var redCards = getTeamCharacters("red");
    var blueCards = getTeamCharacters("blue");
    var greyCards = getTeamCharacters("grey");
    var deck = redCards.concat(blueCards, greyCards);
    if (game.playset.fillWithMembers) {
        var half = Math.floor((numberOfProspects - deck.length) / 2);
        deck = deck.concat(utils_1.times(function () { return ({
            team: "blue",
            role: "member"
        }); }, half), utils_1.times(function () { return ({
            team: "red",
            role: "member"
        }); }, half));
    }
    deck = utils_1.shuffle(deck);
    return __assign({}, game, { prospects: game.prospects.map(function (prospect, index) {
            var character = deck[index];
            prospect.character = character;
            return prospect;
        }) });
};
exports.assignRoomToProspects = function (game) {
    var half = Math.floor(game.prospects.length / 2);
    var rooms = utils_1.times(function () { return 1; }, half).concat(utils_1.times(function () { return 2; }, half), (half * 2 < game.prospects.length ? [1] : []));
    var shuffledRooms = utils_1.shuffle(rooms);
    return __assign({}, game, { prospects: game.prospects.map(function (propsect, index) {
            propsect.room = shuffledRooms[index];
            return propsect;
        }) });
};
