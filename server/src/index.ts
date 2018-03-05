import * as express from "express";
import { createServer } from "http";
import { Server } from "colyseus";

const port = Number(process.env["PORT"] || 6000);
const app = express();

const httpServer = createServer(app);

const gameServer = new Server({ server: httpServer });

gameServer.listen(port);

console.log(`Listening on http://localhost:${port}`);
