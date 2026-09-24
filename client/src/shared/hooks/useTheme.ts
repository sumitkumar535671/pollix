import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

function getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem("pollix-theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

    useEffect(() => {
        const handleThemeChange = (event: Event) => {
            const nextTheme = (event as CustomEvent<Theme>).detail;
            setTheme(nextTheme);
        };

        window.addEventListener("pollix-theme-change", handleThemeChange);
        return () => window.removeEventListener("pollix-theme-change", handleThemeChange);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("pollix-theme", theme);
        window.dispatchEvent(new CustomEvent("pollix-theme-change", { detail: theme }));
    }, [theme]);

    return {
        theme,
        toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    };
}