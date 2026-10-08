"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

const Dialog = ({ ...props }: DialogPrimitive.Root.Props) => <DialogPrimitive.Root data-slot="dialog" { ...props } />;

const DialogTrigger = ({ ...props }: DialogPrimitive.Trigger.Props) => <DialogPrimitive.Trigger data-slot="dialog-trigger" { ...props } />;

const DialogPortal = ({ ...props }: DialogPrimitive.Portal.Props) => <DialogPrimitive.Portal data-slot="dialog-portal" { ...props } />;

const DialogClose = ({ ...props }: DialogPrimitive.Close.Props) => <DialogPrimitive.Close data-slot="dialog-close" { ...props } />;

const DialogOverlay = ({ className, ...props }: DialogPrimitive.Backdrop.Props) => (
    <DialogPrimitive.Backdrop
        className={ cn(
            "z-50 isolate fixed inset-0 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-closed:animate-out data-open:animate-in duration-100 data-open:fade-in-0 data-closed:fade-out-0",
            className,
        ) }
        data-slot="dialog-overlay"
        { ...props }
    />
);

const DialogContent = ({
    children,
    className,
    showCloseButton = true,
    ...props
}: DialogPrimitive.Popup.Props & {
    showCloseButton?: boolean;
}) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup
            className={ cn(
                "top-1/2 left-1/2 z-50 fixed gap-4 grid bg-popover p-4 rounded-xl outline-none ring-1 ring-foreground/10 w-full max-w-[calc(100%-2rem)] sm:max-w-sm text-popover-foreground text-sm -translate-x-1/2 -translate-y-1/2 data-closed:animate-out data-open:animate-in duration-100 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95",
                className,
            ) }
            data-slot="dialog-content"
            { ...props }
        >
            {children}
            {showCloseButton && (
                <DialogPrimitive.Close data-slot="dialog-close" render={ <Button className="top-2 right-2 absolute" size="icon-sm" variant="ghost" /> }>
                    <XIcon />
                    <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
            )}
        </DialogPrimitive.Popup>
    </DialogPortal>
);

const DialogHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={ cn("flex flex-col gap-2", className) } data-slot="dialog-header" { ...props } />
);

const DialogFooter = ({
    children,
    className,
    showCloseButton = false,
    ...props
}: React.ComponentProps<"div"> & {
    showCloseButton?: boolean;
}) => (
    <div
        className={ cn("flex sm:flex-row flex-col-reverse sm:justify-end gap-2 bg-muted/50 -mx-4 -mb-4 p-4 border-t rounded-b-xl", className) }
        data-slot="dialog-footer"
        { ...props }
    >
        {children}
        {showCloseButton && <DialogPrimitive.Close render={ <Button variant="outline" /> }>Close</DialogPrimitive.Close>}
    </div>
);

const DialogTitle = ({ className, ...props }: DialogPrimitive.Title.Props) => (
    <DialogPrimitive.Title className={ cn("font-medium text-base leading-none", className) } data-slot="dialog-title" { ...props } />
);

const DialogDescription = ({ className, ...props }: DialogPrimitive.Description.Props) => (
    <DialogPrimitive.Description
        className={ cn("text-muted-foreground *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3", className) }
        data-slot="dialog-description"
        { ...props }
    />
);

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger };
