"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { requireAdminAccess } from "@/lib/auth/authorization";
import { env } from "@/lib/env";
import { ROUTES } from "@/routes";

const banSchema = z.object({
    banExpiresIn: z.number().int().positive().optional(),
    discordId: z.string().optional(),
    reason: z.string().trim().min(1).max(500),
    userId: z.string().min(1),
});

const roleSchema = z.object({
    role: z.enum([ "admin", "editor", "user" ]),
    userId: z.string().min(1),
});

const revalidateUsers = (discordId?: string) => {
    revalidatePath(`${ ROUTES.admin }/users`);

    if (discordId) {
        revalidatePath(`${ ROUTES.admin }/users/${ discordId }`);
    }
};

export const banUserAction = async (input: z.infer<typeof banSchema> & { discordId?: string }) => {
    const session = await requireAdminAccess();
    const t = await getTranslations("Admin.users");
    const parsed = banSchema.parse(input);

    if (parsed.userId === session.user.id) {
        throw new Error(t("cannotBanSelf"));
    }

    if (parsed.discordId && parsed.discordId === env.PROTECTED_ADMIN_DISCORD_ID) {
        throw new Error(t("cannotModifyProtectedUser"));
    }

    await auth.api.banUser({ body: { banExpiresIn: parsed.banExpiresIn, banReason: parsed.reason, userId: parsed.userId }, headers: await headers() });
    revalidateUsers(input.discordId);
};

export const setUserRoleAction = async (input: z.infer<typeof roleSchema> & { discordId?: string }) => {
    const session = await requireAdminAccess();
    const t = await getTranslations("Admin.users");
    const parsed = roleSchema.parse(input);

    if (parsed.userId === session.user.id) {
        throw new Error(t("cannotModifyOwnRole"));
    }

    if (input.discordId && input.discordId === env.PROTECTED_ADMIN_DISCORD_ID) {
        throw new Error(t("cannotModifyProtectedUser"));
    }

    await auth.api.setRole({ body: parsed, headers: await headers() });
    revalidateUsers(input.discordId);
};

export const unbanUserAction = async ({ discordId, userId }: { discordId?: string; userId: string }) => {
    await requireAdminAccess();
    await auth.api.unbanUser({ body: { userId }, headers: await headers() });
    revalidateUsers(discordId);
};

export const revokeUserSessionsAction = async ({ discordId, userId }: { discordId?: string; userId: string }) => {
    await requireAdminAccess();
    await auth.api.revokeUserSessions({ body: { userId }, headers: await headers() });
    revalidateUsers(discordId);
};
