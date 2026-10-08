"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

export const DiscordSignInButton = ({ callbackURL = "/profile" }: { callbackURL?: string }) => {
    const t = useTranslations("Account.signIn");
    const [ error, setError ] = useState<string>();
    const [ isLoading, setIsLoading ] = useState(false);

    const signIn = async () => {
        setError(undefined);
        setIsLoading(true);

        const result = await authClient.signIn.social({
            callbackURL,
            errorCallbackURL: "/login",
            provider: "discord",
        });

        if (result.error) {
            setError(t("error"));
            setIsLoading(false);
        }
    };

    return (
        <div className="gap-3 grid">
            <Button disabled={ isLoading } onClick={ signIn } size="lg" type="button">
                {isLoading ? t("loading") : t("action")}
            </Button>
            {error && (
                <p aria-live="polite" className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </div>
    );
};
