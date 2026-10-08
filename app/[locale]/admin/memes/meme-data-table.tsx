"use client";

import {
    columnFilteringFeature,
    createColumnHelper,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    filterFn_includesString,
    rowPaginationFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    tableFeatures,
    useTable,
} from "@tanstack/react-table";
import { Check, ChevronsUpDown, MoreHorizontal, Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { archiveMemeAction, createMemeAction, publishMemeAction, updateMemeAction } from "@/app/admin/memes/actions";
import { MemeEffectsPreview } from "@/app/admin/memes/meme-effects-preview";
import { MemeForm } from "@/app/admin/memes/meme-form";
import { MemeImagePreview } from "@/app/admin/memes/meme-image-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const features = tableFeatures({
    columnFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: { includesString: filterFn_includesString },
    paginatedRowModel: createPaginatedRowModel(),
    rowPaginationFeature,
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
    sortFns: { alphanumeric: sortFn_alphanumeric },
});

export interface MemeTableRow {
    answers: Array<{ type: "ALIAS" | "CANONICAL"; value: string }>;
    coverAsset: null | { height: null | number; status: "DELETED" | "PENDING" | "READY"; storageKey: string; width: null | number };
    difficulty: "EASY" | "HARD" | "MEDIUM";
    id: string;
    origin: null | string;
    sourceUrl: null | string;
    status: "ARCHIVED" | "DRAFT" | "PUBLISHED";
    title: string;
}

type DataTableFeatures = typeof features;

const columnHelper = createColumnHelper<DataTableFeatures, MemeTableRow>();

