import { notFound } from "next/navigation";

import { requireAdminAccess } from "@/lib/auth/authorization";

export default async function AdminUsersLayout({ children }: { children: React.ReactNode }) {
    try {
        await requireAdminAccess();
    } catch {
        notFound();
    }

    return children;
}
