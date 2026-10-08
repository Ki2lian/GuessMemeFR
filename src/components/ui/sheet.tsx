"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

const Sheet = ({ ...props }: SheetPrimitive.Root.Props) => <SheetPrimitive.Root data-slot="sheet" { ...props } />;

const SheetTrigger = ({ ...props }: SheetPrimitive.Trigger.Props) => <SheetPrimitive.Trigger data-slot="sheet-trigger" { ...props } />;

const SheetClose = ({ ...props }: SheetPrimitive.Close.Props) => <SheetPrimitive.Close data-slot="sheet-close" { ...props } />;

const SheetPortal = ({ ...props }: SheetPrimitive.Portal.Props) => <SheetPrimitive.Portal data-slot="sheet-portal" { ...props } />;

const SheetOverlay = ({ className, ...props }: SheetPrimitive.Backdrop.Props) => (
    <SheetPrimitive.Backdrop
        className={ cn(
            "z-50 fixed inset-0 bg-black/10 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs transition-opacity duration-150",
            className,
        ) }
        data-slot="sheet-overlay"
        { ...props }
    />
);

const SheetContent = ({
    children,
    className,
    showCloseButton = true,
    side = "right",
    ...props
}: SheetPrimitive.Popup.Props & {
    showCloseButton?: boolean;
    side?: "bottom" | "left" | "right" | "top";
}) => (
    <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Popup
            className={ cn(
                "data-[side=top]:top-0 data-[side=right]:right-0 data-[side=bottom]:bottom-0 data-[side=left]:left-0 z-50 fixed data-[side=bottom]:inset-x-0 data-[side=left]:inset-y-0 data-[side=right]:inset-y-0 data-[side=top]:inset-x-0 flex flex-col gap-4 bg-popover bg-clip-padding data-ending-style:opacity-0 data-starting-style:opacity-0 shadow-lg data-[side=bottom]:border-t data-[side=left]:border-r data-[side=top]:border-b data-[side=right]:border-l data-[side=left]:w-3/4 data-[side=right]:w-3/4 data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm data-[side=bottom]:h-auto data-[side=left]:h-full data-[side=right]:h-full data-[side=top]:h-auto text-popover-foreground text-sm transition data-[side=bottom]:data-ending-style:translate-y-10 data-[side=bottom]:data-starting-style:translate-y-10 data-[side=left]:data-ending-style:-translate-x-10 data-[side=left]:data-starting-style:-translate-x-10 data-[side=right]:data-ending-style:translate-x-10 data-[side=right]:data-starting-style:translate-x-10 data-[side=top]:data-ending-style:-translate-y-10 data-[side=top]:data-starting-style:-translate-y-10 duration-200 ease-in-out",
                className,
            ) }
            data-side={ side }
            data-slot="sheet-content"
            { ...props }
        >
            {children}
            {showCloseButton && (
                <SheetPrimitive.Close data-slot="sheet-close" render={ <Button className="top-3 right-3 absolute" size="icon-sm" variant="ghost" /> }>
                    <XIcon />
                    <span className="sr-only">Close</span>
                </SheetPrimitive.Close>
            )}
        </SheetPrimitive.Popup>
    </SheetPortal>
);

const SheetHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={ cn("flex flex-col gap-0.5 p-4", className) } data-slot="sheet-header" { ...props } />
);

const SheetFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={ cn("flex flex-col gap-2 mt-auto p-4", className) } data-slot="sheet-footer" { ...props } />
);

const SheetTitle = ({ className, ...props }: SheetPrimitive.Title.Props) => (
    <SheetPrimitive.Title className={ cn("font-medium text-foreground text-base", className) } data-slot="sheet-title" { ...props } />
);

const SheetDescription = ({ className, ...props }: SheetPrimitive.Description.Props) => (
    <SheetPrimitive.Description className={ cn("text-muted-foreground text-sm", className) } data-slot="sheet-description" { ...props } />
);

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger };
