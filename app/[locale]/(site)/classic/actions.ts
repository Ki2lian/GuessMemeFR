"use server";

import { revalidatePath } from "next/cache";

import { classicGameRepository } from "@/data/ClassicGameRepository";
import { getSession } from "@/lib/auth/session";
import { type ClassicGameState } from "@/lib/game/classic-game";
import { ROUTES } from "@/routes";

export const recordClassicCompletionAction = async ({ game, seed }: { game: ClassicGameState; seed: number }) => {
    const session = await getSession();

    if (!session) {
        return false;
    }

    const recorded = await classicGameRepository.recordCompletion({ game, seed, userId: session.user.id });

    if (recorded) {
        revalidatePath(ROUTES.profile);
        revalidatePath(`${ ROUTES.admin }/users`);
    }

    return recorded;
};
