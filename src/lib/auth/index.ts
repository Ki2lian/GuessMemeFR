import { AuditEventType } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { CDN } from "discord.js";

import { auditLogRepository } from "@/data/AuditLogRepository";
import { createBanNotice } from "@/lib/auth/ban-notice";
import { accessControl, adminRole, editorRole, userRole } from "@/lib/auth/permissions";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    database: prismaAdapter(prisma, {
        provider: "mysql",
    }),
    databaseHooks: {
        session: {
            create: {
                after: async session => {
                    await auditLogRepository.recordAuthEvent(AuditEventType.AUTH_SIGNED_IN, session.userId);
                },
            },
            delete: {
                after: async session => {
                    await auditLogRepository.recordAuthEvent(AuditEventType.AUTH_SIGNED_OUT, session.userId);
                },
            },
        },
    },
    plugins: [
        admin({
            ac: accessControl,
            bannedUserMessage: user => createBanNotice(String(user.id)),
            roles: {
                admin: adminRole,
                editor: editorRole,
                user: userRole,
            },
        }),
        nextCookies(),
    ],
    secret: env.BETTER_AUTH_SECRET,
    socialProviders: {
        discord: {
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
            mapProfileToUser: discordUser => {
                const cdn = new CDN();

                return {
                    banner: discordUser.banner ? cdn.banner(discordUser.id, discordUser.banner) : null,
                    discordId: discordUser.id,
                    email: discordUser.email ?? `${ discordUser.id }@discord.placeholder.invalid`,
                    username: discordUser.username,
                };
            },
            overrideUserInfoOnSignIn: true,
            scope: [ "identify", "email" ],
        },
    },
    user: {
        additionalFields: {
            banner: { required: false, type: "string" },
            discordId: { required: false, type: "string" },
            username: { required: false, type: "string" },
        },
    },
});
