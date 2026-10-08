"use client";

import { cn } from "cn";
import * as React from "react";

const Label = ({ className, ...props }: React.ComponentProps<"label">) => (
    <label
        className={ cn(
            "flex items-center gap-2 group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 font-medium text-sm leading-none peer-disabled:cursor-not-allowed group-data-[disabled=true]:pointer-events-none select-none",
            className,
        ) }
        data-slot="label"
        { ...props }
    />
);

export { Label };
