export const PARIS_TIME_ZONE = "Europe/Paris";

const getPart = (date: Date, type: Intl.DateTimeFormatPartTypes) => {
    const part = new Intl.DateTimeFormat("en-CA", {
        day: "2-digit",
        month: "2-digit",
        timeZone: PARIS_TIME_ZONE,
        year: "numeric",
    })
        .formatToParts(date)
        .find(item => item.type === type)?.value;

    if (!part) {
        throw new Error(`Missing ${ type } date part.`);
    }

    return part;
};

export const getParisDateKey = (date = new Date()) => `${ getPart(date, "year") }-${ getPart(date, "month") }-${ getPart(date, "day") }`;

export const parisDateKeyToDate = (dateKey: string) => new Date(`${ dateKey }T00:00:00.000Z`);
