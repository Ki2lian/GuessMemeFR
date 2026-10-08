"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { PanelLeftIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

interface SidebarContextProps {
    isMobile: boolean;
    open: boolean;
    openMobile: boolean;
    setOpen: (open: boolean) => void;
    setOpenMobile: (open: boolean) => void;
    state: "collapsed" | "expanded";
    toggleSidebar: () => void;
}

const SidebarContext = React.createContext<null | SidebarContextProps>(null);

const useSidebar = () => {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }

    return context;
};

const SidebarProvider = ({
    children,
    className,
    defaultOpen = true,
    onOpenChange: setOpenProp,
    open: openProp,
    style,
    ...props
}: React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
}) => {
    const isMobile = useIsMobile();
    const [ openMobile, setOpenMobile ] = React.useState(false);

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [ _open, _setOpen ] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
        (value: ((value: boolean) => boolean) | boolean) => {
            const openState = typeof value === "function" ? value(open) : value;
            if (setOpenProp) {
                setOpenProp(openState);
            } else {
                _setOpen(openState);
            }

            // This sets the cookie to keep the sidebar state.
            document.cookie = `${ SIDEBAR_COOKIE_NAME }=${ openState }; path=/; max-age=${ SIDEBAR_COOKIE_MAX_AGE }`;
        },
        [ setOpenProp, open ],
    );

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
        return isMobile ? setOpenMobile(prev => !prev) : setOpen(prev => !prev);
    }, [ isMobile, setOpen, setOpenMobile ]);

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleSidebar();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [ toggleSidebar ]);

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo<SidebarContextProps>(
        () => ({
            isMobile,
            open,
            openMobile,
            setOpen,
            setOpenMobile,
            state,
            toggleSidebar,
        }),
        [ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar ],
    );

    return (
        <SidebarContext.Provider value={ contextValue }>
            <div
                className={ cn("group/sidebar-wrapper flex has-data-[variant=inset]:bg-sidebar w-full min-h-svh", className) }
                data-slot="sidebar-wrapper"
                style={
                    {
                        "--sidebar-width": SIDEBAR_WIDTH,
                        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                        ...style,
                    } as React.CSSProperties
                }
                { ...props }
            >
                {children}
            </div>
        </SidebarContext.Provider>
    );
};

