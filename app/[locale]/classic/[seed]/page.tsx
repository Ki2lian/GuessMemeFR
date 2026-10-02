import { notFound } from "next/navigation";

import { ClassicGame } from "@/components/game/classic-game";

interface ClassicSeedPageProps {
    params: Promise<{ seed: string }>;
}

export default async function ClassicSeedPage({ params }: ClassicSeedPageProps) {
    const { seed: seedValue } = await params;
    const seed = Number(seedValue);

    if (!Number.isInteger(seed) || seed < 0 || seed > 4_294_967_295 || String(seed) !== seedValue) {
        notFound();
    }

    return <ClassicGame seed={ seed } />;
}
