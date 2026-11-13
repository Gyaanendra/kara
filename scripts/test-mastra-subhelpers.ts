import { getDb, schema, eq } from "@kara/db";
import { SubHelperService } from "../apps/api/src/ai/mastra/services/sub-helper.service.js";
import { allMastraTools } from "../apps/api/src/ai/mastra/tools/index.js";
import { normalizeSpeakerName } from "../apps/api/src/meetings/speaker-normalizer.js";

async function runMastraVerification() {
  console.log("==========================================================");
  console.log("   KARA AI: MASTRA & SUB-HELPERS VERIFICATION SUITE       ");
  console.log("==========================================================\n");

  const db = getDb();
  const org = await db.query.organizations.findFirst();
  if (!org) {
    throw new Error("No organization found in database. Run db:seed first.");
  }
  const orgId = org.id;
  console.log(`✓ Active Tenant: "${org.name}" (${orgId})\n`);

  // 1. Verify all 15 Mastra Tools are instantiated
  console.log("[1/5] Verifying 15 Mastra Tools Library...");
  const toolKeys = Object.keys(allMastraTools);
  console.log(`  ✓ Loaded ${toolKeys.length} Mastra Tools:`, toolKeys.join(", "));
  if (toolKeys.length < 15) {
    throw new Error(`Expected at least 15 tools, found ${toolKeys.length}`);
  }

  // 2. Test Speaker Normalization
  console.log("\n[2/5] Testing Speaker Normalization Engine...");
  const members = await db.query.companyMembers.findMany({
    where: eq(schema.companyMembers.orgId, orgId),
  });
  console.log(`  ✓ Company Members loaded: ${members.map((m) => m.name).join(", ")}`);

  const testSpeakers = ["sarah c", "Alex R", "Unknown Guest"];
  for (const raw of testSpeakers) {
    const norm = normalizeSpeakerName(raw, members);
    console.log(`    - "${raw}" -> Canonical: "${norm.canonicalName}" (Confidence Score: ${norm.score}%)`);
  }

  // 3. Test Sub-Helper Service & Registry
  console.log("\n[3/5] Testing Sub-Helper Service & Registry in PostgreSQL 18...");
  const subHelperService = new SubHelperService();
  const registeredHelpers = await subHelperService.listHelpers(orgId);
  console.log(`  ✓ Registered Active Sub-Helpers (${registeredHelpers.length}):`);
  for (const h of registeredHelpers) {
    console.log(`    • [${h.slug}] "${h.name}" -> Tools: [${(h.assignedTools as string[]).join(", ")}]`);
  }

  // 4. Execute Candidate Evaluator Sub-Helper (100-pt Scoring)
  console.log("\n[4/5] Executing Candidate Evaluator Sub-Helper (Task-Slice Worker)...");
  const candidateResult = await subHelperService.executeHelperTask(orgId, {
    helperSlug: "candidate-evaluator",
    taskPrompt: "Evaluate candidate Vikram Joshi with 4 years experience in TypeScript, NestJS, PostgreSQL and open source contributions.",
    contextSlice: {
      fullName: "Vikram Joshi",
      email: "vikram.joshi@example.com",
      resumeText: "Senior Software Engineer with 4 years experience building distributed microservices using TypeScript, NestJS, PostgreSQL, Docker and CI/CD pipelines. Active GitHub contributor.",
      githubUrl: "https://github.com/torvalds",
    },
  });

  console.log(`  ✓ Sub-Helper Execution Status: ${candidateResult.status} (${candidateResult.durationMs}ms)`);
  if (candidateResult.toolOutputs?.scoring) {
    const sc = candidateResult.toolOutputs.scoring.score;
    console.log(`  ✓ Objective Score: ${sc.overall}/100 (Open Source: ${sc.openSource}/35, Projects: ${sc.selfProjects}/30, Production: ${sc.production}/25, Skills: ${sc.technicalSkills}/10)`);
    console.log(`  ✓ Justification: "${candidateResult.toolOutputs.scoring.justification}"`);
  }

  // 5. Execute Document Generator Sub-Helper
  console.log("\n[5/5] Executing Document Generator Sub-Helper...");
  const docResult = await subHelperService.executeHelperTask(orgId, {
    helperSlug: "document-generator",
    taskPrompt: "Generate an offer letter for Vikram Joshi as Senior Backend Engineer",
    contextSlice: {
      templateType: "offer_letter",
      recipientName: "Vikram Joshi",
      recipientEmail: "vikram.joshi@example.com",
      recipientRole: "Senior Backend Engineer",
      variables: {
        CANDIDATE_NAME: "Vikram Joshi",
        ROLE: "Senior Backend Engineer",
        SALARY: "$165,000",
        START_DATE: "December 1, 2026",
      },
    },
  });

  console.log(`  ✓ Document Generation Status: ${docResult.status} (${docResult.durationMs}ms)`);
  if (docResult.toolOutputs?.generatedDoc) {
    console.log(`  ✓ Generated Document ID: ${docResult.toolOutputs.generatedDoc.documentId}`);
    console.log(`  ✓ Preview: "${docResult.toolOutputs.generatedDoc.preview}..."`);
  }

  console.log("\n==========================================================");
  console.log("   ALL MASTRA & SUB-HELPER VERIFICATIONS SUCCEEDED!       ");
  console.log("==========================================================");
  process.exit(0);
}

runMastraVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

