import { createEnv } from "@t3-oss/env-nextjs";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const env = createEnv({
    client: {},
    experimental__runtimeEnv: {},
    server: {
        DATABASE_URL: z.url(),
        NODE_ENV: z.enum([ "development", "production", "test" ]).default("development"),
    },
});
