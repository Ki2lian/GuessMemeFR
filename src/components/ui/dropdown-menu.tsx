"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "cn";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

const DropdownMenu = ({ ...props }: MenuPrimitive.Root.Props) => <MenuPrimitive.Root data-slot="dropdown-menu" { ...props } />;

const DropdownMenuPortal = ({ ...props }: MenuPrimitive.Portal.Props) => <MenuPrimitive.Portal data-slot="dropdown-menu-portal" { ...props } />;

const DropdownMenuTrigger = ({ ...props }: MenuPrimitive.Trigger.Props) => <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" { ...props } />;

const DropdownMenuContent = ({
    align = "start",
    alignOffset = 0,
    className,
    side = "bottom",
    sideOffset = 4,
    ...props
}: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) => <MenuPrimitive.Portal>
    <MenuPrimitive.Positioner
        align={ align }
        alignOffset={ alignOffset }
        className="z-50 isolate outline-none"
        side={ side }
        sideOffset={ sideOffset }
    >
        <MenuPrimitive.Popup
            className={ cn(
                "z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
                className,
            ) }
            data-slot="dropdown-menu-content"
            { ...props }
        />
    </MenuPrimitive.Positioner>
</MenuPrimitive.Portal>;

const DropdownMenuGroup = ({ ...props }: MenuPrimitive.Group.Props) => <MenuPrimitive.Group data-slot="dropdown-menu-group" { ...props } />;

const DropdownMenuLabel = ({
    className,
    inset,
    ...props
}: MenuPrimitive.GroupLabel.Props & {
    inset?: boolean;
}) => <MenuPrimitive.GroupLabel
    className={ cn("px-1.5 py-1 data-inset:pl-7 font-medium text-muted-foreground text-xs", className) }
    data-inset={ inset }
    data-slot="dropdown-menu-label"
    { ...props }
/>;

const DropdownMenuItem = ({
    className,
    inset,
    variant = "default",
    ...props
}: MenuPrimitive.Item.Props & {
    inset?: boolean;
    variant?: "default" | "destructive";
}) => <MenuPrimitive.Item
    className={ cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className,
    ) }
    data-inset={ inset }
    data-slot="dropdown-menu-item"
    data-variant={ variant }
    { ...props }
/>;

const DropdownMenuSub = ({ ...props }: MenuPrimitive.SubmenuRoot.Props) => <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" { ...props } />;

const DropdownMenuSubTrigger = ({
    children,
    className,
    inset,
    ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
    inset?: boolean;
}) => <MenuPrimitive.SubmenuTrigger
    className={ cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
    ) }
    data-inset={ inset }
    data-slot="dropdown-menu-sub-trigger"
    { ...props }
>
    {children}
    <ChevronRightIcon className="ml-auto" />
</MenuPrimitive.SubmenuTrigger>;

const DropdownMenuSubContent = ({
    align = "start",
    alignOffset = -3,
    className,
    side = "right",
    sideOffset = 0,
    ...props
}: React.ComponentProps<typeof DropdownMenuContent>) => <DropdownMenuContent
    align={ align }
    alignOffset={ alignOffset }
    className={ cn(
        "data-[side=left]:slide-in-from-right-2 data-[side=top]:slide-in-from-bottom-2 bg-popover data-[side=bottom]:slide-in-from-top-2 data-[side=right]:slide-in-from-left-2 shadow-lg p-1 rounded-lg ring-1 ring-foreground/10 w-auto min-w-24 text-popover-foreground data-closed:animate-out data-open:animate-in duration-100 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95",
        className,
    ) }
    data-slot="dropdown-menu-sub-content"
    side={ side }
    sideOffset={ sideOffset }
    { ...props }
/>;

const DropdownMenuCheckboxItem = ({
    checked,
    children,
    className,
    inset,
    ...props
}: MenuPrimitive.CheckboxItem.Props & {
    inset?: boolean;
}) => <MenuPrimitive.CheckboxItem
    checked={ checked }
    className={ cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
    ) }
    data-inset={ inset }
    data-slot="dropdown-menu-checkbox-item"
    { ...props }
>
    <span className="right-2 absolute flex justify-center items-center pointer-events-none" data-slot="dropdown-menu-checkbox-item-indicator">
        <MenuPrimitive.CheckboxItemIndicator>
            <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
    </span>
    {children}
</MenuPrimitive.CheckboxItem>;

const DropdownMenuRadioGroup = ({ ...props }: MenuPrimitive.RadioGroup.Props) => <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" { ...props } />;

const DropdownMenuRadioItem = ({
    children,
    className,
    inset,
    ...props
}: MenuPrimitive.RadioItem.Props & {
    inset?: boolean;
}) => <MenuPrimitive.RadioItem
    className={ cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
    ) }
    data-inset={ inset }
    data-slot="dropdown-menu-radio-item"
    { ...props }
>
    <span className="right-2 absolute flex justify-center items-center pointer-events-none" data-slot="dropdown-menu-radio-item-indicator">
        <MenuPrimitive.RadioItemIndicator>
            <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
    </span>
    {children}
</MenuPrimitive.RadioItem>;

const DropdownMenuSeparator = ({ className, ...props }: MenuPrimitive.Separator.Props) => <MenuPrimitive.Separator className={ cn("-mx-1 my-1 bg-border h-px", className) } data-slot="dropdown-menu-separator" { ...props } />;

const DropdownMenuShortcut = ({ className, ...props }: React.ComponentProps<"span">) => <span
    className={ cn("ml-auto text-muted-foreground text-xs tracking-widest group-focus/dropdown-menu-item:text-accent-foreground", className) }
    data-slot="dropdown-menu-shortcut"
    { ...props }
/>;

export {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
};
