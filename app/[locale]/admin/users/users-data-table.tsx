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
import { Ban, CalendarDays, Check, ChevronsUpDown, Eye, LogOut, MoreHorizontal, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { fr } from "react-day-picker/locale";

import { banUserAction, revokeUserSessionsAction, setUserRoleAction, unbanUserAction } from "@/app/admin/users/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export interface UserTableRow {
    _count: { classicResults: number; dailyResults: number; gameSessions: number };
    banExpires: Date | null;
    banned: boolean;
    banReason: null | string;
    createdAt: Date;
    discordId: null | string;
    email: string;
    id: string;
    image: null | string;
    isProtected: boolean;
    name: string;
    role: string;
    username: null | string;
}

type DataTableFeatures = typeof features;

const columnHelper = createColumnHelper<DataTableFeatures, UserTableRow>();

const banDurationMultipliers = {
    hour: 60 * 60,
    minute: 60,
    second: 1,
} as const;

type BanDurationUnit = keyof typeof banDurationMultipliers;
type BanExpiryMode = "date" | "duration" | "permanent";

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

export const UsersDataTable = ({ currentUserId, users }: { currentUserId?: string; users: Array<UserTableRow> }) => {
    const t = useTranslations("Admin.users");
    const columns = columnHelper.columns([
        columnHelper.accessor("name", {
            cell: ({ row }) => <UserIdentity user={ row.original } />,
            filterFn: (row, _, value) =>
                [ row.original.email, row.original.name, row.original.username ?? "" ].some(field =>
                    field.toLocaleLowerCase().includes(String(value).toLocaleLowerCase()),
                ),
            header: ({ column }) => <SortButton column={ column }>{t("user")}</SortButton>,
        }),
        columnHelper.accessor("role", {
            cell: ({ row }) => <RoleBadge role={ row.original.role } />,
            header: ({ column }) => <SortButton column={ column }>{t("role")}</SortButton>,
        }),
        columnHelper.accessor(row => row._count.dailyResults, {
            cell: ({ getValue }) => <span className="font-mono tabular-nums">{getValue()}</span>,
            header: ({ column }) => <SortButton column={ column }>{t("dailyParticipations")}</SortButton>,
            id: "dailyResults",
        }),
        columnHelper.accessor("banned", {
            cell: ({ row }) => <BanStatus user={ row.original } />,
            header: ({ column }) => <SortButton column={ column }>{t("status")}</SortButton>,
        }),
        columnHelper.display({
            cell: ({ row }) => <UserRowActions currentUserId={ currentUserId } user={ row.original } />,
            header: t("actions"),
            id: "actions",
        }),
    ]);
    const table = useTable({ columns, data: users, features });

    return (
        <section className="flex flex-col flex-1 gap-6 min-w-0">
            <div>
                <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("eyebrow")}</p>
                <h1 className="mt-2 font-bold text-3xl tracking-tight">{t("title")}</h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">{t("description")}</p>
            </div>
            <div className="border rounded-xl">
                <div className="p-4 border-b">
                    <Input
                        className="max-w-sm"
                        onChange={ event => table.getColumn("name")?.setFilterValue(event.target.value) }
                        placeholder={ t("search") }
                    />
                </div>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={ headerGroup.id }>
                                {headerGroup.headers.map(header => (
                                    <TableHead className={ header.column.id === "actions" ? "text-right" : undefined } key={ header.id }>
                                        {header.isPlaceholder ? null : <table.FlexRender header={ header } />}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={ row.id }>
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
                    </TableBody>
                </Table>
            </div>
            {table.getPageCount() > 1 && (
                <div className="flex justify-end gap-2">
                    <Button disabled={ !table.getCanPreviousPage() } onClick={ () => table.previousPage() } size="sm" variant="outline">
                        {t("previousPage")}
                    </Button>
                    <Button disabled={ !table.getCanNextPage() } onClick={ () => table.nextPage() } size="sm" variant="outline">
                        {t("nextPage")}
                    </Button>
                </div>
            )}
        </section>
    );
};

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

const UserIdentity = ({ user }: { user: UserTableRow }) => {
    const content = (
        <>
            <Avatar>
                <AvatarImage alt={ user.username ?? user.name } src={ user.image ?? undefined } />
                <AvatarFallback>{user.username ? user.username.slice(0, 1) : user.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0">
                <span className="block font-medium truncate">{user.name}</span>
                <span className="block text-muted-foreground text-xs truncate">{user.username ? `@${ user.username }` : user.email}</span>
            </span>
        </>
    );

    return user.discordId ? (
        <Link className="flex items-center gap-3 hover:text-primary" href={ `/admin/users/${ user.discordId }` }>
            {content}
        </Link>
    ) : (
        <span className="flex items-center gap-3">{content}</span>
    );
};

const RoleBadge = ({ role }: { role: string }) => {
    const t = useTranslations("Admin.users");
    const normalizedRole = role.includes("admin") ? "admin" : role.includes("editor") ? "editor" : "user";
    const variant = normalizedRole === "admin" ? "default" : normalizedRole === "editor" ? "secondary" : "outline";

    return <Badge variant={ variant }>{t(`role${ normalizedRole.slice(0, 1).toUpperCase() }${ normalizedRole.slice(1) }`)}</Badge>;
};

const BanStatus = ({ user }: { user: UserTableRow }) => {
    const t = useTranslations("Admin.users");

    return user.banned ? <Badge variant="destructive">{t("banned")}</Badge> : <Badge variant="outline">{t("active")}</Badge>;
};

const UserRowActions = ({ currentUserId, user }: { currentUserId?: string; user: UserTableRow }) => {
    const t = useTranslations("Admin.users");
    const router = useRouter();
    const [ feedback, setFeedback ] = useState<string>();
    const [ banOpen, setBanOpen ] = useState(false);
    const [ revokeSessionsOpen, setRevokeSessionsOpen ] = useState(false);
    const [ reasonOpen, setReasonOpen ] = useState(false);
    const [ roleOpen, setRoleOpen ] = useState(false);
    const [ reason, setReason ] = useState("");
    const [ banDuration, setBanDuration ] = useState("");
    const [ banDurationUnit, setBanDurationUnit ] = useState<BanDurationUnit>("hour");
    const [ banExpiryDate, setBanExpiryDate ] = useState<Date>();
    const [ banExpiryMode, setBanExpiryMode ] = useState<BanExpiryMode>("permanent");
    const [ banExpiryTime, setBanExpiryTime ] = useState("12:00");
    const [ role, setRole ] = useState(user.role.includes("admin") ? "admin" : user.role.includes("editor") ? "editor" : "user");
    const [ isPending, startTransition ] = useTransition();
    const banExpiryLabels: Record<BanExpiryMode, string> = {
        date: t("banExpiryDate"),
        duration: t("banExpiryDuration"),
        permanent: t("banExpiryPermanent"),
    };
    const banDurationUnitLabels: Record<BanDurationUnit, string> = {
        hour: t("banDurationHours"),
        minute: t("banDurationMinutes"),
        second: t("banDurationSeconds"),
    };
    const canManageRole = currentUserId !== user.id && !user.isProtected;
    const canBan = currentUserId !== user.id && !user.isProtected;

    const runAction = (action: () => Promise<void>, onSuccess?: () => void) => {
        setFeedback(undefined);
        startTransition(async () => {
            try {
                await action();
                onSuccess?.();
                router.refresh();
            } catch {
                setFeedback(t("actionError"));
            }
        });
    };

    const resetBanForm = () => {
        setBanDuration("");
        setBanDurationUnit("hour");
        setBanExpiryDate(undefined);
        setBanExpiryMode("permanent");
        setBanExpiryTime("12:00");
        setFeedback(undefined);
        setReason("");
    };

    const getBanExpiresIn = () => {
        if (banExpiryMode === "permanent") return undefined;

        if (banExpiryMode === "duration") {
            const duration = Number(banDuration);
            if (!Number.isInteger(duration) || duration < 1) return null;
            return duration * banDurationMultipliers[banDurationUnit];
        }

        if (!banExpiryDate) return null;
        const [ hours, minutes ] = banExpiryTime.split(":").map(Number);
        const expiration = new Date(banExpiryDate);
        expiration.setHours(hours, minutes, 0, 0);
        const secondsUntilExpiration = Math.ceil((expiration.getTime() - Date.now()) / 1000);

        return secondsUntilExpiration > 0 ? secondsUntilExpiration : null;
    };

    const submitBan = () => {
        const banExpiresIn = getBanExpiresIn();

        if (banExpiresIn === null) {
            setFeedback(t(banExpiryMode === "date" ? "banDateInvalid" : "banDurationInvalid"));
            return;
        }

        runAction(
            () =>
                banUserAction({
                    banExpiresIn,
                    discordId: user.discordId ?? undefined,
                    reason,
                    userId: user.id,
                }),
            () => {
                resetBanForm();
                setBanOpen(false);
            },
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger aria-label={ t("actions") } render={ <Button size="icon-sm" variant="ghost" /> }>
                    <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-64">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                        {user.discordId && (
                            <DropdownMenuItem render={ <Link href={ `/admin/users/${ user.discordId }` } /> }>
                                <Eye />
                                {t("viewProfile")}
                            </DropdownMenuItem>
                        )}
                        {canManageRole && (
                            <DropdownMenuItem onClick={ () => setRoleOpen(true) }>
                                <ShieldCheck />
                                {t("changeRole")}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={ () => setRevokeSessionsOpen(true) }>
                            <LogOut />
                            {t("revokeSessions")}
                        </DropdownMenuItem>
                        {(canManageRole || canBan || user.banned) && <DropdownMenuSeparator />}
                        {user.banned ? (
                            <>
                                <DropdownMenuItem onClick={ () => setReasonOpen(true) }>
                                    <Eye />
                                    {t("viewBanReason")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={ isPending }
                                    onClick={ () => runAction(() => unbanUserAction({ discordId: user.discordId ?? undefined, userId: user.id })) }
                                >
                                    <Check />
                                    {t("unban")}
                                </DropdownMenuItem>
                            </>
                        ) : (
                            canBan && (
                                <DropdownMenuItem onClick={ () => setBanOpen(true) } variant="destructive">
                                    <Ban />
                                    {t("ban")}
                                </DropdownMenuItem>
                            )
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog onOpenChange={ setRoleOpen } open={ roleOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("changeRoleTitle")}</DialogTitle>
                        <DialogDescription>{t("changeRoleDescription", { name: user.name })}</DialogDescription>
                    </DialogHeader>
                    <Field>
                        <FieldLabel htmlFor={ `role-${ user.id }` }>{t("role")}</FieldLabel>
                        <Select onValueChange={ value => value && setRole(value) } value={ role }>
                            <SelectTrigger className="w-full" id={ `role-${ user.id }` }>
                                <SelectValue>{t(`role${ role.slice(0, 1).toUpperCase() }${ role.slice(1) }`)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">{t("roleUser")}</SelectItem>
                                <SelectItem value="editor">{t("roleEditor")}</SelectItem>
                                <SelectItem value="admin">{t("roleAdmin")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <DialogFooter>
                        <DialogClose render={ <Button type="button" variant="outline" /> }>{t("cancel")}</DialogClose>
                        <Button
                            disabled={ isPending }
                            onClick={ () =>
                                runAction(
                                    () =>
                                        setUserRoleAction({
                                            discordId: user.discordId ?? undefined,
                                            role: role as "admin" | "editor" | "user",
                                            userId: user.id,
                                        }),
                                    () => setRoleOpen(false),
                                )
                            }
                            type="button"
                        >
                            {t("save")}
                        </Button>
                    </DialogFooter>
                    {feedback && (
                        <p className="text-destructive text-sm" role="alert">
                            {feedback}
                        </p>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog onOpenChange={ open => {
                setBanOpen(open);
                if (!open) resetBanForm();
            } } open={ banOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("banTitle")}</DialogTitle>
                        <DialogDescription>{t("banDescription", { name: user.name })}</DialogDescription>
                    </DialogHeader>
                    <Field>
                        <FieldLabel htmlFor={ `ban-reason-${ user.id }` }>{t("banReason")}</FieldLabel>
                        <Input id={ `ban-reason-${ user.id }` } onChange={ event => setReason(event.target.value) } value={ reason } />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={ `ban-expiry-mode-${ user.id }` }>{t("banExpiryMode")}</FieldLabel>
                        <Select onValueChange={ value => value && setBanExpiryMode(value as BanExpiryMode) } value={ banExpiryMode }>
                            <SelectTrigger className="w-full" id={ `ban-expiry-mode-${ user.id }` }>
                                <SelectValue>{banExpiryLabels[banExpiryMode]}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="permanent">{t("banExpiryPermanent")}</SelectItem>
                                <SelectItem value="duration">{t("banExpiryDuration")}</SelectItem>
                                <SelectItem value="date">{t("banExpiryDate")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    {banExpiryMode === "duration" && (
                        <Field>
                            <FieldLabel htmlFor={ `ban-duration-${ user.id }` }>{t("banDuration")}</FieldLabel>
                            <div className="grid grid-cols-[minmax(0,1fr)_9rem] gap-2">
                                <Input
                                    id={ `ban-duration-${ user.id }` }
                                    min={ 1 }
                                    onChange={ event => setBanDuration(event.target.value) }
                                    type="number"
                                    value={ banDuration }
                                />
                                <Select onValueChange={ value => value && setBanDurationUnit(value as BanDurationUnit) } value={ banDurationUnit }>
                                    <SelectTrigger aria-label={ t("banDurationUnit") }>
                                        <SelectValue>{banDurationUnitLabels[banDurationUnit]}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="second">{t("banDurationSeconds")}</SelectItem>
                                        <SelectItem value="minute">{t("banDurationMinutes")}</SelectItem>
                                        <SelectItem value="hour">{t("banDurationHours")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </Field>
                    )}
                    {banExpiryMode === "date" && (
                        <div className="gap-3 grid sm:grid-cols-[minmax(0,1fr)_8rem]">
                            <Field>
                                <FieldLabel>{t("banDate")}</FieldLabel>
                                <Popover>
                                    <PopoverTrigger render={ <Button className="justify-start w-full font-normal" type="button" variant="outline" /> }>
                                        <CalendarDays aria-hidden="true" />
                                        {banExpiryDate ? dateFormatter.format(banExpiryDate) : t("banDatePlaceholder")}
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="w-auto p-0">
                                        <Calendar
                                            disabled={ date => date < getStartOfToday() }
                                            locale={ fr }
                                            mode="single"
                                            onSelect={ setBanExpiryDate }
                                            selected={ banExpiryDate }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor={ `ban-expiry-time-${ user.id }` }>{t("banTime")}</FieldLabel>
                                <Input
                                    id={ `ban-expiry-time-${ user.id }` }
                                    onChange={ event => setBanExpiryTime(event.target.value) }
                                    type="time"
                                    value={ banExpiryTime }
                                />
                            </Field>
                        </div>
                    )}
                    {feedback && <FieldError>{feedback}</FieldError>}
                    <DialogFooter>
                        <DialogClose render={ <Button type="button" variant="outline" /> }>{t("cancel")}</DialogClose>
                        <Button
                            disabled={ isPending || !reason.trim() }
                            onClick={ submitBan }
                            type="button"
                            variant="destructive"
                        >
                            {t("ban")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog onOpenChange={ setRevokeSessionsOpen } open={ revokeSessionsOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("revokeSessionsTitle")}</DialogTitle>
                        <DialogDescription>{t("revokeSessionsDescription", { name: user.name })}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose render={ <Button type="button" variant="outline" /> }>{t("cancel")}</DialogClose>
                        <Button
                            disabled={ isPending }
                            onClick={ () =>
                                runAction(
                                    () => revokeUserSessionsAction({ discordId: user.discordId ?? undefined, userId: user.id }),
                                    () => setRevokeSessionsOpen(false),
                                )
                            }
                            type="button"
                            variant="destructive"
                        >
                            {t("revokeSessions")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog onOpenChange={ setReasonOpen } open={ reasonOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("banReasonTitle")}</DialogTitle>
                        <DialogDescription>{t("banReasonDescription", { name: user.name })}</DialogDescription>
                    </DialogHeader>
                    <div className="gap-3 grid">
                        <p className="bg-muted p-3 rounded-lg">{user.banReason ?? t("noBanReason")}</p>
                        <p className="font-medium text-sm">
                            {user.banExpires ? t("banExpires", { date: dateTimeFormatter.format(user.banExpires) }) : t("banPermanent")}
                        </p>
                    </div>
                    <DialogFooter>
                        <DialogClose render={ <Button type="button" /> }>{t("close")}</DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