export const MemeDataTable = ({ memes }: { memes: Array<MemeTableRow> }) => {
    const t = useTranslations("Admin.memes");
    const router = useRouter();
    const [ openCreateDialog, setOpenCreateDialog ] = useState(false);
    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.display({
                    cell: ({ row }) => <MemeImagePreview asset={ row.original.coverAsset } title={ row.original.title } />,
                    header: t("imageColumn"),
                    id: "image",
                }),
                columnHelper.accessor("title", {
                    cell: ({ row }) => (
                        <Tooltip>
                            <TooltipTrigger className="block max-w-52 truncate font-medium" render={ <span /> }>{row.original.title}</TooltipTrigger>
                            <TooltipContent>{row.original.title}</TooltipContent>
                        </Tooltip>
                    ),
                    header: ({ column }) => <SortButton column={ column }>{t("titleLabel")}</SortButton>,
                }),
                columnHelper.display({
                    cell: ({ row }) => <MemeAnswers answers={ row.original.answers } />,
                    header: t("answers"),
                    id: "answers",
                }),
                columnHelper.accessor("difficulty", {
                    cell: ({ row }) => (
                        <span>{t(`difficulty${ row.original.difficulty.slice(0, 1) }${ row.original.difficulty.slice(1).toLowerCase() }`)}</span>
                    ),
                    header: ({ column }) => <SortButton column={ column }>{t("difficulty")}</SortButton>,
                }),
                columnHelper.accessor("status", {
                    cell: ({ row }) => <MemeStatusBadge status={ row.original.status } />,
                    header: ({ column }) => <SortButton column={ column }>{t("status")}</SortButton>,
                }),
                columnHelper.display({
                    cell: ({ row }) => <MemeRowActions meme={ row.original } />,
                    header: t("actions"),
                    id: "actions",
                }),
            ]),
        [ t ],
    );
    const table = useTable({
        columns,
        data: memes,
        features,
        initialState: {
            pagination: { pageIndex: 0, pageSize: 5 },
        },
    });
    const statusCounts = {
        ARCHIVED: memes.filter(meme => meme.status === "ARCHIVED").length,
        DRAFT: memes.filter(meme => meme.status === "DRAFT").length,
        PUBLISHED: memes.filter(meme => meme.status === "PUBLISHED").length,
    } as const;
    const emptyRowCount = Math.max(0, table.state.pagination.pageSize - table.getRowModel().rows.length);

    return (
        <div className="flex flex-col flex-1 gap-6 min-w-0">
            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-4">
                <div>
                    <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("catalog")}</p>
                    <h1 className="mt-2 font-bold text-3xl tracking-tight">{t("existing")}</h1>
                </div>
                <Dialog onOpenChange={ setOpenCreateDialog } open={ openCreateDialog }>
                    <DialogTrigger render={ <Button /> }>
                        <Plus />
                        {t("add")}
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[calc(100svh-2rem)] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t("title")}</DialogTitle>
                            <DialogDescription>{t("description")}</DialogDescription>
                        </DialogHeader>
                        <MemeForm action={ createMemeAction } imageRequired onSuccess={ () => {
                            setOpenCreateDialog(false);
                            router.refresh();
                        } } />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="gap-4 grid sm:grid-cols-3">
                <MemeStatusCount count={ statusCounts.DRAFT } label={ t("draftCount") } />
                <MemeStatusCount count={ statusCounts.PUBLISHED } label={ t("publishedCount") } />
                <MemeStatusCount count={ statusCounts.ARCHIVED } label={ t("archivedCount") } />
            </div>
            <div className="border rounded-xl">
                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 p-4 border-b">
                    <Input
                        className="max-w-sm"
                        onChange={ event => table.getColumn("title")?.setFilterValue(event.target.value) }
                        placeholder={ t("search") }
                    />
                    <MemePagination table={ table } />
                </div>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={ headerGroup.id }>
                                {headerGroup.headers.map(header => (
                                    <TableHead
                                        className={
                                            header.column.id === "image" ? "sr-only" : header.column.id === "actions" ? "text-right" : undefined
                                        }
                                        key={ header.id }
                                    >
                                        {header.isPlaceholder ? null : <table.FlexRender header={ header } />}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow className="h-20" key={ row.id }>
                                    {row.getAllCells().map(cell => (
                                        <TableCell className={ cell.column.id === "actions" ? "text-right" : undefined } key={ cell.id }>
                                            <table.FlexRender cell={ cell } />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className="h-24 text-center" colSpan={ columns.length }>
                                    {t("noResults")}
                                </TableCell>
                            </TableRow>
                        )}
                        {table.getRowModel().rows.length > 0 && Array.from({ length: emptyRowCount }, (_, index) => (
                            <TableRow className="h-20" key={ `empty-${ index }` }>
                                <TableCell colSpan={ columns.length } />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-end"><MemePagination table={ table } /></div>
        </div>
    );
};

const getPaginationItems = (pageCount: number, pageIndex: number): Array<"end-ellipsis" | "start-ellipsis" | number> => {
    if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, index) => index);
    }

    if (pageIndex <= 3) {
        return [ 0, 1, 2, 3, "end-ellipsis", pageCount - 1 ];
    }

    if (pageIndex >= pageCount - 4) {
        return [ 0, "start-ellipsis", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1 ];
    }

    return [ 0, "start-ellipsis", pageIndex - 1, pageIndex, pageIndex + 1, "end-ellipsis", pageCount - 1 ];
};

const MemePagination = ({
    table,
}: {
    table: {
        getCanNextPage: () => boolean;
        getCanPreviousPage: () => boolean;
        getPageCount: () => number;
        nextPage: () => void;
        previousPage: () => void;
        setPageIndex: (pageIndex: number) => void;
        setPageSize: (pageSize: number) => void;
        state: { pagination: { pageIndex: number; pageSize: number }};
    };
}) => {
    const t = useTranslations("Admin.memes");
    const { pageIndex, pageSize } = table.state.pagination;
    const pageCount = table.getPageCount();
    const paginationItems = getPaginationItems(pageCount, pageIndex);

    return (
        <div className="flex flex-wrap justify-end items-center gap-2">
            <Select onValueChange={ value => {
                table.setPageSize(Number(value));
                table.setPageIndex(0);
            } } value={ String(pageSize) }>
                <SelectTrigger aria-label={ t("itemsPerPage") } className="w-24">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {[ 5, 10, 25, 50 ].map(size => <SelectItem key={ size } value={ String(size) }>{t("itemsPerPageValue", { count: size })}</SelectItem>)}
                </SelectContent>
            </Select>
            {pageCount > 1 && (
                <>
                    <Button disabled={ !table.getCanPreviousPage() } onClick={ () => table.previousPage() } size="sm" variant="outline">
                        {t("previousPage")}
                    </Button>
                    {paginationItems.map(item => typeof item === "number" ? (
                        <Button aria-label={ t("goToPage", { page: item + 1 }) } className="min-w-8" key={ item } onClick={ () => table.setPageIndex(item) } size="sm" variant={ pageIndex === item ? "default" : "outline" }>
                            {item + 1}
                        </Button>
                    ) : <span aria-hidden="true" className="px-1 text-muted-foreground" key={ item }>…</span>)}
                    <Button disabled={ !table.getCanNextPage() } onClick={ () => table.nextPage() } size="sm" variant="outline">
                        {t("nextPage")}
                    </Button>
                </>
            )}
        </div>
    );
};

const MemeStatusCount = ({ count, label }: { count: number; label: string }) => (
    <Card size="sm">
        <CardContent className="grid gap-1">
            <p className="font-bold text-3xl tabular-nums tracking-tight">{count}</p>
            <CardDescription>{label}</CardDescription>
        </CardContent>
    </Card>
);

const SortButton = ({
    children,
    column,
}: {
    children: React.ReactNode;
    column: { getIsSorted: () => "asc" | "desc" | false; toggleSorting: (descending?: boolean) => void };
}) => (
    <Button className="-ml-3" onClick={ () => column.toggleSorting(column.getIsSorted() === "asc") } variant="ghost">
        {children}
        <ChevronsUpDown aria-hidden="true" />
    </Button>
);

const MemeStatusBadge = ({ status }: { status: MemeTableRow["status"] }) => {
    const t = useTranslations("Admin.memes");
    const labels = { ARCHIVED: t("statusArchived"), DRAFT: t("statusDraft"), PUBLISHED: t("statusPublished") } as const;
    const variants = { ARCHIVED: "outline", DRAFT: "secondary", PUBLISHED: "default" } as const;
    return <Badge variant={ variants[status] }>{labels[status]}</Badge>;
};

const MemeAnswers = ({ answers }: { answers: MemeTableRow["answers"] }) => {
    const t = useTranslations("Admin.memes");
    const canonicalAnswer = answers.find(answer => answer.type === "CANONICAL");
    const aliases = answers.filter(answer => answer.type === "ALIAS");

    return (
        <div className="grid gap-1 w-56">
            {canonicalAnswer && <Badge className="max-w-full truncate" title={ t("canonicalAnswer") }>{canonicalAnswer.value}</Badge>}
            {aliases.length > 0 && (
                <div aria-label={ t("aliases") } className="flex flex-wrap content-start gap-1 h-14 overflow-y-auto pr-1">
                    {aliases.map(alias => <Badge className="max-w-full truncate" key={ alias.value } title={ t("aliases") } variant="outline">{alias.value}</Badge>)}
                </div>
            )}
        </div>
    );
};

const MemeRowActions = ({ meme }: { meme: MemeTableRow }) => {
    const t = useTranslations("Admin.memes");
    const router = useRouter();
    const [ editOpen, setEditOpen ] = useState(false);
    const [ deleteOpen, setDeleteOpen ] = useState(false);
    const [ effectsPreviewOpen, setEffectsPreviewOpen ] = useState(false);
    const canPreviewEffects = meme.coverAsset?.status === "READY";

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger aria-label={ t("actions") } render={ <Button size="icon-sm" variant="ghost" /> }>
                    <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-60">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={ () => setEditOpen(true) }>
                            <Pencil />
                            {t("edit")}
                        </DropdownMenuItem>
                        {canPreviewEffects && (
                            <DropdownMenuItem onClick={ () => setEffectsPreviewOpen(true) }>
                                <SlidersHorizontal />
                                {t("testEffects")}
                            </DropdownMenuItem>
                        )}
                        {meme.status === "DRAFT" && (
                            <DropdownMenuItem onClick={ () => publishMemeAction(meme.id) }>
                                <Check />
                                {t("publish")}
                            </DropdownMenuItem>
                        )}
                        {meme.status !== "ARCHIVED" && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={ () => setDeleteOpen(true) } variant="destructive">
                                    <Trash2 />
                                    {t("delete")}
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {canPreviewEffects && meme.coverAsset && (
                <Dialog onOpenChange={ setEffectsPreviewOpen } open={ effectsPreviewOpen }>
                    <DialogContent className="sm:max-w-2xl max-h-[calc(100svh-2rem)] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t("effectsPreviewTitle")}</DialogTitle>
                            <DialogDescription>{t("effectsPreviewDescription")}</DialogDescription>
                        </DialogHeader>
                        <MemeEffectsPreview imagePath={ `/api/media/${ encodeURIComponent(meme.coverAsset.storageKey) }` } />
                    </DialogContent>
                </Dialog>
            )}
            <Dialog onOpenChange={ setEditOpen } open={ editOpen }>
                <DialogContent className="sm:max-w-2xl max-h-[calc(100svh-2rem)] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("editTitle")}</DialogTitle>
                        <DialogDescription>{t("editDescription")}</DialogDescription>
                    </DialogHeader>
                    <MemeForm action={ updateMemeAction.bind(null, meme.id) } meme={ meme } onSuccess={ () => {
                        setEditOpen(false);
                        router.refresh();
                    } } />
                </DialogContent>
            </Dialog>
            <Dialog onOpenChange={ setDeleteOpen } open={ deleteOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("deleteTitle")}</DialogTitle>
                        <DialogDescription>{t("deleteDescription")}</DialogDescription>
                    </DialogHeader>
                    <form action={ archiveMemeAction.bind(null, meme.id) }>
                        <DialogFooter>
                            <DialogClose render={ <Button type="button" variant="outline" /> }>{t("cancel")}</DialogClose>
                            <Button type="submit" variant="destructive">
                                {t("delete")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
