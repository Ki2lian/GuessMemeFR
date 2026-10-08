import { mediaAssetRepository } from "@/data/MediaAssetRepository";
import { deleteStoredImage, processImageUpload, storeProcessedImage } from "@/lib/media/image-processing";

export const uploadImage = async ({ file, uploadedById }: { file: File; uploadedById: string }) => {
    const { image, metadata } = await processImageUpload(file);
    const existingAsset = await mediaAssetRepository.findBySha256(metadata.sha256);

    if (existingAsset) {
        throw new Error("Cette image a déjà été importée.");
    }

    const asset = await mediaAssetRepository.createPending({
        ...metadata,
        uploadedById,
    });

    try {
        await storeProcessedImage({
            image,
            storageKey: metadata.storageKey,
        });
    } catch (error) {
        await mediaAssetRepository.markDeleted(asset.id);
        throw error;
    }

    return mediaAssetRepository.markReady(asset.id);
};

export const removeImage = async ({ id, storageKey }: { id: string; storageKey: string }) => {
    const [ hasClassicSeedReference, hasDailyChallengeReference ] = await Promise.all([
        mediaAssetRepository.hasClassicSeedReference(storageKey),
        mediaAssetRepository.hasDailyChallengeReference(storageKey),
    ]);

    if (hasClassicSeedReference || hasDailyChallengeReference) {
        return false;
    }

    await deleteStoredImage(storageKey);
    await mediaAssetRepository.remove(id);

    return true;
};
