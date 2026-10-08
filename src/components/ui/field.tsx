"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { useMemo } from "react";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const FieldSet = ({ className, ...props }: React.ComponentProps<"fieldset">) => (
    <fieldset
        className={ cn("flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3", className) }
        data-slot="field-set"
        { ...props }
    />
);

const FieldLegend = ({ className, variant = "legend", ...props }: React.ComponentProps<"legend"> & { variant?: "label" | "legend" }) => (
    <legend
        className={ cn("mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base", className) }
        data-slot="field-legend"
        data-variant={ variant }
        { ...props }
    />
);

const FieldGroup = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        className={ cn(
            "@container/field-group group/field-group flex flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4 w-full",
            className,
        ) }
        data-slot="field-group"
        { ...props }
    />
);

const fieldVariants = cva("group/field flex gap-2 w-full data-[invalid=true]:text-destructive", {
    defaultVariants: {
        orientation: "vertical",
    },
    variants: {
        orientation: {
            horizontal:
                "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
            responsive:
                "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
            vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        },
    },
});

const Field = ({ className, orientation = "vertical", ...props }: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) => (
    <div className={ cn(fieldVariants({ orientation }), className) } data-orientation={ orientation } data-slot="field" role="group" { ...props } />
);

const FieldContent = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={ cn("group/field-content flex flex-col flex-1 gap-0.5 leading-snug", className) } data-slot="field-content" { ...props } />
);

const FieldLabel = ({ className, ...props }: React.ComponentProps<typeof Label>) => (
    <Label
        className={ cn(
            "group/field-label peer/field-label flex gap-2 has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-muted/50 has-data-checked:bg-primary/5 dark:has-data-checked:bg-primary/10 group-data-[disabled=true]/field:opacity-50 *:data-[slot=field]:p-2.5 has-[>[data-slot=field]]:border has-[>[data-slot=field]]:has-focus-visible:border-ring has-data-checked:border-primary/30 dark:has-data-checked:border-primary/20 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:has-focus-visible:ring-3 has-[>[data-slot=field]]:has-focus-visible:ring-ring/50 w-fit leading-snug",
            "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
            className,
        ) }
        data-slot="field-label"
        { ...props }
    />
);

const FieldTitle = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        className={ cn("flex items-center gap-2 group-data-[disabled=true]/field:opacity-50 w-fit font-medium text-sm", className) }
        data-slot="field-label"
        { ...props }
    />
);

const FieldDescription = ({ className, ...props }: React.ComponentProps<"p">) => (
    <p
        className={ cn(
            "[[data-variant=legend]+&]:-mt-1.5 font-normal text-muted-foreground text-sm text-left group-has-data-horizontal/field:text-balance leading-normal",
            "last:mt-0 nth-last-2:-mt-1",
            "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
            className,
        ) }
        data-slot="field-description"
        { ...props }
    />
);

const FieldSeparator = ({
    children,
    className,
    ...props
}: React.ComponentProps<"div"> & {
    children?: React.ReactNode;
}) => (
    <div
        className={ cn("relative -my-2 group-data-[variant=outline]/field-group:-mb-2 h-5 text-sm", className) }
        data-content={ !!children }
        data-slot="field-separator"
        { ...props }
    >
        <Separator className="top-1/2 absolute inset-0" />
        {children && (
            <span className="block relative bg-background mx-auto px-2 w-fit text-muted-foreground" data-slot="field-separator-content">
                {children}
            </span>
        )}
    </div>
);

const FieldError = ({
    children,
    className,
    errors,
    ...props
}: React.ComponentProps<"div"> & {
    errors?: Array<undefined | { message?: string }>;
}) => {
    const content = useMemo(() => {
        if (children) {
            return children;
        }

        if (!errors?.length) {
            return null;
        }

        const uniqueErrors = [ ...new Map(errors.map(error => [ error?.message, error ])).values() ];

        if (uniqueErrors?.length == 1) {
            return uniqueErrors[0]?.message;
        }

        return (
            <ul className="flex flex-col gap-1 ml-4 list-disc">
                {uniqueErrors.map((error, index) => error?.message && <li key={ index }>{error.message}</li>)}
            </ul>
        );
    }, [ children, errors ]);

    if (!content) {
        return null;
    }

    return (
        <div className={ cn("font-normal text-destructive text-sm", className) } data-slot="field-error" role="alert" { ...props }>
            {content}
        </div>
    );
};

export { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle };
