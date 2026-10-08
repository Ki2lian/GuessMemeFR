import { getTranslations } from "next-intl/server";

import { getSession } from "@/lib/auth/session";

const backofficeRoles = new Set([ "admin", "editor" ]);

export const hasBackofficeAccess = (role: null | string | undefined) => role?.split(",").some(value => backofficeRoles.has(value)) ?? false;

export const requireCatalogAccess = async () => {
    const session = await getSession();

    if (!session || !hasBackofficeAccess(session.user.role)) {
        const t = await getTranslations("Errors");
        throw new Error(t("catalogUnauthorized"));
    }

    return session;
};

export const requireAdminAccess = async () => {
    const session = await getSession();

    if (!session || !session.user.role?.split(",").includes("admin")) {
        const t = await getTranslations("Errors");
        throw new Error(t("usersUnauthorized"));
    }

    return session;
};
