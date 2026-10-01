import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface GameModeCardProps {
    description: string;
    href: string;
    label: string;
    title: string;
    variant?: "daily";
}

export const GameModeCard = ({ description, href, label, title, variant }: GameModeCardProps) => (
    <Link
        className={ cn(
            "group bg-card p-6 border border-border hover:border-primary rounded-2xl min-h-64 transition hover:-translate-y-1 duration-200",
            variant === "daily" && "bg-linear-to-br from-violet-950 to-indigo-950",
        ) }
        href={ href }
    >
        <span className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{label}</span>
        <div className="flex justify-between items-center gap-4 mt-14">
            <h3 className="font-bold text-3xl tracking-tight">{title}</h3>
            <ArrowUpRight
                aria-hidden="true"
                className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 shrink-0"
                size={ 24 }
            />
        </div>
        <p className="mt-4 max-w-md text-muted-foreground leading-6">{description}</p>
    </Link>
);
