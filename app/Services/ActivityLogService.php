<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogService
{
    public function log(?int $userId, string $action, string $entity, ?int $entityId = null, ?string $details = null): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'entity' => $entity,
            'entity_id' => $entityId,
            'details' => $details,
            'created_at' => now(),
        ]);
    }
}
