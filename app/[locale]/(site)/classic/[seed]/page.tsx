import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ClassicGame } from "@/components/game/classic-game";
import { classicSeedRepository } from "@/data/ClassicSeedRepository";

export const metadata: Metadata = {
    robots: { follow: false, index: false },
};

interface ClassicSeedPageProps {
    params: Promise<{ seed: string }>;
}

export default async function ClassicSeedPage({ params }: ClassicSeedPageProps) {
    const { seed: seedValue } = await params;
    const seed = Number(seedValue);

    if (!Number.isInteger(seed) || seed < 0 || seed > 4_294_967_295 || String(seed) !== seedValue) {
        notFound();
    }
    const rounds = await classicSeedRepository.getOrCreate(seed);

    if (!rounds) {
        const t = await getTranslations("ClassicGame");

        return <section className="mx-auto px-5 sm:px-8 py-12 w-full max-w-2xl text-center"><h1 className="font-bold text-2xl">{t("catalogUnavailableTitle")}</h1><p className="mt-3 text-muted-foreground">{t("catalogUnavailableDescription")}</p></section>;
    }

    return <ClassicGame rounds={ rounds } seed={ seed } />;
}
