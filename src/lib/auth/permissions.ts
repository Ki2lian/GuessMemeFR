import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const catalogActions = [ "create", "update", "publish", "archive" ] as const;
const mediaActions = [ "upload", "delete" ] as const;

export const accessControl = createAccessControl({
    ...defaultStatements,
    catalog: catalogActions,
    media: mediaActions,
});

export const userRole = accessControl.newRole({});

export const editorRole = accessControl.newRole({
    catalog: catalogActions,
    media: mediaActions,
});

export const adminRole = accessControl.newRole({
    catalog: catalogActions,
    media: mediaActions,
    session: adminAc.statements.session,
    user: [ "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "set-email", "get", "update" ],
});
