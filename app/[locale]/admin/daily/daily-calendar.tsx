"use client";

import { fr } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { dateKeyToLocalDate, localDateToDateKey } from "@/lib/date";
import { ROUTES } from "@/routes";

export const DailyCalendar = ({ availableDates, selectedDate }: { availableDates: Array<string>; selectedDate?: string }) => {
    const router = useRouter();
    const t = useTranslations("Admin.daily");
    const availableDateSet = new Set(availableDates);
    const [ open, setOpen ] = useState(false);

    return (
        <Dialog onOpenChange={ setOpen } open={ open }>
            <DialogTrigger render={ <Button variant="outline" /> }>
                <CalendarDays aria-hidden="true" />
                {t("changeDate")}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("selectDate")}</DialogTitle>
                    <DialogDescription>{t("selectDateDescription")}</DialogDescription>
                </DialogHeader>
                <div className="border rounded-xl w-full">
                    <Calendar
                        className="w-full"
                        classNames={{ root: "w-full" }}
                        defaultMonth={ selectedDate ? dateKeyToLocalDate(selectedDate) : undefined }
                        disabled={ date => !availableDateSet.has(localDateToDateKey(date)) }
                        locale={ fr }
                        mode="single"
                        onSelect={ date => {
                            if (date) {
                                setOpen(false);
                                router.push(`${ ROUTES.admin }/daily?date=${ localDateToDateKey(date) }`);
                            }
                        } }
                        selected={ selectedDate ? dateKeyToLocalDate(selectedDate) : undefined }
                    />
                    <p className="mt-4 px-4 pb-4 text-muted-foreground text-xs">{t("calendarHint")}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
