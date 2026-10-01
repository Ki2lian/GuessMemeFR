"use client";

import { useEffect, useRef, useState } from "react";

import { CANVAS_HEIGHT, CANVAS_WIDTH, drawMemePreview, type MemeEffect } from "@/lib/canvas/meme-effects";

interface MemePreviewCanvasProps {
    effect: MemeEffect;
    revealLevel: number;
    seed: number;
}

const previewImagePaths = [
    "/images/disaster-girl.jpg",
    "/images/rickroll.png",
    "/images/roll-safe.jpg",
    "/images/side-eyeing-chloe.jpg",
];

const previewImagePath = typeof window === "undefined" ? previewImagePaths[0] : getRandomPreviewImagePath();

export const MemePreviewCanvas = ({ effect, revealLevel, seed }: MemePreviewCanvasProps) => {
    const canvasReference = useRef<HTMLCanvasElement>(null);
    const [ image, setImage ] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const previewImage = new Image();

        previewImage.addEventListener("load", () => setImage(previewImage));
        previewImage.src = previewImagePath;
    }, []);

    useEffect(() => {
        if (!canvasReference.current || !image) {
            return;
        }

        drawMemePreview({
            canvas: canvasReference.current,
            effect,
            image,
            revealLevel,
            seed,
        });
    }, [ effect, image, revealLevel, seed ]);

    return (
        <canvas
            aria-label={ `Aperçu de l'effet ${ effect } au niveau de révélation ${ revealLevel } sur 6` }
            className="bg-muted rounded-2xl w-full aspect-4/3"
            height={ CANVAS_HEIGHT }
            ref={ canvasReference }
            width={ CANVAS_WIDTH }
        />
    );
};

function getRandomPreviewImagePath() {
    const randomValue = new Uint32Array(1);

    crypto.getRandomValues(randomValue);
    return previewImagePaths[randomValue[0] % previewImagePaths.length];
}
