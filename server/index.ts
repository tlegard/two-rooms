import * as express from "express";
import * as morgan from "morgan";

import { GameRoom } from "./game";
import { createServer } from "http";
import { Server } from "colyseus";

const app = express();
app.use(morgan("dev"));

const port = Number(process.env["PORT"] || 8000);

const httpServer = createServer(app);
const gameServer = new Server({ server: httpServer });

gameServer.register("beginner", GameRoom);

//app.use(express.static(path.join(__dirname, "../build")));
//app.use("/", serveIndex(path.join(__dirname, "../../client"), { icons: true }));

gameServer.listen(port);

console.log(`Listening on http://localhost:${port}`);
