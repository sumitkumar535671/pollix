import { Link } from "react-router";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/react";
import { Button } from "./Button";
import { BarChart3, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function Header() {
    const { isSignedIn } = useUser();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/85 backdrop-blur-xl">
            <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 lg:px-8">
                <Link to="/" className="group flex items-center gap-3">
                    <span className="flex h-9 w-9 rotate-[-6deg] items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[4px_4px_0_hsl(var(--foreground))] transition-transform group-hover:rotate-0">
                        <BarChart3 className="h-5 w-5" />
                    </span>
                    <span className="font-serif text-xl font-bold tracking-[-0.04em]">
                        Pollix<span className="text-primary">.</span>
                    </span>
                </Link>

                <nav className="flex items-center gap-2 sm:gap-4">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                    {isSignedIn ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="hidden text-sm font-semibold transition-colors hover:text-primary sm:block"
                            >
                                Dashboard
                            </Link>
                            <UserButton />
                        </>
                    ) : (
                        <>
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm">
                                    Sign In
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button
                                    size="sm"
                                    className="rounded-full bg-primary text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] hover:translate-y-0.5 hover:shadow-none"
                                >
                                    Get Started
                                </Button>
                            </SignUpButton>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
