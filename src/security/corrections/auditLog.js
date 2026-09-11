import { sha256 } from "../hashing/sha256.js";

/**
 * Create an immutable audit record.
 *
 * Every new record contains the hash of the
 * previous record, creating an append-only chain.
 */
export function createAuditRecord({
  action,
  userId,
  userRole,
  documentId,
  details = {},
  previousRecord = null,
}) {
  if (!action) {
    throw new Error("Audit action is required");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }

  const record = {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`,

    timestamp: new Date().toISOString(),

    action,

    userId,

    userRole,

    documentId,

    details,

    previousHash: previousRecord
      ? previousRecord.hash
      : null,
  };

  record.hash = sha256(
    JSON.stringify(record)
  );

  return Object.freeze(record);
}


/**
 * Verify the integrity of the audit history.
 */
export function verifyAuditLog(records) {
  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    const recalculatedHash = sha256(
      JSON.stringify({
        id: record.id,
        timestamp: record.timestamp,
        action: record.action,
        userId: record.userId,
        userRole: record.userRole,
        documentId: record.documentId,
        details: record.details,
        previousHash: record.previousHash,
      })
    );

    // Check that the record itself wasn't changed.
    if (record.hash !== recalculatedHash) {
      return {
        valid: false,
        record: i,
        reason: "RECORD_TAMPERED",
      };
    }

    // Check that the record still points
    // to the correct previous record.
    if (i > 0) {
      const previousRecord = records[i - 1];

      if (
        record.previousHash !==
        previousRecord.hash
      ) {
        return {
          valid: false,
          record: i,
          reason: "CHAIN_BROKEN",
        };
      }
    }
  }

  return {
    valid: true,
    recordsChecked: records.length,
  };
}