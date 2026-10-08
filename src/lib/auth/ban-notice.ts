import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";

const BAN_NOTICE_MAX_AGE_MS = 10 * 60 * 1000;
const BAN_NOTICE_PREFIX = "ban-notice:";

interface BanNoticePayload {
    issuedAt: number;
    userId: string;
}

const sign = (value: string) => createHmac("sha256", env.BETTER_AUTH_SECRET).update(value).digest("base64url");

export const createBanNotice = (userId: string) => {
    const payload = Buffer.from(JSON.stringify({ issuedAt: Date.now(), userId } satisfies BanNoticePayload)).toString("base64url");
    return `${ BAN_NOTICE_PREFIX }${ payload }.${ sign(payload) }`;
};

export const getBanNoticeUserId = (message?: string) => {
    if (!message?.startsWith(BAN_NOTICE_PREFIX)) return null;

    const [ payload, signature, ...extraParts ] = message.slice(BAN_NOTICE_PREFIX.length).split(".");

    if (!payload || !signature || extraParts.length > 0) return null;

    const expectedSignature = sign(payload);
    const received = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

    try {
        const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<BanNoticePayload>;

        if (
            typeof parsed.userId !== "string" ||
            typeof parsed.issuedAt !== "number" ||
            !Number.isFinite(parsed.issuedAt) ||
            Date.now() - parsed.issuedAt > BAN_NOTICE_MAX_AGE_MS ||
            parsed.issuedAt > Date.now() + 60 * 1000
        ) {
            return null;
        }

        return parsed.userId;
    } catch {
        return null;
    }
};
