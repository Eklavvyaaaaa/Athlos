import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";

let wss;

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadcast(payload) {
    if (!wss) return;
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
        }
    }
}

export function attachWebSocketServer(server) {
    wss = new WebSocketServer({
        server,
        path: "/ws",
        maxPayload: 1024 * 1024,
    });

    wss.on("connection", async (socket, req) => {
        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req);

                if (decision.isDenied()) {
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit()
                        ? "Rate limit exceeded"
                        : "Access denied";
                    socket.close(code, reason);
                    return;
                }
            } catch (e) {
                console.error("WS connection error", e);
                socket.close(1011, "Server security error");
                return;
            }
        }

        console.log("WS client connected");

        socket.on("close", () => {
            console.log("WS client disconnected");
        });

        socket.on("message", (message) => {
            console.log("WS message received", message);
        });
    });

    return {
        broadcast,
        sendJson,
    };
}