const Sidebar = ({
    children,
    className,
    collapsible = "offcanvas",
    dir,
    side = "left",
    variant = "sidebar",
    ...props
}: React.ComponentProps<"div"> & {
    collapsible?: "icon" | "none" | "offcanvas";
    side?: "left" | "right";
    variant?: "floating" | "inset" | "sidebar";
}) => {
    const { isMobile, openMobile, setOpenMobile, state } = useSidebar();

    if (collapsible === "none") {
        return (
            <div
                className={ cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className) }
                data-slot="sidebar"
                { ...props }
            >
                {children}
            </div>
        );
    }

    if (isMobile) {
        return (
            <Sheet onOpenChange={ setOpenMobile } open={ openMobile } { ...props }>
                <SheetContent
                    className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
                    data-mobile="true"
                    data-sidebar="sidebar"
                    data-slot="sidebar"
                    dir={ dir }
                    side={ side }
                    style={
                        {
                            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                        } as React.CSSProperties
                    }
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Sidebar</SheetTitle>
                        <SheetDescription>Displays the mobile sidebar.</SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col w-full h-full">{children}</div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div
            className="group peer hidden md:block text-sidebar-foreground"
            data-collapsible={ state === "collapsed" ? collapsible : "" }
            data-side={ side }
            data-slot="sidebar"
            data-state={ state }
            data-variant={ variant }
        >
            {/* This is what handles the sidebar gap on desktop */}
            <div
                className={ cn(
                    "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
                    "group-data-[collapsible=offcanvas]:w-0",
                    "group-data-[side=right]:rotate-180",
                    variant === "floating" || variant === "inset"
                        ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
                        : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
                ) }
                data-slot="sidebar-gap"
            />
            <div
                className={ cn(
                    "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:-left-(--sidebar-width) data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:-right-(--sidebar-width) md:flex",
                    // Adjust the padding for floating and inset variants.
                    variant === "floating" || variant === "inset"
                        ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
                        : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
                    className,
                ) }
                data-side={ side }
                data-slot="sidebar-container"
                { ...props }
            >
                <div
                    className="flex flex-col bg-sidebar group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-sidebar-border group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:ring-1 size-full"
                    data-sidebar="sidebar"
                    data-slot="sidebar-inner"
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

const SidebarTrigger = ({ className, onClick, ...props }: React.ComponentProps<typeof Button>) => {
    const { toggleSidebar } = useSidebar();

    return (
        <Button
            className={ cn(className) }
            data-sidebar="trigger"
            data-slot="sidebar-trigger"
            onClick={ event => {
                onClick?.(event);
                toggleSidebar();
            } }
            size="icon-sm"
            variant="ghost"
            { ...props }
        >
            <PanelLeftIcon />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    );
};

const SidebarRail = ({ className, ...props }: React.ComponentProps<"button">) => {
    const { toggleSidebar } = useSidebar();

    return (
        <button
            aria-label="Toggle Sidebar"
            className={ cn(
                "hidden group-data-[side=left]:-right-4 group-data-[side=right]:left-0 z-20 absolute after:absolute inset-y-0 after:inset-s-1/2 after:inset-y-0 sm:flex hover:after:bg-sidebar-border w-4 after:w-0.5 transition-all ltr:-translate-x-1/2 rtl:-translate-x-1/2 ease-linear",
                "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
                "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
                "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
                "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
                "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
                className,
            ) }
            data-sidebar="rail"
            data-slot="sidebar-rail"
            onClick={ toggleSidebar }
            tabIndex={ -1 }
            title="Toggle Sidebar"
            { ...props }
        />
    );
};

const SidebarInset = ({ className, ...props }: React.ComponentProps<"main">) => (
    <main
        className={ cn(
            "relative flex flex-col flex-1 bg-background md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[variant=inset]:rounded-xl w-full",
            className,
        ) }
        data-slot="sidebar-inset"
        { ...props }
    />
);

const SidebarInput = ({ className, ...props }: React.ComponentProps<typeof Input>) => (
    <Input className={ cn("bg-background shadow-none w-full h-8", className) } data-sidebar="input" data-slot="sidebar-input" { ...props } />
);

const SidebarHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={ cn("flex flex-col gap-2 p-2", className) } data-sidebar="header" data-slot="sidebar-header" { ...props } />
);

const SidebarFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={ cn("flex flex-col gap-2 p-2", className) } data-sidebar="footer" data-slot="sidebar-footer" { ...props } />
);

const SidebarSeparator = ({ className, ...props }: React.ComponentProps<typeof Separator>) => (
    <Separator className={ cn("mx-2 bg-sidebar-border w-auto", className) } data-sidebar="separator" data-slot="sidebar-separator" { ...props } />
);

const SidebarContent = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        className={ cn("flex flex-col flex-1 gap-0 min-h-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden no-scrollbar", className) }
        data-sidebar="content"
        data-slot="sidebar-content"
        { ...props }
    />
);

const SidebarGroup = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={ cn("relative flex flex-col p-2 w-full min-w-0", className) } data-sidebar="group" data-slot="sidebar-group" { ...props } />
);

const SidebarGroupLabel = ({ className, render, ...props }: React.ComponentProps<"div"> & useRender.ComponentProps<"div">) =>
    useRender({
        defaultTagName: "div",
        props: mergeProps<"div">(
            {
                className: cn(
                    "flex items-center group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-mt-8 px-2 rounded-md outline-hidden ring-sidebar-ring focus-visible:ring-2 h-8 [&>svg]:size-4 font-medium text-sidebar-foreground/70 text-xs transition-[margin,opacity] duration-200 ease-linear shrink-0 [&>svg]:shrink-0",
                    className,
                ),
            },
            props,
        ),
        render,
        state: {
            sidebar: "group-label",
            slot: "sidebar-group-label",
        },
    });

