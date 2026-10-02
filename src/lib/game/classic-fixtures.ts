import { EFFECTS, type MemeEffect } from "@/lib/canvas/meme-effects";

export interface MemeFixture {
    answer: string;
    imagePath: string;
    title: string;
}

export const CLASSIC_FIXTURES: readonly MemeFixture[] = [
    { answer: "disaster girl", imagePath: "/images/disaster-girl.jpg", title: "Disaster Girl" },
    { answer: "rickroll", imagePath: "/images/rickroll.png", title: "Rickroll" },
    { answer: "roll safe", imagePath: "/images/roll-safe.jpg", title: "Roll Safe" },
    { answer: "side eyeing chloe", imagePath: "/images/side-eyeing-chloe.jpg", title: "Side Eyeing Chloe" },
];

export interface ClassicRoundDefinition {
    effect: MemeEffect;
    fixture: MemeFixture;
    seed: number;
}

export const createClassicRounds = (seed: number, total = 10): ClassicRoundDefinition[] => {
    const random = createSeededRandom(seed);

    return Array.from({ length: total }, () => ({
        effect: EFFECTS[Math.floor(random() * EFFECTS.length)],
        fixture: CLASSIC_FIXTURES[Math.floor(random() * CLASSIC_FIXTURES.length)],
        seed: Math.floor(random() * 4_294_967_296),
    }));
};

export const createSeededRandom = (seed: number) => {
    let value = seed >>> 0;

    return () => {
        value = (value * 1_664_525 + 1_013_904_223) >>> 0;
        return value / 4_294_967_296;
    };
};
