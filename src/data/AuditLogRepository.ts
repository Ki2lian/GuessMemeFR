import { AuditEventType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export class AuditLogRepository {
    async recordAuthEvent(event: AuditEventType, userId: string) {
        await prisma.auditLog.create({
            data: {
                actorUserId: userId,
                event,
                subjectUserId: userId,
            },
        });
    }
}

export const auditLogRepository = new AuditLogRepository();
