import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { DailyGame } from "@/components/game/daily-game";
import { dailyChallengeRepository, effectFromDatabase } from "@/data/DailyChallengeRepository";
import { dailyGameRepository } from "@/data/DailyGameRepository";
import { getParisDateKey } from "@/lib/date/paris";

export const metadata: Metadata = {
    alternates: { canonical: "/daily" },
    description: "Reconnais le mème du jour avant que l'image ne se révèle.",
    title: "Défi du jour",
};

export default async function DailyPage() {
    const dailyChallenge = await dailyChallengeRepository.getOrCreatePublishedForDate(getParisDateKey());

    if (!dailyChallenge) {
        const t = await getTranslations("DailyGame");

        return <section className="mx-auto px-5 sm:px-8 py-12 w-full max-w-2xl text-center"><h1 className="font-bold text-2xl">{t("catalogUnavailableTitle")}</h1><p className="mt-3 text-muted-foreground">{t("catalogUnavailableDescription")}</p></section>;
    }

    const initialStatistics = await dailyGameRepository.getCompletionStatistics(dailyChallenge.id);

    return <DailyGame dateKey={ getParisDateKey(dailyChallenge.date) } effect={ effectFromDatabase[dailyChallenge.effect] } imageStorageKey={ dailyChallenge.imageStorageKey } initialStatistics={ initialStatistics } seed={ Number(dailyChallenge.seed) } />;
}
