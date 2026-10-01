import { useTranslations } from "next-intl";

import { PagePlaceholder } from "@/components/site/page-placeholder";

export default function AdminPage() {
    const t = useTranslations("Pages.admin");

    return <PagePlaceholder description={ t("description") } title={ t("title") } />;
}
