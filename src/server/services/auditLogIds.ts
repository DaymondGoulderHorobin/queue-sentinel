const randomIdSuffix = () => {
  const randomUuid = globalThis.crypto?.randomUUID?.();

  if (randomUuid) {
    return randomUuid;
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

export const createAuditLogEntryId = (timestamp: string) =>
  `audit-${Date.parse(timestamp)}-${randomIdSuffix()}`;
