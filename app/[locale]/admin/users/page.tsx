import { UsersDataTable } from "@/app/admin/users/users-data-table";
import { userRepository } from "@/data/UserRepository";
import { getSession } from "@/lib/auth/session";
import { env } from "@/lib/env";

export default async function AdminUsersPage() {
    const [ session, users ] = await Promise.all([ getSession(), userRepository.listForAdmin() ]);
    const tableUsers = users.map(user => ({
        ...user,
        isProtected: user.discordId === env.PROTECTED_ADMIN_DISCORD_ID,
    }));

    return <UsersDataTable currentUserId={ session?.user.id } users={ tableUsers } />;
}
