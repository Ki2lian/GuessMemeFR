"use client";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cn } from "cn";
import * as React from "react";

const Avatar = ({
    className,
    size = "default",
    ...props
}: AvatarPrimitive.Root.Props & {
    size?: "default" | "lg" | "sm";
}) => (
    <AvatarPrimitive.Root
        className={ cn(
            "group/avatar after:absolute relative after:inset-0 flex after:border after:border-border rounded-full after:rounded-full size-8 data-[size=lg]:size-10 data-[size=sm]:size-6 select-none shrink-0 after:mix-blend-darken dark:after:mix-blend-lighten",
            className,
        ) }
        data-size={ size }
        data-slot="avatar"
        { ...props }
    />
);

const AvatarImage = ({ className, ...props }: AvatarPrimitive.Image.Props) => (
    <AvatarPrimitive.Image className={ cn("rounded-full size-full object-cover aspect-square", className) } data-slot="avatar-image" { ...props } />
);

const AvatarFallback = ({ className, ...props }: AvatarPrimitive.Fallback.Props) => (
    <AvatarPrimitive.Fallback
        className={ cn(
            "flex justify-center items-center bg-muted rounded-full size-full text-muted-foreground group-data-[size=sm]/avatar:text-xs text-sm",
            className,
        ) }
        data-slot="avatar-fallback"
        { ...props }
    />
);

const AvatarBadge = ({ className, ...props }: React.ComponentProps<"span">) => (
    <span
        className={ cn(
            "inline-flex right-0 bottom-0 z-10 absolute justify-center items-center bg-blend-color bg-primary rounded-full ring-2 ring-background text-primary-foreground select-none",
            "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
            "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
            "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
            className,
        ) }
        data-slot="avatar-badge"
        { ...props }
    />
);

const AvatarGroup = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        className={ cn("group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background", className) }
        data-slot="avatar-group"
        { ...props }
    />
);

const AvatarGroupCount = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        className={ cn(
            "relative flex justify-center items-center bg-muted rounded-full ring-2 ring-background size-8 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3 group-has-data-[size=sm]/avatar-group:size-6 text-muted-foreground text-sm shrink-0",
            className,
        ) }
        data-slot="avatar-group-count"
        { ...props }
    />
);

export { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage };
