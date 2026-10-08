"use client";

import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { MemeGameCanvas } from "@/components/game/meme-game-canvas";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAX_REVEAL_LEVEL, type MemeEffect } from "@/lib/canvas/meme-effects";

const effects: Array<MemeEffect> = [ "zoomed-in", "pixelated", "scrambled", "distorted", "hidden" ];

const createSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];

export const MemeEffectsPreview = ({ imagePath }: { imagePath: string }) => {
    const t = useTranslations("Admin.memes");
    const [ effect, setEffect ] = useState<MemeEffect>("pixelated");
    const [ revealLevel, setRevealLevel ] = useState(0);
    const [ seed, setSeed ] = useState(0);

    return (
        <div className="gap-5 grid">
            <MemeGameCanvas effect={ effect } imagePath={ imagePath } revealLevel={ revealLevel } seed={ seed } />
            <div className="gap-4 grid sm:grid-cols-2">
                <label className="gap-2 grid font-medium text-sm">
                    {t("effect")}
                    <Select onValueChange={ value => setEffect(value as MemeEffect) } value={ effect }>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {effects.map(item => (
                                <SelectItem key={ item } value={ item }>
                                    {t(
                                        `effect${ item
                                            .split("-")
                                            .map(part => part.slice(0, 1).toUpperCase() + part.slice(1))
                                            .join("") }`,
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>
                <div className="gap-2 grid">
                    <span className="font-medium text-sm">{t("seed")}</span>
                    <Button className="w-full" onClick={ () => setSeed(createSeed()) } type="button" variant="outline">
                        <RefreshCw />
                        {t("regenerateSeed")}
                    </Button>
                </div>
            </div>
            <label className="gap-2 grid font-medium text-sm">
                {t("revealLevel", { maxRevealLevel: MAX_REVEAL_LEVEL, revealLevel })}
                <input
                    aria-label={ t("revealLevel", { maxRevealLevel: MAX_REVEAL_LEVEL, revealLevel }) }
                    className="w-full accent-primary"
                    max={ MAX_REVEAL_LEVEL }
                    min="0"
                    onChange={ event => setRevealLevel(Number(event.target.value)) }
                    type="range"
                    value={ revealLevel }
                />
            </label>
        </div>
    );
};
