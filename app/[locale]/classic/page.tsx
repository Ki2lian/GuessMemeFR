import { useTranslations } from "next-intl";

import { PagePlaceholder } from "@/components/site/page-placeholder";

export default function ClassicPage() {
    const t = useTranslations("Pages.classic");

    return <PagePlaceholder description={ t("description") } title={ t("title") } />;
}
