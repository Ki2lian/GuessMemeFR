"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cn } from "cn";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import * as React from "react";

const Select = SelectPrimitive.Root;

const SelectGroup = ({ className, ...props }: SelectPrimitive.Group.Props) => (
    <SelectPrimitive.Group className={ cn("p-1 scroll-my-1", className) } data-slot="select-group" { ...props } />
);

const SelectValue = ({ className, ...props }: SelectPrimitive.Value.Props) => (
    <SelectPrimitive.Value className={ cn("flex flex-1 text-left", className) } data-slot="select-value" { ...props } />
);

const SelectTrigger = ({
    children,
    className,
    size = "default",
    ...props
}: SelectPrimitive.Trigger.Props & {
    size?: "default" | "sm";
}) => (
    <SelectPrimitive.Trigger
        className={ cn(
            "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            className,
        ) }
        data-size={ size }
        data-slot="select-trigger"
        { ...props }
    >
        {children}
        <SelectPrimitive.Icon render={ <ChevronDownIcon className="size-4 text-muted-foreground pointer-events-none" /> } />
    </SelectPrimitive.Trigger>
);

const SelectContent = ({
    align = "center",
    alignItemWithTrigger = true,
    alignOffset = 0,
    children,
    className,
    side = "bottom",
    sideOffset = 4,
    ...props
}: Pick<SelectPrimitive.Positioner.Props, "align" | "alignItemWithTrigger" | "alignOffset" | "side" | "sideOffset"> &
    SelectPrimitive.Popup.Props) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
            align={ align }
            alignItemWithTrigger={ alignItemWithTrigger }
            alignOffset={ alignOffset }
            className="z-50 isolate"
            side={ side }
            sideOffset={ sideOffset }
        >
            <SelectPrimitive.Popup
                className={ cn(
                    "relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                    className,
                ) }
                data-align-trigger={ alignItemWithTrigger }
                data-slot="select-content"
                { ...props }
            >
                <SelectScrollUpButton />
                <SelectPrimitive.List>{children}</SelectPrimitive.List>
                <SelectScrollDownButton />
            </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
);

const SelectLabel = ({ className, ...props }: SelectPrimitive.GroupLabel.Props) => (
    <SelectPrimitive.GroupLabel className={ cn("px-1.5 py-1 text-muted-foreground text-xs", className) } data-slot="select-label" { ...props } />
);

const SelectItem = ({ children, className, ...props }: SelectPrimitive.Item.Props) => (
    <SelectPrimitive.Item
        className={ cn(
            "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
            className,
        ) }
        data-slot="select-item"
        { ...props }
    >
        <SelectPrimitive.ItemText className="flex flex-1 gap-2 whitespace-nowrap shrink-0">{children}</SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator render={ <span className="right-2 absolute flex justify-center items-center size-4 pointer-events-none" /> }>
            <CheckIcon className="pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
);

const SelectSeparator = ({ className, ...props }: SelectPrimitive.Separator.Props) => (
    <SelectPrimitive.Separator className={ cn("-mx-1 my-1 bg-border h-px pointer-events-none", className) } data-slot="select-separator" { ...props } />
);

const SelectScrollUpButton = ({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) => (
    <SelectPrimitive.ScrollUpArrow
        className={ cn(
            "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
            className,
        ) }
        data-slot="select-scroll-up-button"
        { ...props }
    >
        <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
);

const SelectScrollDownButton = ({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) => (
    <SelectPrimitive.ScrollDownArrow
        className={ cn(
            "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
            className,
        ) }
        data-slot="select-scroll-down-button"
        { ...props }
    >
        <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
);

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};
