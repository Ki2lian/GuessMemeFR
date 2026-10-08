"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

import { MemeGameCanvas } from "@/components/game/meme-game-canvas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MAX_REVEAL_LEVEL, type MemeEffect } from "@/lib/canvas/meme-effects";
import { getMediaUrl } from "@/lib/media/url";

interface DailyChallengePreviewProps {
    effect: MemeEffect;
    imageStorageKey: string;
    seed: number;
    title: string;
}

export const DailyChallengePreview = ({ effect, imageStorageKey, seed, title }: DailyChallengePreviewProps) => {
    const t = useTranslations("Admin.daily");
    const [ revealLevel, setRevealLevel ] = useState(0);
    const imagePath = getMediaUrl(imageStorageKey);

    return (
        <Dialog>
            <DialogTrigger aria-label={ t("previewOpen", { title }) } className="relative border rounded-lg size-20 overflow-hidden focus-visible:outline-2 focus-visible:outline-ring outline-offset-2" render={ <button type="button" /> }>
                <Image alt="" className="object-cover" fill sizes="80px" src={ imagePath } unoptimized />
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{t("previewTitle", { title })}</DialogTitle>
                    <DialogDescription>{t("previewDescription")}</DialogDescription>
                </DialogHeader>
                <div className="gap-5 grid">
                    <MemeGameCanvas effect={ effect } imagePath={ imagePath } revealLevel={ revealLevel } seed={ seed } />
                    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 text-sm">
                        <p>{t("revealEffect")} : <span className="font-medium">{t(`effect${ effect.split("-").map(part => part.slice(0, 1).toUpperCase() + part.slice(1)).join("") }`)}</span></p>
                        <p>{t("seed")} : <code>{seed}</code></p>
                    </div>
                    <label className="gap-2 grid font-medium text-sm">
                        {t("previewRevealLevel", { maxRevealLevel: MAX_REVEAL_LEVEL, revealLevel })}
                        <input aria-label={ t("previewRevealLevel", { maxRevealLevel: MAX_REVEAL_LEVEL, revealLevel }) } className="w-full accent-primary" max={ MAX_REVEAL_LEVEL } min="0" onChange={ event => setRevealLevel(Number(event.target.value)) } type="range" value={ revealLevel } />
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: MAX_REVEAL_LEVEL + 1 }, (_, level) => <Button key={ level } onClick={ () => setRevealLevel(level) } size="sm" type="button" variant={ revealLevel === level ? "default" : "outline" }>{t("previewStep", { level })}</Button>)}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
