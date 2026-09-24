import { getIO } from "./index.js";

export function emitAnalyticsUpdate(pollId: string, payload: unknown) {
    try {
        const io = getIO();
        io.to(`poll:${pollId}`).emit("poll:analytics:update", payload);
    } catch (err) {}
}

export function emitPollPublished(pollId: string, publishedAt: Date) {
    try {
        const io = getIO();
        io.to(`poll:${pollId}`).emit("poll:publish", {
            pollId,
            publishedAt,
        });
    } catch (err) {}
}
