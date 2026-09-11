import CryptoJS from "crypto-js";

/**
 * Generate a cryptographic fingerprint for document content.
 */
function generateFingerprint(content) {
  if (typeof content !== "string") {
    throw new TypeError("Document content must be a string");
  }

  return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex);
}

/**
 * Create a new document version record.
 */
export function createDocumentVersion({
  documentId,
  versionNumber,
  content,
  createdBy,
}) {
  if (!documentId) {
    throw new Error("documentId is required");
  }

  if (!versionNumber) {
    throw new Error("versionNumber is required");
  }

  if (typeof content !== "string") {
    throw new TypeError("Document content must be a string");
  }

  const fingerprint = generateFingerprint(content);

  return {
    documentId,
    versionNumber,
    fingerprint,
    createdBy,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Verify that a document version has not been modified.
 */
export function verifyDocumentVersion(
  content,
  storedVersion
) {
  if (typeof content !== "string") {
    throw new TypeError("Document content must be a string");
  }

  if (!storedVersion || !storedVersion.fingerprint) {
    throw new Error("Stored document version is required");
  }

  const currentFingerprint =
    generateFingerprint(content);

  return {
    valid:
      currentFingerprint === storedVersion.fingerprint,

    documentId: storedVersion.documentId,

    versionNumber:
      storedVersion.versionNumber,

    expectedFingerprint:
      storedVersion.fingerprint,

    currentFingerprint,
  };
}