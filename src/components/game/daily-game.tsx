"use client";

import { Eye, Share2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { recordDailyCompletionAction, validateDailyGuessAction } from "@/app/(site)/daily/actions";
import { ConfettiCelebration } from "@/components/game/confetti-celebration";
import { MemeGameCanvas } from "@/components/game/meme-game-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MAX_REVEAL_LEVEL, type MemeEffect } from "@/lib/canvas/meme-effects";
import { addDailyGuess, createDailyGameState, DAILY_STORAGE_VERSION, type DailyGameState, getDailyScore, revealMoreDaily } from "@/lib/game/daily-game";
import { getMediaUrl } from "@/lib/media/url";
import { ROUTES } from "@/routes";

interface DailyGameProps {
    dateKey: string;
    effect: MemeEffect;
    imageStorageKey: string;
    initialStatistics: DailyStatistics;
    seed: number;
}

interface DailyStatistics {
    averageAttempts: number;
    participantCount: number;
}

interface StoredDailyGame {
    answer?: string;
    game: DailyGameState;
}

const storageKey = (dateKey: string) => `devine-le-meme:daily:v${ DAILY_STORAGE_VERSION }:${ dateKey }`;

const getStoredGame = (dateKey: string): StoredDailyGame => {
    const newGame = { game: createDailyGameState() };

    if (typeof window === "undefined") {
        return newGame;
    }

    try {
        const savedGame = window.localStorage.getItem(storageKey(dateKey));

        if (!savedGame) {
            return newGame;
        }

        const parsedGame = JSON.parse(savedGame) as StoredDailyGame;

        return parsedGame.game?.status && Array.isArray(parsedGame.game.guesses) ? parsedGame : newGame;
    } catch {
        window.localStorage.removeItem(storageKey(dateKey));
        return newGame;
    }
};

export const DailyGame = ({ dateKey, effect, imageStorageKey, initialStatistics, seed }: DailyGameProps) => {
    const format = useFormatter();
    const router = useRouter();
    const t = useTranslations("DailyGame");
    const [ storedGame, setStoredGame ] = useState<StoredDailyGame>(() => getStoredGame(dateKey));
    const [ guess, setGuess ] = useState("");
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ statistics, setStatistics ] = useState<DailyStatistics>(initialStatistics);
    const inputReference = useRef<HTMLInputElement>(null);
    const shouldFocusInput = useRef(true);
    const completionReported = useRef(false);
    const isClient = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false,
    );
    const complete = storedGame.game.status === "correct";
    const completeReference = useRef(complete);
    const [ showCelebration, setShowCelebration ] = useState(false);

    useEffect(() => {
        window.localStorage.setItem(storageKey(dateKey), JSON.stringify(storedGame));
    }, [ dateKey, storedGame ]);

    useEffect(() => {
        if (isClient && !isSubmitting && !complete && shouldFocusInput.current) {
            shouldFocusInput.current = false;
            inputReference.current?.focus();
        }
    }, [ complete, isClient, isSubmitting ]);

    useEffect(() => {
        if (complete && !completeReference.current) {
            const frame = window.requestAnimationFrame(() => {
                completeReference.current = complete;
                setShowCelebration(true);
            });

            return () => window.cancelAnimationFrame(frame);
        }

        completeReference.current = complete;
    }, [ complete ]);

    useEffect(() => {
        if (!complete || completionReported.current) {
            return;
        }

        completionReported.current = true;
        void recordDailyCompletionAction({ dateKey, game: storedGame.game }).then(result => {
            if (result.dateChanged) {
                router.refresh();
                return;
            }

            if ("statistics" in result) {
                setStatistics(result.statistics);
            }

            if (result.recorded) {
                router.refresh();
            }
        }).catch(() => {
            completionReported.current = false;
        });
    }, [ complete, dateKey, router, storedGame.game ]);

    const shakeInput = () => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        inputReference.current?.animate(
            [
                { transform: "translateX(0)" },
                { transform: "translateX(-6px)" },
                { transform: "translateX(6px)" },
                { transform: "translateX(0)" },
            ],
            { duration: 280, easing: "ease-in-out" },
        );
    };

    const submitGuess = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!guess.trim() || isSubmitting || complete) {
            return;
        }

        setIsSubmitting(true);
        const result = await validateDailyGuessAction({ dateKey, guess });

        if (result.dateChanged || !result.available) {
            setIsSubmitting(false);
            router.refresh();
            return;
        }

        shouldFocusInput.current = !result.correct;
        setIsSubmitting(false);

        setStoredGame(current => ({
            answer: result.correct ? result.answer : current.answer,
            game: addDailyGuess(current.game, guess.trim(), result.correct),
        }));
        setGuess("");
        shakeInput();
    };

    const share = async () => {
        if (navigator.share) {
            await navigator.share({ title: t("shareTitle"), url: window.location.href });
            return;
        }

        await navigator.clipboard.writeText(window.location.href);
    };

    if (!isClient) {
        return <section className="mx-auto px-5 sm:px-8 py-8 sm:py-12 w-full max-w-5xl"><p className="text-muted-foreground">{t("loadingGame")}</p></section>;
    }

    if (complete) {
        const score = getDailyScore(storedGame.game.guesses.length);

        return (
            <section className="mx-auto px-5 sm:px-8 py-8 sm:py-12 w-full max-w-2xl text-center">
                <ConfettiCelebration active={ showCelebration } />
                <p className="font-mono font-bold text-primary text-2xl uppercase tracking-wider">{t("complete.eyebrow")}</p>
                <div className="bg-card mt-5 p-6 sm:p-8 border rounded-2xl">
                    <p className="font-bold text-5xl tracking-tighter">{format.number(score)}</p>
                    <p className="mt-2 text-muted-foreground text-sm">{t("complete.score")}</p>
                    <p className="mt-7 font-semibold text-xl">{storedGame.answer ?? t("complete.answerUnavailable")}</p>
                    <p className="mt-2 text-muted-foreground text-sm">{t("complete.attempts", { count: storedGame.game.guesses.length })}</p>
                </div>
                <p className="mt-5 text-muted-foreground text-sm">{t("complete.statistics", { attempts: format.number(statistics.averageAttempts, { maximumFractionDigits: 1 }), participants: statistics.participantCount })}</p>
                <div className="flex sm:flex-row flex-col justify-center gap-3 mt-6">
                    <Button className="min-h-11" onClick={ share }><Share2 />{t("complete.share")}</Button>
                    <Link className="inline-flex justify-center items-center bg-secondary hover:bg-secondary/80 px-4 rounded-md min-h-11 font-medium text-sm" href={ ROUTES.home }>{t("complete.backHome")}</Link>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto px-5 sm:px-8 py-4 sm:py-6 w-full max-w-160">
            <div className="flex justify-between items-center gap-4 mb-4">
                <div>
                    <p className="flex flex-wrap items-center gap-x-2 font-mono font-bold text-primary text-xs uppercase tracking-wider"><span>{t("eyebrow")}</span><span aria-hidden="true">·</span><span className="text-muted-foreground normal-case tracking-normal">{format.dateTime(new Date(`${ dateKey }T12:00:00`), { dateStyle: "full" })}</span></p>
                    <h1 className="mt-1 font-bold text-2xl tracking-tight">{t("title")}</h1>
                </div>
                <Button aria-label={ t("shareAriaLabel") } onClick={ share } size="icon" variant="outline"><Share2 /></Button>
            </div>
            <div className="mx-auto max-w-150">
                <MemeGameCanvas effect={ effect } imagePath={ getMediaUrl(imageStorageKey) } revealLevel={ storedGame.game.revealLevel } seed={ seed } />
                <div className="gap-3 grid grid-cols-2 bg-muted/40 mt-4 p-4 border rounded-xl">
                    <div>
                        <p className="font-semibold text-lg tabular-nums">{format.number(statistics.participantCount)}</p>
                        <p className="text-muted-foreground text-sm">{t("participants", { count: statistics.participantCount })}</p>
                    </div>
                    <div className="border-l pl-3">
                        <p className="font-semibold text-lg tabular-nums">{statistics.participantCount > 0 ? format.number(statistics.averageAttempts, { maximumFractionDigits: 1 }) : "—"}</p>
                        <p className="text-muted-foreground text-sm">{t("averageAttempts")}</p>
                    </div>
                </div>
                <div className="flex sm:flex-row flex-col justify-between gap-3 mt-4 text-sm">
                    <p className="text-muted-foreground">{t("effect")} : <span className="font-medium text-foreground">{t(`effects.${ effect }`)}</span></p>
                    <p className="text-muted-foreground">{t("attempt")} : <span className="font-medium text-foreground">{storedGame.game.guesses.length}</span></p>
                </div>
                <form className="mt-4" onSubmit={ event => void submitGuess(event) }>
                    <label className="sr-only" htmlFor="daily-guess">{t("guessLabel")}</label>
                    <div className="flex sm:flex-row flex-col gap-3">
                        <input className="flex-1 bg-background px-3 border border-input focus:border-primary rounded-lg outline-none focus:ring-2 focus:ring-primary/30 min-h-11" disabled={ isSubmitting } id="daily-guess" onChange={ event => setGuess(event.target.value) } placeholder={ t("guessPlaceholder") } ref={ inputReference } value={ guess } />
                        <Button className="sm:min-w-28 min-h-11" disabled={ isSubmitting || !guess.trim() } type="submit">{t("submit")}</Button>
                    </div>
                </form>
                {storedGame.game.revealLevel < MAX_REVEAL_LEVEL && <Button className="mt-3 w-full min-h-11" onClick={ () => setStoredGame(current => ({ ...current, game: revealMoreDaily(current.game) })) } variant="outline"><Eye />{t("revealMore")}</Button>}
                {storedGame.game.guesses.length > 0 && <div className="mt-5 pt-5 border-t"><div aria-label={ t("historyAriaLabel") } className="flex flex-wrap gap-2">{storedGame.game.guesses.map((item, index) => <Badge key={ `${ item }-${ index }` } variant="destructive">{item}</Badge>)}</div></div>}
            </div>
        </section>
    );
};
