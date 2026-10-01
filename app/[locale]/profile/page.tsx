import { useTranslations } from "next-intl";

import { PagePlaceholder } from "@/components/site/page-placeholder";

export default function ProfilePage() {
    const t = useTranslations("Pages.profile");

    return <PagePlaceholder description={ t("description") } title={ t("title") } />;
}
