/**
 * Generate a SHA-256 fingerprint for an actual file.
 *
 * Works with PDFs, images, maps, documents, etc.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function generateDocumentFingerprint(file) {
  if (!(file instanceof File)) {
    throw new TypeError("Input must be a File");
  }

  const buffer = await file.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    buffer
  );

  const hashArray = Array.from(
    new Uint8Array(hashBuffer)
  );

  return hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}


/**
 * Verify a file against a previously stored fingerprint.
 *
 * @param {File} file
 * @param {string} expectedFingerprint
 * @returns {Promise<object>}
 */
export async function verifyDocumentFingerprint(
  file,
  expectedFingerprint
) {
  const currentFingerprint =
    await generateDocumentFingerprint(file);

  return {
    valid:
      currentFingerprint === expectedFingerprint,

    expectedFingerprint,

    currentFingerprint,
  };
}