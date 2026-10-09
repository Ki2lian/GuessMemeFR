"use client";

import { cn } from "cn";
import { Check, ChevronRight, Eye, Share2, SkipForward, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { recordClassicCompletionAction } from "@/app/(site)/classic/actions";
import { ConfettiCelebration } from "@/components/game/confetti-celebration";
import { MemeGameCanvas } from "@/components/game/meme-game-canvas";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { MAX_REVEAL_LEVEL } from "@/lib/canvas/meme-effects";
import {
    CLASSIC_STORAGE_VERSION,
    type ClassicGameState,
    createClassicGameState,
    getClassicAverageAttempts,
    getClassicRoundScore,
    getClassicScore,
    isClassicGameComplete,
    revealClassicRound,
    skipClassicRound,
    submitClassicGuess,
} from "@/lib/game/classic-game";
import { type ClassicRoundDefinition } from "@/lib/game/classic-rounds";
import { normalizeAnswer } from "@/lib/game/normalize-answer";
import { getMediaUrl } from "@/lib/media/url";
import { ROUTES } from "@/routes";

interface ClassicGameProps {
    rounds: ClassicRoundDefinition[];
    seed: number;
}

const storageKey = (seed: number) => `devine-le-meme:classic:v${ CLASSIC_STORAGE_VERSION }:${ seed }`;

const getStoredGame = (seed: number, roundCount: number): ClassicGameState => {
    const newGame = createClassicGameState(roundCount);

    if (typeof window === "undefined") {
        return newGame;
    }

    try {
        const savedGame = window.localStorage.getItem(storageKey(seed));

        if (!savedGame) {
            return newGame;
        }

        const parsedGame = JSON.parse(savedGame) as ClassicGameState;

        return parsedGame.rounds.length === roundCount && parsedGame.roundIndex >= 0 && parsedGame.roundIndex <= roundCount ? parsedGame : newGame;
    } catch {
        window.localStorage.removeItem(storageKey(seed));
        return newGame;
    }
};

const useAnimatedScore = (score: number) => {
    const [ displayedScore, setDisplayedScore ] = useState(score);
    const scoreReference = useRef(score);

    useEffect(() => {
        const initialScore = scoreReference.current;
        let frame = 0;

        if (initialScore === score) {
            return;
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            frame = window.requestAnimationFrame(() => {
                scoreReference.current = score;
                setDisplayedScore(score);
            });

            return () => window.cancelAnimationFrame(frame);
        }

        const duration = 500;
        const startedAt = performance.now();

        const animate = (now: number) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            const easedProgress = 1 - (1 - progress) ** 3;
            const nextScore = Math.round(initialScore + (score - initialScore) * easedProgress);

            scoreReference.current = nextScore;
            setDisplayedScore(nextScore);

            if (progress < 1) {
                frame = window.requestAnimationFrame(animate);
            }
        };

        frame = window.requestAnimationFrame(animate);

        return () => window.cancelAnimationFrame(frame);
    }, [ score ]);

    return displayedScore;
};

