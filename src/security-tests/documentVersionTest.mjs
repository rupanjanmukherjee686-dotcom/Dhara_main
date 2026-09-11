import {
  createDocumentVersion,
  verifyDocumentVersion
} from "../src/security/documents/documentVersion.js";

const documentV1 = `
DHARA PROJECT
Land Area: 248 acres
Parcels: 42
District: Pune
`;

const version1 = createDocumentVersion({
  documentId: "DOC-001",
  versionNumber: 1,
  content: documentV1,
  createdBy: "DISTRICT-AUTHORITY"
});

console.log("================================");
console.log("DHARA DOCUMENT VERSION TEST");
console.log("================================");

console.log("\nVersion created:");
console.log("Document:", version1.documentId);
console.log("Version:", version1.versionNumber);
console.log("Fingerprint:", version1.fingerprint);

console.log("\nVerifying original document...");

const result1 = verifyDocumentVersion(
  documentV1,
  version1
);

console.log("Valid:", result1.valid);

if (result1.valid) {
  console.log("✅ ORIGINAL VERSION VERIFIED");
}

// Tamper with the document
const tamperedDocument = `
DHARA PROJECT
Land Area: 500 acres
Parcels: 42
District: Pune
`;

console.log("\nTampering with document...");
console.log("248 acres → 500 acres");

const result2 = verifyDocumentVersion(
  tamperedDocument,
  version1
);

console.log("\nVerifying tampered document...");
console.log("Valid:", result2.valid);

if (!result2.valid) {
  console.log("🚨 TAMPERING DETECTED");
  console.log("❌ DOCUMENT VERSION INTEGRITY FAILED");
}

console.log("\n================================");
console.log("TEST COMPLETE");
console.log("================================");