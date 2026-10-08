"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";

export const ConfettiCelebration = ({ active }: { active: boolean }) => {
    const [ viewport, setViewport ] = useState({ height: 0, width: 0 });
    const [ reducedMotion, setReducedMotion ] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updateViewport = () => {
            setReducedMotion(mediaQuery.matches);
            setViewport({ height: window.innerHeight, width: window.innerWidth });
        };

        updateViewport();
        mediaQuery.addEventListener("change", updateViewport);
        window.addEventListener("resize", updateViewport);

        return () => {
            mediaQuery.removeEventListener("change", updateViewport);
            window.removeEventListener("resize", updateViewport);
        };
    }, []);

    if (!active || reducedMotion || viewport.width === 0) {
        return null;
    }

    return <Confetti aria-hidden="true" className="pointer-events-none fixed inset-0 z-50" gravity={ 0.16 } height={ viewport.height } numberOfPieces={ 240 } recycle={ false } tweenDuration={ 3500 } width={ viewport.width } />;
};