export const ClassicGame = ({ rounds, seed }: ClassicGameProps) => {
    const format = useFormatter();
    const router = useRouter();
    const t = useTranslations("ClassicGame");
    const [ game, setGame ] = useState<ClassicGameState>(() => getStoredGame(seed, rounds.length));
    const [ guess, setGuess ] = useState("");
    const [ roundPoints, setRoundPoints ] = useState<number>();
    const [ scoreAnimationTarget, setScoreAnimationTarget ] = useState(() => getClassicScore(game));
    const bonusReference = useRef<HTMLSpanElement>(null);
    const inputReference = useRef<HTMLInputElement>(null);
    const shouldFocusInput = useRef(true);
    const scoreAnimationTimeout = useRef<number>(0);
    const completionReported = useRef(false);
    const isClient = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false,
    );
    const complete = isClassicGameComplete(game);
    const completeReference = useRef(complete);
    const [ showCelebration, setShowCelebration ] = useState(false);
    const round = complete ? undefined : rounds[game.roundIndex];
    const roundState = complete ? undefined : game.rounds[game.roundIndex];
    const score = getClassicScore(game);
    const displayedScore = useAnimatedScore(scoreAnimationTarget);

    useEffect(() => {
        window.localStorage.setItem(storageKey(seed), JSON.stringify(game));
    }, [ game, seed ]);

    useEffect(() => {
        if (complete && !completeReference.current && score > rounds.length * 600 / 2) {
            const frame = window.requestAnimationFrame(() => {
                completeReference.current = complete;
                setShowCelebration(true);
            });

            return () => window.cancelAnimationFrame(frame);
        }

        completeReference.current = complete;
    }, [ complete, rounds.length, score ]);

    useEffect(() => {
        if (roundPoints) {
            bonusReference.current?.animate(
                [
                    { opacity: 0, transform: "translateY(8px)" },
                    { opacity: 1, transform: "translateY(0)" },
                    { opacity: 1, transform: "translateY(-8px)" },
                ],
                { duration: 700, easing: "ease-out" },
            );
        }
    }, [ roundPoints ]);

    useEffect(() => () => window.clearTimeout(scoreAnimationTimeout.current), []);

    useEffect(() => {
        const currentRound = game.rounds[game.roundIndex];

        if (!isClient || complete || !currentRound || currentRound.status !== "active" || !shouldFocusInput.current) {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            shouldFocusInput.current = false;
            inputReference.current?.focus();
        });

        return () => window.cancelAnimationFrame(frame);
    }, [ complete, game.roundIndex, game.rounds, isClient ]);

    useEffect(() => {
        if (!complete || completionReported.current) {
            return;
        }

        completionReported.current = true;
        void recordClassicCompletionAction({ game, seed }).then(recorded => {
            if (recorded) {
                router.refresh();
            }
        }).catch(() => {
            completionReported.current = false;
        });
    }, [ complete, game, router, seed ]);

    const updateRound = (update: (currentRound: ClassicGameState["rounds"][number]) => ClassicGameState["rounds"][number]) => {
        setGame(currentGame => {
            if (isClassicGameComplete(currentGame)) {
                return currentGame;
            }

            const currentRound = currentGame.rounds[currentGame.roundIndex];
            const nextRounds = currentGame.rounds.map((item, index) => index === currentGame.roundIndex ? update(currentRound) : item);

            return { ...currentGame, rounds: nextRounds };
        });
    };

    const submitGuess = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!round || !guess.trim()) {
            return;
        }

        if (round.meme.answers.some(answer => normalizeAnswer(guess) === normalizeAnswer(answer))) {
            const gainedPoints = (6 - roundState!.guesses.length) * 100;

            setRoundPoints(gainedPoints);
            window.clearTimeout(scoreAnimationTimeout.current);
            scoreAnimationTimeout.current = window.setTimeout(() => {
                setRoundPoints(undefined);
                setScoreAnimationTarget(score + gainedPoints);
            }, 700);
        }

        updateRound(currentRound => submitClassicGuess(currentRound, guess, round.meme.answers));
        shakeInput();
        setGuess("");
    };

    const nextRound = () => {
        shouldFocusInput.current = true;
        setGame(currentGame => ({ ...currentGame, roundIndex: Math.min(currentGame.roundIndex + 1, currentGame.rounds.length) }));
        setRoundPoints(undefined);
        setGuess("");
    };

    const restart = () => {
        window.localStorage.removeItem(storageKey(seed));
        setGame(createClassicGameState(rounds.length));
        setScoreAnimationTarget(0);
        setGuess("");
    };

    const share = async () => {
        const shareUrl = window.location.href;

        if (navigator.share) {
            await navigator.share({ title: t("shareTitle"), url: shareUrl });
            return;
        }

        await navigator.clipboard.writeText(shareUrl);
    };

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

    useEffect(() => {
        const currentRound = game.rounds[game.roundIndex];

        if (!isClient || complete || !currentRound || currentRound.status === "active") {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Enter" || event.repeat) {
                return;
            }

            event.preventDefault();
            nextRound();
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [ complete, game.roundIndex, game.rounds, isClient ]);

    if (!isClient) {
        return (
            <section className="mx-auto px-5 sm:px-8 py-8 sm:py-12 w-full max-w-5xl">
                <p className="text-muted-foreground">{t("loadingGame")}</p>
            </section>
        );
    }

    if (complete) {
        const averageAttempts = getClassicAverageAttempts(game);
        const correctCount = game.rounds.filter(item => item.status === "correct").length;
        const skippedCount = game.rounds.length - correctCount;

        return (
            <section className="mx-auto px-5 sm:px-8 w-full max-w-2xl text-center">
                <ConfettiCelebration active={ showCelebration } />
                <p className="mt-6 font-mono font-bold text-primary text-2xl uppercase tracking-wider">{t("complete.eyebrow")}</p>
                <div className="bg-card mt-5 p-6 sm:p-8 border rounded-2xl">
                    <p className="font-bold text-5xl tracking-tighter">{format.number(score)}</p>
                    <p className="mt-2 text-muted-foreground text-sm">{t("complete.outOf", { total: format.number(rounds.length * 600) })}</p>
                    <div className="gap-4 grid grid-cols-3 mt-8 text-center">
                        <div><p className="font-bold text-2xl">{correctCount}</p><p className="text-muted-foreground text-xs">{t("complete.correct")}</p></div>
                        <div><p className="font-bold text-2xl">{skippedCount}</p><p className="text-muted-foreground text-xs">{t("complete.missed")}</p></div>
                        <div><p className="font-bold text-2xl">{averageAttempts === undefined ? "—" : format.number(averageAttempts, { maximumFractionDigits: 1 })}</p><p className="text-muted-foreground text-xs">{t("complete.averageAttempts")}</p></div>
                    </div>
                </div>
                <div className="bg-card mt-6 p-5 sm:p-6 border rounded-2xl text-left">
                    <h2 className="font-semibold text-center">{t("complete.breakdown")}</h2>
                    <ul className="space-y-2 mt-4">
                        {game.rounds.map((item, index) => (
                            <li className="flex justify-between items-center gap-3" key={ `${ rounds[index].seed }-${ index }` }>
                                <span className="flex items-center gap-2 min-w-0 text-sm"><span className={ item.status === "correct" ? "text-primary" : "text-destructive" }>{item.status === "correct" ? <Check size={ 16 } /> : <X size={ 16 } />}</span><span className="truncate">{rounds[index].meme.title}</span></span>
                                <span className="font-mono text-muted-foreground text-sm">{getClassicRoundScore(item)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="mt-5 text-muted-foreground text-sm">{t("complete.seedDescription")}</p>
                <div className="flex sm:flex-row flex-col justify-center gap-3 mt-6">
                    <Button className="min-h-11" onClick={ share }><Share2 />{t("complete.share")}</Button>
                    <Button className="min-h-11" onClick={ restart } variant="outline">{t("complete.replay")}</Button>
                    <Link className={ cn(buttonVariants({ variant: "secondary" }), "min-h-11") } href={ ROUTES.classic }>{t("complete.newGame")}</Link>
                </div>
            </section>
        );
    }

    if (!round || !roundState) {
        return null;
    }

    const isResolved = roundState.status !== "active";
    const currentRoundScore = getClassicRoundScore(roundState);
    const feedback = roundState.status === "correct"
        ? t("feedback.correct")
        : roundState.status === "skipped"
            ? t("feedback.skipped")
            : roundState.status === "failed"
                ? t("feedback.failed")
                : undefined;

    return (
        <section className="mx-auto px-5 sm:px-8 py-4 sm:py-6 w-full max-w-160">
            <div className="flex justify-between items-center gap-4 mb-4">
                <div>
                    <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("eyebrow")}</p>
                    <h1 className="mt-1 font-bold text-2xl tracking-tight">{t("round", { current: game.roundIndex + 1, total: rounds.length })}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative text-right">
                        <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-wider">{t("score")}</p>
                        <p aria-live="polite" className="font-bold tabular-nums text-xl">{format.number(displayedScore)}</p>
                        {roundPoints && <span className="right-0 absolute font-bold text-emerald-400 text-sm whitespace-nowrap" ref={ bonusReference }>{t("scoreGain", { points: format.number(roundPoints) })}</span>}
                    </div>
                    <Button aria-label={ t("shareAriaLabel") } onClick={ share } size="icon" variant="outline"><Share2 /></Button>
                </div>
            </div>
            <div className="mx-auto max-w-150">
                <MemeGameCanvas effect={ round.effect } imagePath={ getMediaUrl(round.meme.imageStorageKey) } key={ round.meme.imageStorageKey } revealLevel={ isResolved ? MAX_REVEAL_LEVEL : roundState.revealLevel } seed={ round.seed } />
                {!isResolved && (
                    <div className="flex sm:flex-row flex-col justify-between gap-3 mt-4 text-sm">
                        <p className="text-muted-foreground">{t("effect")} : <span className="font-medium text-foreground">{t(`effects.${ round.effect }`)}</span></p>
                        <p className="text-muted-foreground">{t("attempt")} : <span className="font-medium text-foreground">{roundState.guesses.length} / 6</span></p>
                    </div>
                )}
                {!isResolved && (
                    <>
                        <form className="mt-4" onSubmit={ submitGuess }>
                            <label className="sr-only" htmlFor="classic-guess">{t("guessLabel")}</label>
                            <div className="flex sm:flex-row flex-col gap-3">
                                <input
                                    className="flex-1 bg-background px-3 border border-input focus:border-primary rounded-lg outline-none focus:ring-2 focus:ring-primary/30 min-h-11"
                                    disabled={ isResolved }
                                    id="classic-guess"
                                    onChange={ event => setGuess(event.target.value) }
                                    placeholder={ t("guessPlaceholder") }
                                    ref={ inputReference }
                                    value={ guess }
                                />
                                <Button className="sm:min-w-28 min-h-11" disabled={ isResolved || !guess.trim() } type="submit">{t("submit")}</Button>
                            </div>
                        </form>
                        <div className="gap-3 grid sm:grid-cols-2 mt-3">
                            <Button className="min-h-11" onClick={ () => {
                                updateRound(revealClassicRound);
                                shakeInput();
                                inputReference.current?.focus();
                            } } variant="outline"><Eye />{t("revealMore")}</Button>
                            <Button className="min-h-11" onClick={ () => updateRound(skipClassicRound) } variant="ghost"><SkipForward />{t("skip")}</Button>
                        </div>
                    </>
                )}
                {roundState.guesses.length > 0 && (
                    <div className="mt-5 pt-5 border-t">
                        <div aria-label={ t("history.ariaLabel") } className="flex flex-wrap gap-2">
                            {roundState.guesses.map((item, index) => (
                                <Badge key={ `${ item.kind }-${ item.value }-${ index }` } variant={ item.kind === "reveal" ? "secondary" : item.result === "incorrect" ? "destructive" : "default" }>
                                    {item.kind === "reveal" ? t("history.revealRequested") : item.value}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
                {feedback && (
                    <div className="mt-5 pt-5 border-t text-center">
                        <p className="font-semibold text-lg">{round.meme.title}</p>
                        <p className={ `flex justify-center items-center gap-2 mt-2 font-semibold ${ roundState.status === "correct" ? "text-emerald-400" : "text-destructive" }` }>{roundState.status === "correct" ? <Check /> : <X />}{feedback}</p>
                        <p className="mt-2 text-muted-foreground text-sm">{t("roundPoints", { points: format.number(currentRoundScore) })}</p>
                        <Button className="mt-4 w-full min-h-11" onClick={ nextRound }>
                            {t("nextRound")}
                            <kbd className="bg-background/50 px-1.5 py-0.5 border rounded font-mono text-xs">{t("enterKey")}</kbd>
                            <ChevronRight />
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};
