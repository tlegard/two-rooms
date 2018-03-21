"use strict";
exports.__esModule = true;
var express = require("express");
var morgan = require("morgan");
var game_1 = require("./game");
var http_1 = require("http");
var colyseus_1 = require("colyseus");
var app = express();
app.use(morgan("dev"));
var port = Number(process.env["PORT"] || 8000);
var httpServer = http_1.createServer(app);
var gameServer = new colyseus_1.Server({ server: httpServer });
gameServer.register("beginner", game_1.GameRoom);
//app.use(express.static(path.join(__dirname, "../build")));
//app.use("/", serveIndex(path.join(__dirname, "../../client"), { icons: true }));
gameServer.listen(port);
console.log("Listening on http://localhost:" + port);
//# sourceMappingURL=index.js.map