import { createEnv } from "@t3-oss/env-nextjs";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const env = createEnv({
    client: {},
    experimental__runtimeEnv: {},
    server: {
        BETTER_AUTH_SECRET: z.string(),
        BETTER_AUTH_URL: z.url(),
        DATABASE_URL: z.url(),
        DISCORD_CLIENT_ID: z.string(),
        DISCORD_CLIENT_SECRET: z.string(),
        NODE_ENV: z.enum([ "development", "production", "test" ]).default("development"),
        SHADOW_DATABASE_URL: z.url(),
    },
});
