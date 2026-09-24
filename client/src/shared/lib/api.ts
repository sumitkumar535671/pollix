import axios from "axios";

type TokenGetter = () => Promise<string | null>;

let authTokenGetter: TokenGetter | null = null;

export function setAuthTokenGetter(getter: TokenGetter | null) {
    authTokenGetter = getter;
}

export const api = axios.create({
    baseURL:
        import.meta.env.VITE_SERVER_URL ||
        "https://pollnode-backend.sameerbhagtani.dev",
    withCredentials: true,
});

api.interceptors.request.use(async (config) => {
    if (!authTokenGetter) {
        return config;
    }

    try {
        const token = await authTokenGetter();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("Failed to fetch Clerk token", error);
    }

    return config;
});

export function getApiErrorMessage(
    error: unknown,
    fallback = "Something went wrong",
) {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        if (typeof message === "string" && message.trim()) {
            return message;
        }

        if (typeof error.message === "string" && error.message.trim()) {
            return error.message;
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
}
