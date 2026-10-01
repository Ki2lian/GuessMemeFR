import { useTranslations } from "next-intl";

import { PagePlaceholder } from "@/components/site/page-placeholder";

export default function LoginPage() {
    const t = useTranslations("Pages.login");

    return <PagePlaceholder description={ t("description") } title={ t("title") } />;
}
