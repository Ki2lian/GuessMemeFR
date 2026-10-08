import { EFFECTS, type MemeEffect } from "@/lib/canvas/meme-effects";

export interface ClassicMeme {
    answers: string[];
    id: string;
    imageStorageKey: string;
    title: string;
}

export interface ClassicRoundDefinition {
    effect: MemeEffect;
    meme: ClassicMeme;
    seed: number;
}

export const CLASSIC_ROUND_COUNT = 10;

export const createClassicRounds = (seed: number, memes: readonly ClassicMeme[], total = CLASSIC_ROUND_COUNT): ClassicRoundDefinition[] => {
    const random = createSeededRandom(seed);
    const availableMemes = [ ...memes ];

    return Array.from({ length: Math.min(total, availableMemes.length) }, () => {
        const memeIndex = Math.floor(random() * availableMemes.length);
        const meme = availableMemes.splice(memeIndex, 1)[0];

        return {
            effect: EFFECTS[Math.floor(random() * EFFECTS.length)],
            meme,
            seed: Math.floor(random() * 4_294_967_296),
        };
    });
};

export const createSeededRandom = (seed: number) => {
    let value = seed >>> 0;

    return () => {
        value = (value * 1_664_525 + 1_013_904_223) >>> 0;
        return value / 4_294_967_296;
    };
};
