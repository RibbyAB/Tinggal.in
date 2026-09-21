function logActivity(client, { userId = null, action, entity, entityId = null, details = null }) {
  return client.activityLog.create({
    data: { userId, action, entity, entityId, details },
  });
}

module.exports = { logActivity };
