import { useTranslations } from "next-intl";

import { PagePlaceholder } from "@/components/site/page-placeholder";

export default function DailyPage() {
    const t = useTranslations("Pages.daily");

    return <PagePlaceholder description={ t("description") } title={ t("title") } />;
}
