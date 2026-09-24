import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useAuth, useUser, SignInButton } from "@clerk/react";
import { Toaster } from "sonner";
import { api, setAuthTokenGetter } from "./shared/lib/api";

import { Header } from "./shared/components/Header";
import HomePage from "./modules/home/pages/HomePage";
import DashboardPage from "./modules/polls/pages/DashboardPage";
import CreatePollPage from "./modules/polls/pages/CreatePollPage";
import PublicPollPage from "./modules/polls/pages/PublicPollPage";
import AnalyticsPage from "./modules/analytics/pages/AnalyticsPage";
import NotFoundPage from "./modules/home/pages/NotFoundPage";
import { useTheme } from "./shared/hooks/useTheme";

function AuthSync() {
    const { isSignedIn, isLoaded } = useUser();
    const { getToken } = useAuth();

    useEffect(() => {
        setAuthTokenGetter(getToken);

        return () => {
            setAuthTokenGetter(null);
        };
    }, [getToken]);

    useEffect(() => {
        async function syncUser() {
            if (isSignedIn && isLoaded) {
                try {
                    await api.get("/api/auth/me");
                } catch (error) {
                    console.error("Failed to sync user", error);
                }
            }
        }
        syncUser();
    }, [isSignedIn, isLoaded, getToken]);

    return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Loading...
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-2xl font-semibold">
                    Authentication Required
                </h2>
                <p className="text-muted-foreground text-center max-w-md">
                    You need to be signed in to access this page.
                </p>
                <SignInButton mode="modal">
                    <button className="bg-primary text-primary-foreground h-10 px-4 py-2 rounded-md font-medium hover:bg-primary/90">
                        Sign In to Continue
                    </button>
                </SignInButton>
            </div>
        );
    }

    return <>{children}</>;
}

export default function App() {
    const { theme } = useTheme();

    return (
        <BrowserRouter>
            <AuthSync />
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <Header />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<HomePage />} />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/polls/new"
                            element={
                                <ProtectedRoute>
                                    <CreatePollPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/polls/:pollId/analytics"
                            element={
                                <ProtectedRoute>
                                    <AnalyticsPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Public Routes */}
                        <Route
                            path="/polls/:pollId"
                            element={<PublicPollPage />}
                        />
                        <Route path="/not-found" element={<NotFoundPage />} />
                        <Route
                            path="*"
                            element={<Navigate to="/not-found" replace />}
                        />
                    </Routes>
                </main>
                <Toaster position="top-right" theme={theme} />
            </div>
        </BrowserRouter>
    );
}
