import { redirect } from "next/navigation";

import { ROUTES } from "@/routes";

export default function ClassicPage() {
    const values = new Uint32Array(1);

    crypto.getRandomValues(values);
    redirect(`${ ROUTES.classic }/${ values[0] }`);
}
