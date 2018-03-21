import * as path from "path";
import * as serveIndex from "serve-index";

import { GameRoom } from "./game";
import * as express from "express";
import { createServer } from "http";
import { Server } from "colyseus";

const port = Number(process.env["PORT"] || 7001);
const app = express();

const httpServer = createServer(app);

const gameServer = new Server({ server: httpServer });

gameServer.register("beginner", GameRoom);
gameServer.listen(port);

app.use(express.static(path.join(__dirname, "../../client", "build")));
app.use("/", serveIndex(path.join(__dirname, "../../client"), { icons: true }));

console.log(`Listening on http://localhost:${port}`);
