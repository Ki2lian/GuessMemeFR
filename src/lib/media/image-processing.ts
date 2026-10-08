import { createHash, randomUUID } from "node:crypto";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import sharp from "sharp";

import { env } from "@/lib/env";
import { MAX_MEDIA_FILE_SIZE_BYTES } from "@/lib/media/constants";

export const MAX_MEDIA_DIMENSION = 4096;

const acceptedFormats = new Set([ "jpeg", "png", "webp" ]);

export interface ProcessedImage {
    byteSize: number;
    height: number;
    mimeType: "image/webp";
    sha256: string;
    storageKey: string;
    width: number;
}

const getStoragePath = () => {
    if (!env.MEDIA_STORAGE_PATH) {
        throw new Error("MEDIA_STORAGE_PATH must be configured before uploading media.");
    }

    return env.MEDIA_STORAGE_PATH;
};

export const processImageUpload = async (file: File): Promise<{ image: Buffer; metadata: ProcessedImage }> => {
    if (file.size === 0 || file.size > MAX_MEDIA_FILE_SIZE_BYTES) {
        throw new Error("The uploaded image exceeds the allowed file size.");
    }

    const source = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(source, { limitInputPixels: MAX_MEDIA_DIMENSION ** 2 }).metadata();

    if (!metadata.format || !acceptedFormats.has(metadata.format) || !metadata.width || !metadata.height) {
        throw new Error("The uploaded file is not a supported image.");
    }

    if (metadata.width > MAX_MEDIA_DIMENSION || metadata.height > MAX_MEDIA_DIMENSION) {
        throw new Error("The uploaded image exceeds the allowed dimensions.");
    }

    const image = await sharp(source, { limitInputPixels: MAX_MEDIA_DIMENSION ** 2 })
        .rotate()
        .webp({ quality: 85 })
        .toBuffer();
    const convertedMetadata = await sharp(image).metadata();
    const storageKey = `${ randomUUID() }.webp`;

    return {
        image,
        metadata: {
            byteSize: image.byteLength,
            height: convertedMetadata.height ?? metadata.height,
            mimeType: "image/webp",
            sha256: createHash("sha256").update(image).digest("hex"),
            storageKey,
            width: convertedMetadata.width ?? metadata.width,
        },
    };
};

export const storeProcessedImage = async ({ image, storageKey }: { image: Buffer; storageKey: string }) => {
    const storagePath = getStoragePath();
    const finalPath = join(storagePath, basename(storageKey));
    const temporaryPath = `${ finalPath }.${ randomUUID() }.tmp`;

    await mkdir(storagePath, { recursive: true });

    try {
        await writeFile(temporaryPath, image, { flag: "wx" });
        await rename(temporaryPath, finalPath);
    } catch (error) {
        await rm(temporaryPath, { force: true }).catch(() => undefined);
        throw error;
    }
};

export const deleteStoredImage = async (storageKey: string) => {
    const storagePath = getStoragePath();

    await rm(join(storagePath, basename(storageKey)), { force: true });
};
