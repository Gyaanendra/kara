import { eq } from "drizzle-orm";
import { getDb, schema, closeDb } from "./index.js";
import {
  ActionItemStatus,
  CustomFieldType,
  MeetingPlatform,
  MeetingStatus,
  MeetingType,
  MomStatus,
  ParticipantRole,
  RecordingStatus,
  TaskPriority,
  TaskSource,
  TaskStatus,
  TranscriptStatus,
  UserRole,
  UtteranceType,
} from "@kara/shared-types";

export async function seed() {
  const db = getDb();
  console.log("Starting Kara database seed against PostgreSQL 18...");

  // 1. Organization
  const [org] = await db
    .insert(schema.organizations)
    .values({
      name: "Acme Corporation",
      slug: "acme-corp",
      domain: "acme.corp",
      plan: "BUSINESS",
      settings: { timezone: "America/New_York", defaultAiModel: "gpt-4o" },
    })
    .onConflictDoNothing()
    .returning();

  let orgId = org?.id;
  if (!orgId) {
    const existing = await db.query.organizations.findFirst({
      where: eq(schema.organizations.slug, "acme-corp"),
    });
    orgId = existing?.id ?? "org_default_seed";
  }

  // 2. Users
  const [adminUser] = await db
    .insert(schema.users)
    .values({
      email: "alex@acme.corp",
      name: "Alex Rivera",
      role: UserRole.ADMIN,
      timezone: "America/New_York",
    })
    .onConflictDoNothing()
    .returning();

  let adminId = adminUser?.id;
  if (!adminId) {
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.email, "alex@acme.corp"),
    });
    adminId = existing?.id ?? "usr_admin_seed";
  }

  const [devUser] = await db
    .insert(schema.users)
    .values({
      email: "sarah@acme.corp",
      name: "Sarah Chen",
      role: UserRole.MEMBER,
      timezone: "America/San_Francisco",
    })
    .onConflictDoNothing()
    .returning();

  let devId = devUser?.id;
  if (!devId) {
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.email, "sarah@acme.corp"),
    });
    devId = existing?.id ?? "usr_dev_seed";
  }

  // 3. Org Memberships
  await db
    .insert(schema.orgMemberships)
    .values([
      { orgId, userId: adminId, role: UserRole.ADMIN },
      { orgId, userId: devId, role: UserRole.MEMBER },
    ])
    .onConflictDoNothing();

  // 4. Sample Meeting
  const [meeting] = await db
    .insert(schema.meetings)
    .values({
      orgId,
      hostUserId: adminId,
      title: "Q3 Sprint Architecture & Roadmap Sync",
      description: "Weekly engineering sync discussing microservices and RAG stack",
      platform: MeetingPlatform.GOOGLE_MEET,
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      status: MeetingStatus.COMPLETED,
      meetingType: MeetingType.SPRINT_REVIEW,
      typeConfidence: 0.95,
      scheduledStartAt: new Date(Date.now() - 3600000 * 2),
      scheduledEndAt: new Date(Date.now() - 3600000),
      actualStartAt: new Date(Date.now() - 3600000 * 2),
      actualEndAt: new Date(Date.now() - 3600000),
    })
    .onConflictDoNothing()
    .returning();

  let meetingId = meeting?.id;
  if (!meetingId) {
    const existing = await db.query.meetings.findFirst({
      where: eq(schema.meetings.orgId, orgId),
    });
    meetingId = existing?.id ?? "meet_sample_seed";
  }

  // 5. Recording & Transcript
  const [recording] = await db
    .insert(schema.recordings)
    .values({
      orgId,
      meetingId,
      s3Bucket: "kara-recordings",
      s3Key: `recordings/${orgId}/${meetingId}/audio.webm`,
      status: RecordingStatus.UPLOADED,
      durationSeconds: 3600,
      mimeType: "audio/webm",
      fileSizeBytes: 45000000,
      uploadedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  const recordingId = recording?.id ?? "rec_sample_seed";

  const [transcript] = await db
    .insert(schema.transcripts)
    .values({
      orgId,
      meetingId,
      recordingId,
      status: TranscriptStatus.COMPLETED,
      provider: "deepgram-nova-3",
      language: "en",
      wordCount: 4200,
      utteranceCount: 4,
      confidence: 0.98,
    })
    .onConflictDoNothing()
    .returning();

  const transcriptId = transcript?.id ?? "trn_sample_seed";

  // 6. Utterances
  await db
    .insert(schema.utterances)
    .values([
      {
        orgId,
        meetingId,
        transcriptId,
        speakerLabel: "SPEAKER_00",
        speakerUserId: adminId,
        speakerName: "Alex Rivera",
        startMs: 12000,
        endMs: 25000,
        sequence: 1,
        text: "Welcome everyone. Let us review the roadmap. Sarah, what is the status of the new database migration?",
        type: UtteranceType.QUESTION,
      },
      {
        orgId,
        meetingId,
        transcriptId,
        speakerLabel: "SPEAKER_01",
        speakerUserId: devId,
        speakerName: "Sarah Chen",
        startMs: 26000,
        endMs: 45000,
        sequence: 2,
        text: "The PostgreSQL 18 migration with pgvector is ready. It completely eliminates all our database locking issues.",
        type: UtteranceType.INFORMATION,
      },
      {
        orgId,
        meetingId,
        transcriptId,
        speakerLabel: "SPEAKER_00",
        speakerUserId: adminId,
        speakerName: "Alex Rivera",
        startMs: 46000,
        endMs: 62000,
        sequence: 3,
        text: "Decision made: We will standardize on PostgreSQL 18 for both development and production.",
        type: UtteranceType.DECISION,
      },
      {
        orgId,
        meetingId,
        transcriptId,
        speakerLabel: "SPEAKER_01",
        speakerUserId: devId,
        speakerName: "Sarah Chen",
        startMs: 63000,
        endMs: 80000,
        sequence: 4,
        text: "I will deploy the new NestJS backend API services by tomorrow morning.",
        type: UtteranceType.ACTION_ITEM,
      },
    ])
    .onConflictDoNothing();

  // 7. Minutes of Meeting (MOM)
  const [mom] = await db
    .insert(schema.moms)
    .values({
      orgId,
      meetingId,
      status: MomStatus.READY,
      executiveSummary: "Team agreed to standardize on PostgreSQL 18 with pgvector, resolving prior concurrency bottlenecks.",
      keyTopics: ["PostgreSQL 18", "pgvector", "NestJS API", "BullMQ"],
      model: "gpt-4o",
    })
    .onConflictDoNothing()
    .returning();

  const momId = mom?.id ?? "mom_sample_seed";

  // 8. MOM Decisions & Action Items
  await db
    .insert(schema.momDecisions)
    .values({
      orgId,
      momId,
      meetingId,
      decision: "Standardize on PostgreSQL 18 and native pgvector across all environments.",
      sequence: 1,
    })
    .onConflictDoNothing();

  await db
    .insert(schema.momActionItems)
    .values({
      orgId,
      momId,
      meetingId,
      title: "Deploy NestJS backend API services",
      description: "Complete controllers and services for meetings, transcripts, and CRM.",
      assigneeUserId: devId,
      assigneeNameRaw: "Sarah Chen",
      status: ActionItemStatus.OPEN,
      audioDeepLinkMs: 63000,
      sequence: 1,
    })
    .onConflictDoNothing();

  // 9. Kanban Board, Columns & Tasks
  const [board] = await db
    .insert(schema.kanbanBoards)
    .values({
      orgId,
      title: "Engineering Roadmap",
      isDefault: true,
    })
    .onConflictDoNothing()
    .returning();

  const boardId = board?.id ?? "brd_sample_seed";

  const [colTodo] = await db
    .insert(schema.kanbanColumns)
    .values({
      orgId,
      boardId,
      title: "To Do",
      statusMapping: TaskStatus.TODO,
      colorHex: "#3B82F6",
      position: 1000,
    })
    .onConflictDoNothing()
    .returning();

  const [colInProgress] = await db
    .insert(schema.kanbanColumns)
    .values({
      orgId,
      boardId,
      title: "In Progress",
      statusMapping: TaskStatus.IN_PROGRESS,
      colorHex: "#F59E0B",
      position: 2000,
    })
    .onConflictDoNothing()
    .returning();

  const [colDone] = await db
    .insert(schema.kanbanColumns)
    .values({
      orgId,
      boardId,
      title: "Done",
      statusMapping: TaskStatus.DONE,
      colorHex: "#10B981",
      position: 3000,
    })
    .onConflictDoNothing()
    .returning();

  if (colTodo?.id) {
    await db
      .insert(schema.tasks)
      .values({
        orgId,
        boardId,
        columnId: colTodo.id,
        title: "Deploy NestJS backend API services",
        description: "Extracted automatically from Roadmap Sync at 01:03",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        assigneeUserId: devId,
        creatorUserId: adminId,
        source: TaskSource.AI_EXTRACTED,
        sourceMeetingId: meetingId,
        sourceAudioDeepLinkMs: 63000,
        position: 1000,
      })
      .onConflictDoNothing();
  }

  // 10. Twenty CRM Custom Entity: Deals
  const [dealObject] = await db
    .insert(schema.crmObjects)
    .values({
      orgId,
      name: "Deal",
      slug: "deals",
      singularName: "Deal",
      pluralName: "Deals",
      description: "Sales pipeline opportunities",
      icon: "dollar-sign",
    })
    .onConflictDoNothing()
    .returning();

  let dealObjectId: string | undefined = dealObject?.id;
  if (!dealObjectId) {
    const existing = await db.query.crmObjects.findFirst({
      where: eq(schema.crmObjects.slug, "deals"),
    });
    dealObjectId = existing?.id;
  }

  if (dealObjectId) {
    const validDealId: string = dealObjectId;
    await db
      .insert(schema.crmFields)
      .values([
        {
          orgId,
          objectId: validDealId,
          name: "Deal Name",
          slug: "name",
          type: CustomFieldType.TEXT,
          isRequired: true,
          position: 1000,
        },
        {
          orgId,
          objectId: validDealId,
          name: "Amount",
          slug: "amount",
          type: CustomFieldType.NUMBER,
          position: 2000,
        },
        {
          orgId,
          objectId: validDealId,
          name: "Stage",
          slug: "stage",
          type: CustomFieldType.SELECT,
          options: [
            { label: "Prospect", value: "prospect", color: "#6B7280" },
            { label: "Proposal", value: "proposal", color: "#3B82F6" },
            { label: "Negotiation", value: "negotiation", color: "#F59E0B" },
            { label: "Closed Won", value: "won", color: "#10B981" },
          ],
          position: 3000,
        },
      ])
      .onConflictDoNothing();

    await db
      .insert(schema.crmRecords)
      .values({
        orgId,
        objectId: validDealId,
        data: {
          name: "Acme Enterprise License",
          amount: 50000,
          stage: "negotiation",
        },
        createdById: adminId,
      })
      .onConflictDoNothing();
  }

  // 11. Built-in Sub-Helpers (Kara AI Task Workers)
  await db
    .insert(schema.subHelpers)
    .values([
      {
        orgId,
        slug: "meeting-researcher",
        name: "Meeting Intelligence Helper",
        description: "Searches past meeting transcripts, resolves audio offsets, and extracts verbatim quotes.",
        systemPromptSlice: "You are Kara's Meeting Research Helper. Retrieve and cite verified transcripts with millisecond precision.",
        assignedTools: ["searchMeetingsTool", "getUtterancesTool", "audioScrubTool"],
        model: "llama-3.3-70b-versatile",
        isBuiltIn: true,
        isActive: true,
      },
      {
        orgId,
        slug: "workforce-directory",
        name: "Workforce & Knowledge Graph Helper",
        description: "Queries company employee directory, checks presence, and traverses entity relationship triplets.",
        systemPromptSlice: "You are Kara's Workforce & Directory Helper. Resolve canonical employee names and entity relationship links.",
        assignedTools: ["directoryLookupTool", "entityGraphTool"],
        model: "llama-3.3-70b-versatile",
        isBuiltIn: true,
        isActive: true,
      },
      {
        orgId,
        slug: "task-executor",
        name: "Task & Execution Helper",
        description: "Extracts action items from MOM, creates Notion-style Kanban tasks, and syncs Twenty CRM records.",
        systemPromptSlice: "You are Kara's Execution Helper. Ensure action items have valid owners and promote them to project boards.",
        assignedTools: ["extractActionItemsTool", "kanbanCreateTool", "twentyCrmSyncTool"],
        model: "llama-3.3-70b-versatile",
        isBuiltIn: true,
        isActive: true,
      },
      {
        orgId,
        slug: "candidate-evaluator",
        name: "Candidate & GitHub Audit Helper",
        description: "Parses candidate resumes, scrapes public GitHub repositories, and calculates an objective 100-point score.",
        systemPromptSlice: "You are Kara's Candidate Evaluator. Apply strict objective metrics: Open Source (35), Projects (30), Production (25), Skills (10).",
        assignedTools: ["resumeParserTool", "githubScraperTool", "objectiveScoringTool"],
        model: "llama-3.3-70b-versatile",
        isBuiltIn: true,
        isActive: true,
      },
      {
        orgId,
        slug: "document-generator",
        name: "Document Drafting Helper",
        description: "Fills template variables for offer letters, SLAs, and briefs.",
        systemPromptSlice: "You are Kara's Document Drafting Helper. Generate clean, legally consistent Markdown documents from templates.",
        assignedTools: ["templateLoaderTool", "documentRendererTool"],
        model: "llama-3.3-70b-versatile",
        isBuiltIn: true,
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 12. Company Directory (Canonical Employee List)
  await db
    .insert(schema.companyMembers)
    .values([
      {
        orgId,
        name: "Alex Rivera",
        email: "alex@acme.corp",
        jobTitle: "Head of Product",
        department: "Executive",
        bio: "Oversees executive strategy and product roadmap across the monorepo.",
        isAdmin: true,
        isActive: true,
      },
      {
        orgId,
        name: "Sarah Chen",
        email: "sarah@acme.corp",
        jobTitle: "Principal Distributed Architect",
        department: "Engineering",
        bio: "Specializes in PostgreSQL 18, high-throughput speech pipelines, and Mastra AI workflows.",
        isAdmin: false,
        isActive: true,
      },
      {
        orgId,
        name: "Maya Patel",
        email: "maya@acme.corp",
        jobTitle: "Enterprise Account Director",
        department: "Revenue",
        bio: "Leads enterprise customer engagements and commercial contracts.",
        isAdmin: false,
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 13. Entity Relationships (Knowledge Graph Triplets)
  await db
    .insert(schema.entityRelationships)
    .values([
      {
        orgId,
        entityA: "Sarah Chen",
        relation: "OWNS_DATABASE_MIGRATION",
        entityB: "PostgreSQL 18",
        context: "Decided in Q3 Architecture & Roadmap Sync at 00:46.",
        meetingId,
        confidence: 1.0,
      },
      {
        orgId,
        entityA: "Alex Rivera",
        relation: "APPROVED_ROADMAP",
        entityB: "Kara AI Monorepo",
        context: "Confirmed sub-35ms reflex target during standup.",
        meetingId,
        confidence: 0.95,
      },
    ])
    .onConflictDoNothing();

  // 14. Document Templates
  await db
    .insert(schema.documentTemplates)
    .values([
      {
        orgId,
        name: "Senior Software Engineer Offer Letter",
        type: "offer_letter",
        content: "# Offer of Employment\n\nDear {{candidate_name}},\n\nAcme Corporation is pleased to offer you the position of **{{position}}** in our {{department}} team, reporting to {{manager_name}}.\n\n### Compensation\n- Base Salary: {{salary}}\n- Equity Grant: {{equity}}\n- Start Date: {{start_date}}\n\nPlease sign below to accept.",
        variables: ["candidate_name", "position", "department", "manager_name", "salary", "equity", "start_date"],
      },
    ])
    .onConflictDoNothing();

  // 15. Job Descriptions & Scored Candidates
  const [job] = await db
    .insert(schema.jobDescriptions)
    .values({
      orgId,
      title: "Senior Distributed Systems Engineer",
      department: "Engineering",
      description: "Own the real-time audio pipeline and Mastra AI agent framework.",
      requirements: "5+ years TypeScript, PostgreSQL, WebSockets, LLM agent orchestration.",
      salaryRange: "$160,000 - $190,000",
      status: "active",
    })
    .onConflictDoNothing()
    .returning();

  if (job?.id) {
    await db
      .insert(schema.candidates)
      .values({
        orgId,
        jobId: job.id,
        fullName: "Prakhar Sharma",
        email: "prakhar@example.com",
        githubUrl: "https://github.com/prakhar-sharma",
        overallScore: 92.5,
        openSourceScore: 34.0,
        selfProjectsScore: 28.5,
        productionScore: 22.0,
        technicalSkillsScore: 8.0,
        aiSummary: "Exceptional systems developer with strong track record in open source audio ingestion and distributed event queues.",
        aiPros: ["Major contributor to high-throughput streaming repositories", "Production experience with PostgreSQL 18 & pgvector"],
        aiCons: ["Limited public Kubernetes deployment manifests"],
        aiJustification: "Strong GitHub footprint with genuine commit velocity across audio streaming libraries.",
        status: "screening",
      })
      .onConflictDoNothing();
  }

  // 16. User Long-Term Memory (Context)
  await db
    .insert(schema.userContexts)
    .values({
      orgId,
      userId: adminId,
      contextType: "preferences",
      contextData: {
        themeProfile: "kara-light",
        focusAreas: ["PostgreSQL 18 MVCC", "Sub-35ms Diarization", "Twenty CRM Bi-directional Sync"],
        briefingFrequency: "daily",
      },
    })
    .onConflictDoNothing();

  console.log("Database seeded successfully with PostgreSQL 18 sample data!");
  await closeDb();
}

if (process.argv[1]?.includes("seed")) {
  seed()
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}
