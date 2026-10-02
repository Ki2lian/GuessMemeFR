import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    datasource: {
        shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
        url: env("DATABASE_URL"),
    },
    migrations: {
        path: "./prisma/migrations",
    },
    schema: "./prisma/schema",
});
