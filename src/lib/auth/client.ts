import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { Auth } from "@/types/auth";

export const authClient = createAuthClient({
    plugins: [ adminClient(), inferAdditionalFields<Auth>() ],
});
