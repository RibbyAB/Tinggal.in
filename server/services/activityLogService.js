// Centralized helper for writing to ActivityLog. Accepts an optional Prisma
// transaction client (`tx`) so a log entry can be created inside the same
// transaction as the business operation it records - if the operation rolls
// back, the log entry rolls back with it, keeping the audit trail accurate.
function logActivity(client, { userId = null, action, entity, entityId = null, details = null }) {
  return client.activityLog.create({
    data: { userId, action, entity, entityId, details },
  });
}

module.exports = { logActivity };
