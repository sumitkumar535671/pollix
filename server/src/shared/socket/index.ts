import { Server as SocketIOServer } from "socket.io";
import { type Server as HttpServer } from "node:http";

import env from "../config/env.js";
import registerSocketHandlers from "./handlers.js";

let io: SocketIOServer | null = null;

export default function createSocketServer(server: HttpServer): SocketIOServer {
    io = new SocketIOServer(server, {
        cors: {
            origin: env.CLIENT_URL,
            credentials: true,
        },
    });

    registerSocketHandlers(io);

    return io;
}

export function getIO(): SocketIOServer {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
}
