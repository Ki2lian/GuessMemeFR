"use client";

import { cn } from "cn";
import * as React from "react";

const Table = ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="relative w-full overflow-x-auto" data-slot="table-container">
        <table className={ cn("w-full text-sm caption-bottom", className) } data-slot="table" { ...props } />
    </div>
);

const TableHeader = ({ className, ...props }: React.ComponentProps<"thead">) => (
    <thead className={ cn("[&_tr]:border-b", className) } data-slot="table-header" { ...props } />
);

const TableBody = ({ className, ...props }: React.ComponentProps<"tbody">) => (
    <tbody className={ cn("[&_tr:last-child]:border-0", className) } data-slot="table-body" { ...props } />
);

const TableFooter = ({ className, ...props }: React.ComponentProps<"tfoot">) => (
    <tfoot className={ cn("bg-muted/50 border-t [&>tr]:last:border-b-0 font-medium", className) } data-slot="table-footer" { ...props } />
);

const TableRow = ({ className, ...props }: React.ComponentProps<"tr">) => (
    <tr
        className={ cn("data-[state=selected]:bg-muted has-aria-expanded:bg-muted/50 hover:bg-muted/50 border-b transition-colors", className) }
        data-slot="table-row"
        { ...props }
    />
);

const TableHead = ({ className, ...props }: React.ComponentProps<"th">) => (
    <th
        className={ cn("px-2 has-[[role=checkbox]]:pr-0 h-10 font-medium text-foreground text-left align-middle whitespace-nowrap", className) }
        data-slot="table-head"
        { ...props }
    />
);

const TableCell = ({ className, ...props }: React.ComponentProps<"td">) => (
    <td className={ cn("p-2 has-[[role=checkbox]]:pr-0 align-middle whitespace-nowrap", className) } data-slot="table-cell" { ...props } />
);

const TableCaption = ({ className, ...props }: React.ComponentProps<"caption">) => (
    <caption className={ cn("mt-4 text-muted-foreground text-sm", className) } data-slot="table-caption" { ...props } />
);

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
