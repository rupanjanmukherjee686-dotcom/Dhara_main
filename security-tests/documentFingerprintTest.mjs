import {
  generateDocumentFingerprint,
  verifyDocumentFingerprint,
} from "../src/security/documents/documentFingerprint.js";

console.log("\n========================================");
console.log("     DHARA DOCUMENT INTEGRITY TEST");
console.log("========================================\n");

const originalDocument = `
LAND ACQUISITION NOTIFICATION

Project: Pune Integrated Logistics Hub
District: Pune
Land Area: 248 acres
Parcels: 42
Status: Preliminary Notification
`;

console.log("1. Generating document fingerprint...\n");

const fingerprint =
  generateDocumentFingerprint(originalDocument);

console.log("Document fingerprint:");
console.log(fingerprint);

console.log("\n----------------------------------------");
console.log("2. Verifying ORIGINAL document");
console.log("----------------------------------------\n");

const originalVerification =
  verifyDocumentFingerprint(
    originalDocument,
    fingerprint
  );

console.log(originalVerification);

if (originalVerification.valid) {
  console.log("\n✓ DOCUMENT INTEGRITY VERIFIED");
} else {
  console.log("\n✗ DOCUMENT INTEGRITY FAILED");
}

console.log("\n----------------------------------------");
console.log("3. TAMPERING WITH DOCUMENT");
console.log("----------------------------------------\n");

const tamperedDocument = `
LAND ACQUISITION NOTIFICATION

Project: Pune Integrated Logistics Hub
District: Pune
Land Area: 500 acres
Parcels: 42
Status: Preliminary Notification
`;

console.log("Changed:");
console.log("Land Area: 248 acres → 500 acres");

console.log("\n----------------------------------------");
console.log("4. Verifying TAMPERED document");
console.log("----------------------------------------\n");

const tamperedVerification =
  verifyDocumentFingerprint(
    tamperedDocument,
    fingerprint
  );

console.log(tamperedVerification);

if (tamperedVerification.valid) {
  console.log("\n✗ SECURITY FAILURE — TAMPER NOT DETECTED");
} else {
  console.log("\n✓ TAMPERING DETECTED");
  console.log("✓ ORIGINAL FINGERPRINT DOES NOT MATCH");
}

console.log("\n========================================");
console.log("           TEST COMPLETE");
console.log("========================================\n");