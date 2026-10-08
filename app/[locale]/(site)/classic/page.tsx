import { redirect } from "next/navigation";

import { classicSeedRepository } from "@/data/ClassicSeedRepository";
import { getSession } from "@/lib/auth/session";
import { ROUTES } from "@/routes";

export default async function ClassicPage() {
    const session = await getSession();
    const seed = await classicSeedRepository.getRandomUncompletedSeed(session?.user.id);

    redirect(`${ ROUTES.classic }/${ seed }`);
}
