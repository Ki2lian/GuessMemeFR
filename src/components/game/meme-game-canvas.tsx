"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { CANVAS_HEIGHT, CANVAS_WIDTH, drawMemePreview, type MemeEffect } from "@/lib/canvas/meme-effects";

interface MemeGameCanvasProps {
    effect: MemeEffect;
    imagePath: string;
    revealLevel: number;
    seed: number;
}

export const MemeGameCanvas = ({ effect, imagePath, revealLevel, seed }: MemeGameCanvasProps) => {
    const t = useTranslations("ClassicGame.canvas");
    const canvasReference = useRef<HTMLCanvasElement>(null);
    const [ image, setImage ] = useState<HTMLImageElement | null>(null);
    const [ imageUnavailable, setImageUnavailable ] = useState(false);

    useEffect(() => {
        const gameImage = new Image();

        gameImage.addEventListener("error", () => setImageUnavailable(true));
        gameImage.addEventListener("load", () => setImage(gameImage));
        gameImage.src = imagePath;
    }, [ imagePath ]);

    useEffect(() => {
        if (!canvasReference.current || !image) {
            return;
        }

        if (!canvasReference.current.getContext("2d")) {
            return;
        }

        drawMemePreview({ canvas: canvasReference.current, effect, image, revealLevel, seed });
    }, [ effect, image, revealLevel, seed ]);

    if (imageUnavailable) {
        return <p className="place-items-center grid bg-muted rounded-2xl aspect-4/3 text-muted-foreground text-sm text-center">{t("unavailable")}</p>;
    }

    return (
        <div className="relative">
            <canvas
                aria-label={ t("ariaLabel") }
                className="bg-muted rounded-2xl w-full aspect-4/3"
                height={ CANVAS_HEIGHT }
                ref={ canvasReference }
                width={ CANVAS_WIDTH }
            />
            {!image && <p className="absolute inset-0 place-items-center grid bg-muted/85 rounded-2xl text-muted-foreground text-sm">{t("loading")}</p>}
        </div>
    );
};
