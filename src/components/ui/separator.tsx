"use client";

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { cn } from "cn";

const Separator = ({ className, orientation = "horizontal", ...props }: SeparatorPrimitive.Props) => (
    <SeparatorPrimitive
        className={ cn("data-vertical:self-stretch bg-border data-horizontal:w-full data-vertical:w-px data-horizontal:h-px shrink-0", className) }
        data-slot="separator"
        orientation={ orientation }
        { ...props }
    />
);

export { Separator };
