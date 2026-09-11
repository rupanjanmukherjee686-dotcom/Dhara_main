import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const filePath = "./security-tests/test-document.txt";

function fingerprint(data) {
  return createHash("sha256")
    .update(data)
    .digest("hex");
}

// ------------------------------------------
// 1. Read original document
// ------------------------------------------

const originalDocument = await readFile(filePath);

const originalFingerprint =
  fingerprint(originalDocument);

console.log("\n========================================");
console.log("       DHARA DOCUMENT TAMPER TEST");
console.log("========================================");

console.log("\n1. Original document fingerprint");
console.log("----------------------------------------");
console.log(originalFingerprint);


// ------------------------------------------
// 2. Tamper with document
// ------------------------------------------

console.log("\n2. Tampering with document");
console.log("----------------------------------------");

await writeFile(
  filePath,
  Buffer.concat([
    originalDocument,
    Buffer.from("\nTAMPERED DATA")
  ])
);

console.log("Land Area: 248 acres → 500 acres");
console.log("Document modified.");


// ------------------------------------------
// 3. Read modified document
// ------------------------------------------

const tamperedDocument =
  await readFile(filePath);

const tamperedFingerprint =
  fingerprint(tamperedDocument);


// ------------------------------------------
// 4. Verify
// ------------------------------------------

console.log("\n3. Verifying TAMPERED document");
console.log("----------------------------------------");

console.log("Original fingerprint:");
console.log(originalFingerprint);

console.log("\nCurrent fingerprint:");
console.log(tamperedFingerprint);

console.log("\n----------------------------------------");

if (originalFingerprint !== tamperedFingerprint) {
  console.log("✅ TAMPERING DETECTED");
  console.log("❌ ORIGINAL FINGERPRINT DOES NOT MATCH");
} else {
  console.log("❌ SECURITY FAILURE");
  console.log("Document tampering was not detected.");
}

console.log("\n========================================");
console.log("              TEST COMPLETE");
console.log("========================================\n");


// ------------------------------------------
// 5. Restore original document
// ------------------------------------------

await writeFile(
  filePath,
  originalDocument
);

console.log("Test document restored to original state.");