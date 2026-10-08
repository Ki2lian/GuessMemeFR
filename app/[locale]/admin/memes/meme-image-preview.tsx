"use client";

import { ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getMediaUrl } from "@/lib/media/url";

interface MemeImagePreviewProps {
    asset: null | { height: null | number; status: "DELETED" | "PENDING" | "READY"; storageKey: string; width: null | number };
    title: string;
}

export const MemeImagePreview = ({ asset, title }: MemeImagePreviewProps) => {
    const t = useTranslations("Admin.memes");

    if (!asset || asset.status !== "READY") {
        return (
            <span aria-label={ t("noImage") } className="grid bg-muted rounded-md size-12 text-muted-foreground">
                <ImageOff aria-hidden="true" className="justify-self-center size-4" />
            </span>
        );
    }

    const src = getMediaUrl(asset.storageKey);
    const width = asset.width ?? 600;
    const height = asset.height ?? 450;

    return (
        <Dialog>
            <DialogTrigger
                aria-label={ t("viewImage", { title }) }
                className="block relative rounded-md focus-visible:outline-2 focus-visible:outline-ring outline-offset-2 size-12 overflow-hidden"
                render={ <button type="button" /> }
            >
                <Image alt="" className="object-cover cursor-pointer select-none" draggable="false" fill sizes="48px" src={ src } unoptimized />
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{t("imagePreviewTitle", { title })}</DialogTitle>
                    <DialogDescription>{t("imagePreviewDescription")}</DialogDescription>
                </DialogHeader>
                <div className="relative bg-muted rounded-lg min-h-48 max-h-[70svh] overflow-hidden">
                    <Image alt={ title } className="w-full max-h-[70svh] object-contain select-none" draggable="false" height={ height } src={ src } unoptimized width={ width } />
                </div>
            </DialogContent>
        </Dialog>
    );
};
