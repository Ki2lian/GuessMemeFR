import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
    "group/badge inline-flex justify-center items-center gap-1 px-2 py-0.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 border border-transparent aria-invalid:border-destructive focus-visible:border-ring rounded-4xl aria-invalid:ring-destructive/20 focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:aria-invalid:ring-destructive/40 w-fit h-5 [&>svg]:size-3! overflow-hidden font-medium text-xs whitespace-nowrap transition-all [&>svg]:pointer-events-none shrink-0",
    {
        defaultVariants: {
            variant: "default",
        },
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
                destructive:
                    "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
                ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
                link: "text-primary underline-offset-4 hover:underline",
                outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
                secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
            },
        },
    },
);

const Badge = ({ className, render, variant = "default", ...props }: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) =>
    useRender({
        defaultTagName: "span",
        props: mergeProps<"span">(
            {
                className: cn(badgeVariants({ variant }), className),
            },
            props,
        ),
        render,
        state: {
            slot: "badge",
            variant,
        },
    });

export { Badge, badgeVariants };