const SidebarGroupAction = ({ className, render, ...props }: React.ComponentProps<"button"> & useRender.ComponentProps<"button">) =>
    useRender({
        defaultTagName: "button",
        props: mergeProps<"button">(
            {
                className: cn(
                    "md:after:hidden group-data-[collapsible=icon]:hidden top-3.5 right-3 absolute after:absolute after:-inset-2 flex justify-center items-center hover:bg-sidebar-accent p-0 rounded-md outline-hidden ring-sidebar-ring focus-visible:ring-2 w-5 [&>svg]:size-4 aspect-square text-sidebar-foreground transition-transform hover:text-sidebar-accent-foreground [&>svg]:shrink-0",
                    className,
                ),
            },
            props,
        ),
        render,
        state: {
            sidebar: "group-action",
            slot: "sidebar-group-action",
        },
    });

const SidebarGroupContent = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={ cn("w-full text-sm", className) } data-sidebar="group-content" data-slot="sidebar-group-content" { ...props } />
);

const SidebarMenu = ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul className={ cn("flex flex-col gap-0 w-full min-w-0", className) } data-sidebar="menu" data-slot="sidebar-menu" { ...props } />
);

const SidebarMenuItem = ({ className, ...props }: React.ComponentProps<"li">) => (
    <li className={ cn("group/menu-item relative", className) } data-sidebar="menu-item" data-slot="sidebar-menu-item" { ...props } />
);

const sidebarMenuButtonVariants = cva(
    "group/menu-button peer/menu-button flex items-center gap-2 data-active:bg-sidebar-accent data-open:hover:bg-sidebar-accent hover:bg-sidebar-accent active:bg-sidebar-accent aria-disabled:opacity-50 disabled:opacity-50 p-2 group-data-[collapsible=icon]:p-2! group-has-data-[sidebar=menu-action]/menu-item:pr-8 rounded-md outline-hidden ring-sidebar-ring focus-visible:ring-2 w-full [&_svg]:size-4 group-data-[collapsible=icon]:size-8! overflow-hidden data-active:font-medium text-sm text-left [&>span:last-child]:truncate transition-[width,height,padding] data-active:text-sidebar-accent-foreground data-open:hover:text-sidebar-accent-foreground hover:text-sidebar-accent-foreground active:text-sidebar-accent-foreground aria-disabled:pointer-events-none disabled:pointer-events-none [&_svg]:shrink-0",
    {
        defaultVariants: {
            size: "default",
            variant: "default",
        },
        variants: {
            size: {
                default: "h-8 text-sm",
                lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
                sm: "h-7 text-xs",
            },
            variant: {
                default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                outline:
                    "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
            },
        },
    },
);

const SidebarMenuButton = ({
    className,
    isActive = false,
    render,
    size = "default",
    tooltip,
    variant = "default",
    ...props
}: React.ComponentProps<"button"> &
    useRender.ComponentProps<"button"> &
    VariantProps<typeof sidebarMenuButtonVariants> & {
        isActive?: boolean;
        tooltip?: React.ComponentProps<typeof TooltipContent> | string;
    }) => {
    const { isMobile, state } = useSidebar();
    const comp = useRender({
        defaultTagName: "button",
        props: mergeProps<"button">(
            {
                className: cn(sidebarMenuButtonVariants({ size, variant }), className),
            },
            props,
        ),
        render: !tooltip ? render : <TooltipTrigger render={ render } />,
        state: {
            active: isActive,
            sidebar: "menu-button",
            size,
            slot: "sidebar-menu-button",
        },
    });

    if (!tooltip) {
        return comp;
    }

    if (typeof tooltip === "string") {
        tooltip = {
            children: tooltip,
        };
    }

    return (
        <Tooltip>
            {comp}
            <TooltipContent align="center" hidden={ state !== "collapsed" || isMobile } side="right" { ...tooltip } />
        </Tooltip>
    );
};

