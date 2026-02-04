import { WebSocket, WebSocketServer } from "ws";

let wss;

function sendJson (socket, payload) {
    if(socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadcast (payload){
    if (!wss) return;
    for(const client of wss.clients) {
        if(client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
        }
    }
}

export function attachWebSocketServer(server) {
    wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024
    });

    wss.on('connection', (socket) => {
        sendJson(socket, {type: 'welcome'});
        socket.on('error', console.error);
    });
}

export function broadcastMatchCreated(match) {
    broadcast({type: 'match_created', data: match});
}
