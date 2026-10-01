"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Skeleton } from "@/components/ui/skeleton";

const themeOrder = [ "system", "light", "dark" ] as const;

const themeLabels = {
    dark: "sombre",
    light: "clair",
    system: "système",
} as const;

export const ThemeToggle = () => {
    const { setTheme, theme } = useTheme();
    const mounted = useSyncExternalStore(subscribeToNothing, getClientSnapshot, getServerSnapshot);
    const currentTheme = theme === "dark" || theme === "light" || theme === "system" ? theme : "system";
    const nextTheme = themeOrder[(themeOrder.indexOf(currentTheme) + 1) % themeOrder.length];

    const cycleTheme = () => {
        setTheme(nextTheme);
    };

    if (!mounted) {
        return <Skeleton aria-hidden="true" className="block rounded-full min-w-11 min-h-11" />;
    }

    return (
        <button
            aria-label={ `Passer au thème ${ themeLabels[nextTheme] }` }
            className="place-items-center grid border border-border hover:border-primary rounded-full min-w-11 min-h-11 hover:text-primary transition-colors"
            onClick={ cycleTheme }
            type="button"
        >
            {currentTheme === "dark" && <Moon aria-hidden="true" size={ 18 } />}
            {currentTheme === "light" && <Sun aria-hidden="true" size={ 18 } />}
            {currentTheme === "system" && <SunMoon aria-hidden="true" size={ 18 } />}
        </button>
    );
};

const getClientSnapshot = () => true;

const getServerSnapshot = () => false;

const subscribeToNothing = () => () => undefined;
