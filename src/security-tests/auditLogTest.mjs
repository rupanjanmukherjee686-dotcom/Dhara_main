import {
  createAuditRecord,
  verifyAuditLog
} from "../src/security/corrections/auditLog.js";

console.log("");
console.log("========================================");
console.log("        DHARA AUDIT LOG TEST");
console.log("========================================");

// Create first audit record
const record1 = createAuditRecord({
  action: "PROJECT_PROPOSAL_SUBMITTED",
  userId: "COMPANY-001",
  userRole: "COMPANY",
  documentId: "DOC-001",
  details: {
    project: "Pune Logistics Hub"
  }
});

// Create second record linked to first
const record2 = createAuditRecord({
  action: "DISTRICT_PROPOSAL_ACCEPTED",
  userId: "DISTRICT-001",
  userRole: "DISTRICT_AUTHORITY",
  documentId: "DOC-001",
  details: {
    status: "ACCEPTED"
  },
  previousRecord: record1
});

// Create third record linked to second
const record3 = createAuditRecord({
  action: "FIELD_VERIFICATION_COMPLETED",
  userId: "FIELD-001",
  userRole: "FIELD_OFFICER",
  documentId: "DOC-001",
  details: {
    landArea: "248 acres"
  },
  previousRecord: record2
});

const auditLog = [
  record1,
  record2,
  record3
];

console.log("\n1. Created audit records");
console.log("----------------------------------------");

console.log("Record 1:", record1.action);
console.log("Record 2:", record2.action);
console.log("Record 3:", record3.action);

console.log("\n2. Verifying original audit log");
console.log("----------------------------------------");

const result = verifyAuditLog(auditLog);

console.log(result);

if (result.valid) {
  console.log("\n✅ AUDIT LOG VALID");
  console.log("All records are intact.");
} else {
  console.log("\n❌ AUDIT LOG INVALID");
}

console.log("\n========================================");
console.log("              TEST COMPLETE");
console.log("========================================\n");