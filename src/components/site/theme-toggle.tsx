"use client";

import { cn } from "cn";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Skeleton } from "@/components/ui/skeleton";

const themeOrder = [ "system", "light", "dark" ] as const;

export const ThemeToggle = ({ className }: { className?: string }) => {
    const t = useTranslations("ThemeToggle");
    const { setTheme, theme } = useTheme();
    const mounted = useSyncExternalStore(subscribeToNothing, getClientSnapshot, getServerSnapshot);
    const currentTheme = theme === "dark" || theme === "light" || theme === "system" ? theme : "system";
    const nextTheme = themeOrder[(themeOrder.indexOf(currentTheme) + 1) % themeOrder.length];

    const cycleTheme = () => {
        setTheme(nextTheme);
    };

    if (!mounted) {
        return <Skeleton aria-hidden="true" className={ cn("block rounded-full min-w-11 min-h-11", className) } />;
    }

    return (
        <button
            aria-label={ t("changeTo", { theme: t(`themes.${ nextTheme }`) }) }
            className={ cn("place-items-center grid border border-border hover:border-primary rounded-full min-w-11 min-h-11 hover:text-primary transition-colors", className) }
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
