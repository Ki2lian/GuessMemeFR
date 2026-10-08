import type { NextApiRequest, NextApiResponse } from "next";

import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

import { env } from "@/lib/env";

export const config = {
    api: {
        responseLimit: false,
    },
};

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        return response.status(405).end();
    }

    const { storageKey } = request.query;

    if (typeof storageKey !== "string" || !env.MEDIA_STORAGE_PATH || basename(storageKey) !== storageKey || !(/^[a-f0-9-]+\.webp$/i).test(storageKey)) {
        return response.status(404).end();
    }

    try {
        const image = await readFile(join(env.MEDIA_STORAGE_PATH, storageKey));

        response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        response.setHeader("Content-Type", "image/webp");
        response.setHeader("X-Content-Type-Options", "nosniff");
        return response.status(200).send(image);
    } catch {
        return response.status(404).end();
    }
};

export default handler;
