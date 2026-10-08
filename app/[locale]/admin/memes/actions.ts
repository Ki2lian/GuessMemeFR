"use server";

import { MediaAssetStatus, MemeAnswerType, MemeDifficulty, MemeStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { memeRepository } from "@/data/MemeRepository";
import { requireCatalogAccess } from "@/lib/auth/authorization";
import { normalizeAnswer } from "@/lib/game/normalize-answer";
import { MAX_MEDIA_FILE_SIZE_BYTES } from "@/lib/media/constants";
import { removeImage, uploadImage } from "@/lib/media/upload";
import { ROUTES } from "@/routes";

const createMemeSchema = z.object({
    difficulty: z.enum(MemeDifficulty),
    origin: z.string().trim().max(255).optional(),
    sourceUrl: z.url().optional(),
    title: z.string().trim().min(2).max(255),
});

const parseAnswers = (canonicalAnswer: string, aliases: string, errorMessage: string) => {
    const values = [ canonicalAnswer, ...aliases.split("\n") ]
        .map(value => value.trim())
        .filter(Boolean);
    const normalizedValues = new Set<string>();

    return values.map((value, index) => {
        const normalizedValue = normalizeAnswer(value);

        if (!normalizedValue || normalizedValues.has(normalizedValue)) {
            throw new Error(errorMessage);
        }

        normalizedValues.add(normalizedValue);

        return {
            normalizedValue,
            type: index === 0 ? "CANONICAL" : "ALIAS",
            value,
        } as const;
    });
};

const parseMemeForm = (formData: FormData, t: Awaited<ReturnType<typeof getTranslations>>) => {
    const parsed = createMemeSchema.safeParse({
        difficulty: formData.get("difficulty"),
        origin: formData.get("origin") || undefined,
        sourceUrl: formData.get("sourceUrl") || undefined,
        title: formData.get("title"),
    });
    const canonicalAnswer = formData.get("canonicalAnswer");
    const aliases = formData.get("aliases");

    if (!parsed.success) {
        throw new Error(t("errorInvalid"));
    }

    if (typeof canonicalAnswer !== "string" || typeof aliases !== "string") {
        throw new Error(t("errorMissingImageOrAnswer"));
    }

    return {
        ...parsed.data,
        answers: parseAnswers(canonicalAnswer, aliases, t("errorAnswersDifferent")),
    };
};

const assertImageSize = (image: File, t: Awaited<ReturnType<typeof getTranslations>>) => {
    if (image.size > MAX_MEDIA_FILE_SIZE_BYTES) {
        throw new Error(t("errorImageTooLarge"));
    }
};

export const createMemeAction = async (formData: FormData) => {
    const session = await requireCatalogAccess();
    const t = await getTranslations("Admin.memes");
    const image = formData.get("image");
    const meme = parseMemeForm(formData, t);

    if (!(image instanceof File) || image.size === 0) {
        throw new Error(t("errorMissingImageOrAnswer"));
    }
    assertImageSize(image, t);

    const asset = await uploadImage({
        file: image,
        uploadedById: session.user.id,
    });

    await memeRepository.createDraft({
        ...meme,
        coverAssetId: asset.id,
        createdById: session.user.id,
    });

    revalidatePath(ROUTES.admin);
    revalidatePath(`${ ROUTES.admin }/memes`);
};

export const updateMemeAction = async (id: string, formData: FormData) => {
    const session = await requireCatalogAccess();
    const t = await getTranslations("Admin.memes");
    const meme = parseMemeForm(formData, t);
    const image = formData.get("image");

    if (image instanceof File && image.size > 0) {
        assertImageSize(image, t);
    }
    const asset = image instanceof File && image.size > 0
        ? await uploadImage({ file: image, uploadedById: session.user.id })
        : undefined;
    let previousCoverAsset;

    try {
        previousCoverAsset = await memeRepository.updateDetails({
            ...meme,
            coverAssetId: asset?.id,
            id,
        });
    } catch (error) {
        if (asset) {
            await removeImage(asset).catch(() => undefined);
        }

        throw error;
    }

    if (previousCoverAsset) {
        await removeImage(previousCoverAsset);
    }
    revalidatePath(`${ ROUTES.admin }/memes`);
};

export const archiveMemeAction = async (id: string) => {
    await requireCatalogAccess();
    await memeRepository.updateStatus(id, MemeStatus.ARCHIVED);
    revalidatePath(`${ ROUTES.admin }/memes`);
};

export const publishMemeAction = async (id: string) => {
    await requireCatalogAccess();
    const t = await getTranslations("Admin.memes");
    const meme = await memeRepository.getForPublishing(id);

    if (!meme || meme.status !== MemeStatus.DRAFT) {
        throw new Error(t("errorDraftUnavailable"));
    }

    const hasCanonicalAnswer = meme.answers.some(answer => answer.type === MemeAnswerType.CANONICAL);

    if (meme.coverAsset?.status !== MediaAssetStatus.READY || !hasCanonicalAnswer) {
        throw new Error(t("errorPublishRequirements"));
    }

    await memeRepository.updateStatus(id, MemeStatus.PUBLISHED);
    revalidatePath(`${ ROUTES.admin }/memes`);
};
