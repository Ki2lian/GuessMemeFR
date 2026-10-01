import { cn } from "cn";

const Skeleton = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={ cn("bg-muted rounded-md animate-pulse", className) } data-slot="skeleton" { ...props } />
);

export { Skeleton };
