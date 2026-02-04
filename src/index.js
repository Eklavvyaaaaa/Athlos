import express from "express";
import { matchRouter } from "./Routes/Matches.js";
import http from "http";
import { attachWebSocketServer, broadcastMatchCreated } from "./ws/server.js";


const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/matches", matchRouter);

attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
    const baseUrl =
        HOST === "0.0.0.0"
            ? `http://localhost:${PORT}`
            : `http://${HOST}:${PORT}`;

    console.log(`Server is running on ${baseUrl}`);
    console.log(`WebSocket is running on ${baseUrl.replace("http", "ws")}/ws`);
});