const SidebarMenuAction = ({
    className,
    render,
    showOnHover = false,
    ...props
}: React.ComponentProps<"button"> &
    useRender.ComponentProps<"button"> & {
        showOnHover?: boolean;
    }) =>
    useRender({
        defaultTagName: "button",
        props: mergeProps<"button">(
            {
                className: cn(
                    "md:after:hidden group-data-[collapsible=icon]:hidden top-1.5 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 right-1 absolute after:absolute after:-inset-2 flex justify-center items-center hover:bg-sidebar-accent p-0 rounded-md outline-hidden ring-sidebar-ring focus-visible:ring-2 w-5 [&>svg]:size-4 aspect-square text-sidebar-foreground transition-transform hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:shrink-0",
                    showOnHover &&
                        "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",
                    className,
                ),
            },
            props,
        ),
        render,
        state: {
            sidebar: "menu-action",
            slot: "sidebar-menu-action",
        },
    });

const SidebarMenuBadge = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        className={ cn(
            "group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 right-1 absolute flex justify-center items-center px-1 rounded-md min-w-5 h-5 font-medium tabular-nums text-sidebar-foreground text-xs peer-data-active/menu-button:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground pointer-events-none select-none",
            className,
        ) }
        data-sidebar="menu-badge"
        data-slot="sidebar-menu-badge"
        { ...props }
    />
);

const SidebarMenuSkeleton = ({
    className,
    showIcon = false,
    ...props
}: React.ComponentProps<"div"> & {
    showIcon?: boolean;
}) => {
    // Random width between 50 to 90%.
    const [ width ] = React.useState(() => {
        return `${ Math.floor(Math.random() * 40) + 50 }%`;
    });

    return (
        <div
            className={ cn("flex items-center gap-2 px-2 rounded-md h-8", className) }
            data-sidebar="menu-skeleton"
            data-slot="sidebar-menu-skeleton"
            { ...props }
        >
            {showIcon && <Skeleton className="rounded-md size-4" data-sidebar="menu-skeleton-icon" />}
            <Skeleton
                className="h-4 max-w-(--skeleton-width) flex-1"
                data-sidebar="menu-skeleton-text"
                style={
                    {
                        "--skeleton-width": width,
                    } as React.CSSProperties
                }
            />
        </div>
    );
};

const SidebarMenuSub = ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul
        className={ cn(
            "group-data-[collapsible=icon]:hidden flex flex-col gap-1 mx-3.5 px-2.5 py-0.5 border-sidebar-border border-l min-w-0 translate-x-px",
            className,
        ) }
        data-sidebar="menu-sub"
        data-slot="sidebar-menu-sub"
        { ...props }
    />
);

const SidebarMenuSubItem = ({ className, ...props }: React.ComponentProps<"li">) => (
    <li className={ cn("group/menu-sub-item relative", className) } data-sidebar="menu-sub-item" data-slot="sidebar-menu-sub-item" { ...props } />
);

const SidebarMenuSubButton = ({
    className,
    isActive = false,
    render,
    size = "md",
    ...props
}: React.ComponentProps<"a"> &
    useRender.ComponentProps<"a"> & {
        isActive?: boolean;
        size?: "md" | "sm";
    }) =>
    useRender({
        defaultTagName: "a",
        props: mergeProps<"a">(
            {
                className: cn(
                    "group-data-[collapsible=icon]:hidden flex items-center gap-2 data-active:bg-sidebar-accent hover:bg-sidebar-accent active:bg-sidebar-accent aria-disabled:opacity-50 disabled:opacity-50 px-2 rounded-md outline-hidden ring-sidebar-ring focus-visible:ring-2 min-w-0 h-7 [&>svg]:size-4 overflow-hidden text-sidebar-foreground data-[size=sm]:text-xs data-[size=md]:text-sm [&>span:last-child]:truncate -translate-x-px [&>svg]:text-sidebar-accent-foreground data-active:text-sidebar-accent-foreground hover:text-sidebar-accent-foreground active:text-sidebar-accent-foreground aria-disabled:pointer-events-none disabled:pointer-events-none [&>svg]:shrink-0",
                    className,
                ),
            },
            props,
        ),
        render,
        state: {
            active: isActive,
            sidebar: "menu-sub-button",
            size,
            slot: "sidebar-menu-sub-button",
        },
    });

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
};
