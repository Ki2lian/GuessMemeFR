import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export const useIsMobile = () => {
    const query = `(max-width: ${ MOBILE_BREAKPOINT - 1 }px)`;

    const getMatch = () => typeof window !== "undefined" && window.matchMedia(query).matches;

    const [ isMobile, setIsMobile ] = useState(getMatch);

    useEffect(() => {
        const mql = window.matchMedia(query);

        const onChange = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches);
        };

        mql.addEventListener("change", onChange);

        return () => mql.removeEventListener("change", onChange);
    }, [ query ]);

    return !!isMobile;
};
