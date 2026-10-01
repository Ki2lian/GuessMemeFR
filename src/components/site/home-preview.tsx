"use client";

import { EyeOff, Grid2X2, Maximize2, Shuffle, Waves } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { MemePreviewCanvas } from "@/components/game-preview/meme-preview-canvas";
import { MAX_REVEAL_LEVEL, type MemeEffect } from "@/lib/canvas/meme-effects";

const effects: { icon: typeof Maximize2; labelKey: "distorted" | "hidden" | "pixelated" | "scrambled" | "zoomedIn"; value: MemeEffect }[] = [
    { icon: Maximize2, labelKey: "zoomedIn", value: "zoomed-in" },
    { icon: Grid2X2, labelKey: "pixelated", value: "pixelated" },
    { icon: Shuffle, labelKey: "scrambled", value: "scrambled" },
    { icon: Waves, labelKey: "distorted", value: "distorted" },
    { icon: EyeOff, labelKey: "hidden", value: "hidden" },
];

const initialPreviewSeed = typeof window === "undefined" ? 0 : createPreviewSeed();

export const HomePreview = () => {
    const t = useTranslations("Preview");
    const [ activeEffect, setActiveEffect ] = useState<MemeEffect>("pixelated");
    const [ revealLevel, setRevealLevel ] = useState(0);
    const [ previewSeed, setPreviewSeed ] = useState(initialPreviewSeed);

    const selectEffect = (effect: MemeEffect) => {
        if (effect === activeEffect) {
            return;
        }

        setActiveEffect(effect);
        setRevealLevel(0);
        setPreviewSeed(createPreviewSeed());
    };

    return (
        <section aria-label={ t("ariaLabel") } className="flex flex-col gap-4 min-w-0">
            <div className="hidden lg:block bg-card shadow-2xl shadow-black/20 p-4 border border-border rounded-3xl">
                <div className="flex justify-between mb-3 font-mono text-muted-foreground text-xs">
                    <span>{t("round", { round: 3 })}</span>
                    <span>{activeEffect}</span>
                </div>
                <MemePreviewCanvas effect={ activeEffect } revealLevel={ revealLevel } seed={ previewSeed } />
                <label className="block mt-4 font-mono text-muted-foreground text-xs" htmlFor="reveal-level">
                    {t("revealLevel", { maxRevealLevel: MAX_REVEAL_LEVEL, revealLevel })}
                </label>
                <input
                    className="mt-2 w-full h-2 accent-primary cursor-pointer"
                    id="reveal-level"
                    max={ MAX_REVEAL_LEVEL }
                    min="0"
                    onChange={ event => setRevealLevel(Number(event.target.value)) }
                    step="1"
                    type="range"
                    value={ revealLevel }
                />
            </div>
            <div className="flex-1 grid grid-cols-5 bg-card border border-border rounded-xl overflow-hidden">
                {effects.map(({ icon: Icon, labelKey, value }) => (
                    <button
                        aria-pressed={ activeEffect === value }
                        className="flex sm:flex-row flex-col justify-center items-center gap-1 sm:gap-2 aria-pressed:bg-primary hover:bg-muted focus-visible:bg-muted px-1 border-border border-r last:border-r-0 focus-visible:outline-none min-h-14 sm:min-h-16 text-foreground aria-pressed:text-primary-foreground transition-colors"
                        key={ value }
                        onClick={ () => selectEffect(value) }
                        onFocus={ () => selectEffect(value) }
                        onMouseEnter={ () => selectEffect(value) }
                        type="button"
                    >
                        <Icon aria-hidden="true" className="size-4" strokeWidth={ 1.8 } />
                        <span className="font-medium text-[0.65rem] sm:text-xs">{t(`effects.${ labelKey }`)}</span>
                    </button>
                ))}
            </div>
        </section>
    );
};

function createPreviewSeed() {
    const seed = new Uint32Array(1);

    crypto.getRandomValues(seed);
    return seed[0];
}
