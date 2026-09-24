import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/react";

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "https://pollnode-backend.sameerbhagtani.dev";

interface UseSocketOptions {
    pollId?: string;
    enabled?: boolean;
}

export function useSocket({ pollId, enabled = true }: UseSocketOptions) {
    const { isSignedIn, getToken } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!enabled || !pollId) {
            socketRef.current?.removeAllListeners();
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }

        let active = true;
        let createdSocket: Socket | null = null;

        const connect = async () => {
            const token = isSignedIn ? await getToken() : null;

            if (!active) {
                return;
            }

            createdSocket = io(SERVER_URL, {
                transports: ["websocket", "polling"],
                auth: token ? { token } : undefined,
            });

            createdSocket.on("connect", () => {
                createdSocket?.emit("poll:join", pollId);
                setSocket(createdSocket);
            });

            createdSocket.on("disconnect", () => {
                setSocket((currentSocket) =>
                    currentSocket?.id === createdSocket?.id
                        ? null
                        : currentSocket,
                );
            });

            socketRef.current?.removeAllListeners();
            socketRef.current?.disconnect();
            socketRef.current = createdSocket;
        };

        connect().catch((error) => {
            console.error("Failed to initialize socket", error);
        });

        return () => {
            active = false;
            createdSocket?.removeAllListeners();
            createdSocket?.disconnect();

            if (socketRef.current?.id === createdSocket?.id) {
                socketRef.current = null;
            }
        };
    }, [enabled, pollId, isSignedIn, getToken]);

    return socket;
}
