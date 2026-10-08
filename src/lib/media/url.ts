export const getMediaUrl = (storageKey: string) => `/api/media/${ encodeURIComponent(storageKey) }`;
