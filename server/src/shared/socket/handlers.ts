import type { Server } from "socket.io";

export default function registerSocketHandlers(io: Server) {
    io.on("connection", (socket) => {
        console.log(`new socket connected: ${socket.id}`);

        socket.on("poll:join", (pollId: string) => {
            socket.join(`poll:${pollId}`);
        });

        socket.on("disconnect", () => {
            console.log(`socket disconnected: ${socket.id}`);
        });
    });
}
