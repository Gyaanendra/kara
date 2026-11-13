const { createDb, schema, eq } = require("../packages/db/dist/index.js");
const {
  ActionItemStatus,
  CustomFieldType,
  MeetingPlatform,
  MeetingStatus,
  MeetingType,
  MomStatus,
  RecordingStatus,
  TaskPriority,
  TaskStatus,
  TranscriptStatus,
  UserRole,
  UtteranceType,
} = require("../packages/shared-types/dist/index.js");

async function main() {
  const db = createDb();
  console.log("Seeding rich enterprise data into PostgreSQL 18...");

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
    orgId = existing?.id ?? "org_76a82f1024344d4db6d8a588";
  }

  // 2. Users
  const userDefs = [
    { email: "alex@acme.corp", name: "Alex Rivera", role: UserRole.ADMIN, timezone: "America/New_York" },
    { email: "sarah@acme.corp", name: "Sarah Chen", role: UserRole.MEMBER, timezone: "America/San_Francisco" },
    { email: "alan@acme.corp", name: "Alan Chen", role: UserRole.MEMBER, timezone: "America/New_York" },
    { email: "helena@acme.corp", name: "Helena Derwent", role: UserRole.MEMBER, timezone: "America/New_York" },
    { email: "subash@acme.corp", name: "Subash K.", role: UserRole.MEMBER, timezone: "America/Chicago" },
    { email: "sarah.j@acme.corp", name: "Sarah Jenkins", role: UserRole.MEMBER, timezone: "America/New_York" },
  ];

  const userMap = new Map();
  for (const u of userDefs) {
    const [inserted] = await db.insert(schema.users).values(u).onConflictDoNothing().returning();
    let id = inserted?.id;
    if (!id) {
      const existing = await db.query.users.findFirst({ where: eq(schema.users.email, u.email) });
      id = existing?.id;
    }
    userMap.set(u.email, id);
    await db.insert(schema.orgMemberships).values({ orgId, userId: id, role: u.role }).onConflictDoNothing();
  }

  const adminId = userMap.get("alex@acme.corp");
  const sarahId = userMap.get("sarah@acme.corp");
  const alanId = userMap.get("alan@acme.corp");
  const helenaId = userMap.get("helena@acme.corp");
  const subashId = userMap.get("subash@acme.corp");
  const jenkinsId = userMap.get("sarah.j@acme.corp");

  // 3. Clean up existing meetings, utterances, tasks, and crm deals to ensure fresh clean state
  await db.delete(schema.tasks).where(eq(schema.tasks.orgId, orgId));
  await db.delete(schema.crmRecords).where(eq(schema.crmRecords.orgId, orgId));
  await db.delete(schema.utterances).where(eq(schema.utterances.orgId, orgId));
  await db.delete(schema.transcripts).where(eq(schema.transcripts.orgId, orgId));
  await db.delete(schema.recordings).where(eq(schema.recordings.orgId, orgId));
  await db.delete(schema.momActionItems).where(eq(schema.momActionItems.orgId, orgId));
  await db.delete(schema.momDecisions).where(eq(schema.momDecisions.orgId, orgId));
  await db.delete(schema.moms).where(eq(schema.moms.orgId, orgId));
  await db.delete(schema.meetings).where(eq(schema.meetings.orgId, orgId));

  // 4. Insert 6 Distinct High-Impact Meetings matching Image 1
  const meetingsData = [
    {
      title: "Q3 Architecture & Database Standup",
      description: "Weekly engineering sync discussing microservices, pgvector, and PostgreSQL 18 MVCC.",
      platform: MeetingPlatform.GOOGLE_MEET,
      hostUserId: adminId,
      status: MeetingStatus.COMPLETED,
      type: MeetingType.SPRINT_REVIEW,
      scheduledStartAt: new Date(Date.now() - 3600000 * 24),
      utterances: [
        {
          speakerName: "Alex Rivera",
          speakerUserId: adminId,
          startMs: 12000,
          endMs: 24000,
          text: "Welcome everyone. Let us review the roadmap. Sarah, what is the status of the new database migration?",
          type: UtteranceType.QUESTION,
        },
        {
          speakerName: "Sarah Chen",
          speakerUserId: sarahId,
          startMs: 26000,
          endMs: 44000,
          text: "The PostgreSQL 18 migration with pgvector is ready. It completely eliminates all our database locking issues.",
          type: UtteranceType.INFORMATION,
        },
        {
          speakerName: "Alex Rivera",
          speakerUserId: adminId,
          startMs: 46000,
          endMs: 61000,
          text: "Decision made: We will standardize on PostgreSQL 18 for both development and production.",
          type: UtteranceType.DECISION,
        },
        {
          speakerName: "Sarah Chen",
          speakerUserId: sarahId,
          startMs: 63000,
          endMs: 79000,
          text: "I will deploy the new NestJS backend API services by tomorrow morning.",
          type: UtteranceType.ACTION_ITEM,
        },
      ],
      momSummary: "Team standardized on PostgreSQL 18 with pgvector, resolving concurrency bottlenecks.",
      momDecision: "Standardize on PostgreSQL 18 and native pgvector across all environments.",
      actionItem: { title: "Deploy NestJS backend API services", assigneeId: sarahId, name: "Sarah Chen", ms: 63000 },
    },
    {
      title: "Enterprise Deal Review — Query Cloud",
      description: "Executive contract review with Query Cloud procurement team for $450,000 ARR.",
      platform: MeetingPlatform.ZOOM,
      hostUserId: helenaId,
      status: MeetingStatus.COMPLETED,
      type: MeetingType.CLIENT_DISCOVERY,
      scheduledStartAt: new Date(Date.now() - 3600000 * 18),
      utterances: [
        {
          speakerName: "Helena Derwent",
          speakerUserId: helenaId,
          startMs: 15000,
          endMs: 38000,
          text: "We are reviewing the Query Cloud contract. Deal size is $450,000 ARR with guaranteed 99.99% uptime SLA.",
          type: UtteranceType.INFORMATION,
        },
        {
          speakerName: "Alex Rivera",
          speakerUserId: adminId,
          startMs: 42000,
          endMs: 58000,
          text: "What penalty applies if uptime drops below 99.9% in any billing month?",
          type: UtteranceType.QUESTION,
        },
        {
          speakerName: "Helena Derwent",
          speakerUserId: helenaId,
          startMs: 65000,
          endMs: 82000,
          text: "A 10% SLA credit is applied against next month's invoice if monthly availability drops below 99.9%.",
          type: UtteranceType.DECISION,
        },
        {
          speakerName: "Alex Rivera",
          speakerUserId: adminId,
          startMs: 85000,
          endMs: 98000,
          text: "Approved. Let us ensure Twenty CRM records the $450,000 deal and notify legal.",
          type: UtteranceType.ACTION_ITEM,
        },
      ],
      momSummary: "Approved Query Cloud enterprise contract for $450,000 ARR with 99.99% SLA commitment.",
      momDecision: "Approve 10% SLA credit penalty threshold at 99.9% availability.",
      actionItem: { title: "Audit Query Cloud 99.99% SLA contract terms", assigneeId: helenaId, name: "Helena Derwent", ms: 65000 },
    },
    {
      title: "Customer SLA & Price Cap Audit",
      description: "Vendor terms review for Vertex Health renewal and contractual margin caps.",
      platform: MeetingPlatform.GOOGLE_MEET,
      hostUserId: subashId,
      status: MeetingStatus.COMPLETED,
      type: MeetingType.COMPLIANCE_AUDIT,
      scheduledStartAt: new Date(Date.now() - 3600000 * 12),
      utterances: [
        {
          speakerName: "Subash K.",
          speakerUserId: subashId,
          startMs: 10000,
          endMs: 28000,
          text: "Vertex Health renewal is up for $56,900. They requested a 3% price cap on year-over-year renewals.",
          type: UtteranceType.INFORMATION,
        },
        {
          speakerName: "Alex Rivera",
          speakerUserId: adminId,
          startMs: 30000,
          endMs: 44000,
          text: "Is the 3% cap within our executive margin guidelines?",
          type: UtteranceType.QUESTION,
        },
        {
          speakerName: "Subash K.",
          speakerUserId: subashId,
          startMs: 48000,
          endMs: 68000,
          text: "Yes, our standard floor is 5%, but for Vertex Health enterprise tier we have approved the 3% price cap.",
          type: UtteranceType.DECISION,
        },
        {
          speakerName: "Subash K.",
          speakerUserId: subashId,
          startMs: 72000,
          endMs: 89000,
          text: "I will attach the executed amendment to the Twenty CRM deal record.",
          type: UtteranceType.ACTION_ITEM,
        },
      ],
      momSummary: "Reviewed Vertex Health contract renewal and codified 3% annual price cap amendment.",
      momDecision: "Grant 3% YoY renewal cap for Vertex Health enterprise tier.",
      actionItem: { title: "Review Vertex Health 3% price cap amendment", assigneeId: subashId, name: "Subash K.", ms: 48000 },
    },
    {
      title: "Weekly Executive Standup — Growth",
      description: "Cross-functional pipeline sync reviewing enterprise deal closures and contractor hiring.",
      platform: MeetingPlatform.MS_TEAMS,
      hostUserId: jenkinsId,
      status: MeetingStatus.COMPLETED,
      type: MeetingType.STANDUP,
      scheduledStartAt: new Date(Date.now() - 3600000 * 6),
      utterances: [
        {
          speakerName: "Sarah Jenkins",
          speakerUserId: jenkinsId,
          startMs: 18000,
          endMs: 40000,
          text: "FinCorp Data Infrastructure deal has cleared technical diligence for $148,000.",
          type: UtteranceType.INFORMATION,
        },
        {
          speakerName: "Alan Chen",
          speakerUserId: alanId,
          startMs: 44000,
          endMs: 65000,
          text: "We will need two senior TypeScript engineers dedicated to their custom connector.",
          type: UtteranceType.QUESTION,
        },
        {
          speakerName: "Sarah Jenkins",
          speakerUserId: jenkinsId,
          startMs: 70000,
          endMs: 90000,
          text: "Decision made: Procure contractor capacity to guarantee deliverable dates for FinCorp.",
          type: UtteranceType.DECISION,
        },
        {
          speakerName: "Alan Chen",
          speakerUserId: alanId,
          startMs: 95000,
          endMs: 110000,
          text: "I will post the role requirements to candidate evaluator.",
          type: UtteranceType.ACTION_ITEM,
        },
      ],
      momSummary: "Cleared FinCorp $148,000 enterprise expansion and approved contractor staffing.",
      momDecision: "Approve contractor procurement for FinCorp connector.",
      actionItem: { title: "Prepare Q4 GPU cluster budget proposal", assigneeId: alanId, name: "Alan Chen", ms: 70000 },
    },
    {
      title: "Security & Compliance SOC2 Type II Audit",
      description: "Annual SOC2 compliance review with external auditor.",
      platform: MeetingPlatform.GOOGLE_MEET,
      hostUserId: subashId,
      status: MeetingStatus.COMPLETED,
      type: MeetingType.COMPLIANCE_AUDIT,
      scheduledStartAt: new Date(Date.now() - 3600000 * 2),
      utterances: [
        {
          speakerName: "Subash K.",
          speakerUserId: subashId,
          startMs: 12000,
          endMs: 35000,
          text: "External auditors completed the SOC2 Type II review with zero exceptions found across access control and encryption.",
          type: UtteranceType.INFORMATION,
        },
        {
          speakerName: "Alex Rivera",
          speakerUserId: adminId,
          startMs: 40000,
          endMs: 58000,
          text: "Ensure our KMS key rotation schedules and encryption at rest are fully documented in the knowledge graph.",
          type: UtteranceType.DECISION,
        },
      ],
      momSummary: "SOC2 Type II external audit completed with zero exceptions.",
      momDecision: "Maintain quarterly KMS key rotation and pgvector partition isolation.",
      actionItem: { title: "Conduct SOC2 Type II KMS key rotation review", assigneeId: subashId, name: "Subash K.", ms: 40000 },
    },
    {
      title: "Q4 Cloud Infrastructure & GPU Budget",
      description: "Strategic planning for GPU node allocation and AWS Bedrock reserve capacity.",
      platform: MeetingPlatform.GOOGLE_MEET,
      hostUserId: adminId,
      status: MeetingStatus.SCHEDULED,
      type: MeetingType.ONE_ON_ONE,
      scheduledStartAt: new Date(Date.now() + 3600000 * 24),
      utterances: [],
      momSummary: "",
      momDecision: "",
      actionItem: null,
    },
  ];

  for (const m of meetingsData) {
    const [meet] = await db
      .insert(schema.meetings)
      .values({
        orgId,
        hostUserId: m.hostUserId,
        title: m.title,
        description: m.description,
        platform: m.platform,
        status: m.status,
        meetingType: m.type,
        scheduledStartAt: m.scheduledStartAt,
        scheduledEndAt: new Date(m.scheduledStartAt.getTime() + 3600000),
      })
      .returning();

    if (m.status === MeetingStatus.COMPLETED) {
      const [rec] = await db
        .insert(schema.recordings)
        .values({
          orgId,
          meetingId: meet.id,
          s3Bucket: "kara-recordings",
          s3Key: `recordings/${orgId}/${meet.id}/audio.webm`,
          status: RecordingStatus.UPLOADED,
          durationSeconds: 3600,
        })
        .returning();

      const [trn] = await db
        .insert(schema.transcripts)
        .values({
          orgId,
          meetingId: meet.id,
          recordingId: rec.id,
          status: TranscriptStatus.COMPLETED,
          provider: "deepgram-nova-3",
          language: "en",
          utteranceCount: m.utterances.length,
          confidence: 0.98,
        })
        .returning();

      for (let i = 0; i < m.utterances.length; i++) {
        const u = m.utterances[i];
        await db.insert(schema.utterances).values({
          orgId,
          meetingId: meet.id,
          transcriptId: trn.id,
          speakerLabel: `SPEAKER_0${i}`,
          speakerUserId: u.speakerUserId,
          speakerName: u.speakerName,
          startMs: u.startMs,
          endMs: u.endMs,
          sequence: i + 1,
          text: u.text,
          type: u.type,
        });
      }

      const [mom] = await db
        .insert(schema.moms)
        .values({
          orgId,
          meetingId: meet.id,
          status: MomStatus.READY,
          executiveSummary: m.momSummary,
          keyTopics: ["Cloud Infrastructure", "Contracts", "PostgreSQL 18"],
        })
        .returning();

      if (m.momDecision) {
        await db.insert(schema.momDecisions).values({
          orgId,
          momId: mom.id,
          meetingId: meet.id,
          decision: m.momDecision,
          sequence: 1,
        });
      }

      if (m.actionItem) {
        await db.insert(schema.momActionItems).values({
          orgId,
          momId: mom.id,
          meetingId: meet.id,
          title: m.actionItem.title,
          assigneeUserId: m.actionItem.assigneeId,
          assigneeNameRaw: m.actionItem.name,
          status: ActionItemStatus.OPEN,
          audioDeepLinkMs: m.actionItem.ms,
          sequence: 1,
        });
      }
    }
  }

  // 5. Kanban Boards & 8 Rich Tasks
  let board = await db.query.kanbanBoards.findFirst({ where: eq(schema.kanbanBoards.orgId, orgId) });
  if (!board) {
    const [b] = await db.insert(schema.kanbanBoards).values({ orgId, title: "Executive Operations", isDefault: true }).returning();
    board = b;
  }

  let cols = await db.query.kanbanColumns.findMany({ where: eq(schema.kanbanColumns.boardId, board.id) });
  if (cols.length === 0) {
    const [col1] = await db.insert(schema.kanbanColumns).values({ orgId, boardId: board.id, title: "To Do", statusMapping: TaskStatus.TODO, position: 1000 }).returning();
    const [col2] = await db.insert(schema.kanbanColumns).values({ orgId, boardId: board.id, title: "In Progress", statusMapping: TaskStatus.IN_PROGRESS, position: 2000 }).returning();
    const [col3] = await db.insert(schema.kanbanColumns).values({ orgId, boardId: board.id, title: "Done", statusMapping: TaskStatus.DONE, position: 3000 }).returning();
    cols = [col1, col2, col3];
  }

  const colTodo = cols.find((c) => c.statusMapping === TaskStatus.TODO) || cols[0];
  const colInProg = cols.find((c) => c.statusMapping === TaskStatus.IN_PROGRESS) || cols[1] || cols[0];
  const colDone = cols.find((c) => c.statusMapping === TaskStatus.DONE) || cols[2] || cols[0];

  const tasksToInsert = [
    { title: "Deploy NestJS backend API services", col: colInProg, user: sarahId, priority: TaskPriority.HIGH },
    { title: "Audit Query Cloud 99.99% SLA contract terms", col: colDone, user: helenaId, priority: TaskPriority.URGENT },
    { title: "Review Vertex Health 3% price cap amendment", col: colDone, user: subashId, priority: TaskPriority.MEDIUM },
    { title: "Migrate production schema to PostgreSQL 18", col: colDone, user: sarahId, priority: TaskPriority.URGENT },
    { title: "Configure Deepgram Nova-3 live audio webhook", col: colInProg, user: adminId, priority: TaskPriority.HIGH },
    { title: "Update Twenty CRM custom deal pipelines", col: colTodo, user: null, priority: TaskPriority.LOW },
    { title: "Conduct SOC2 Type II KMS key rotation review", col: colTodo, user: subashId, priority: TaskPriority.HIGH },
    { title: "Prepare Q4 GPU cluster budget proposal", col: colTodo, user: alanId, priority: TaskPriority.MEDIUM },
  ];

  for (let i = 0; i < tasksToInsert.length; i++) {
    const t = tasksToInsert[i];
    await db.insert(schema.tasks).values({
      orgId,
      boardId: board.id,
      columnId: t.col.id,
      title: t.title,
      description: "Synchronized with Kara AI Chief of Staff and verified audio recordings.",
      status: t.col.statusMapping,
      priority: t.priority,
      assigneeUserId: t.user,
      creatorUserId: adminId,
      position: (i + 1) * 1000,
    });
  }

  // 6. Twenty CRM Deals summing exactly to $780,000 ($779,900)
  let dealObj = await db.query.crmObjects.findFirst({ where: eq(schema.crmObjects.slug, "deals") });
  if (!dealObj) {
    const [o] = await db
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
      .returning();
    dealObj = o;
  }

  const dealsToInsert = [
    { name: "Query Cloud Enterprise Expansion", amount: 450000, stage: "negotiation" },
    { name: "FinCorp Data Infrastructure", amount: 148000, stage: "proposal" },
    { name: "Acme Retail Tier 1 Deployment", amount: 125000, stage: "negotiation" },
    { name: "Vertex Health Renewal Contract", amount: 56900, stage: "won" },
  ];

  for (const d of dealsToInsert) {
    await db.insert(schema.crmRecords).values({
      orgId,
      objectId: dealObj.id,
      data: d,
      createdById: adminId,
    });
  }

  console.log("Enterprise dataset successfully seeded into PostgreSQL 18!");
  await db.$client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding:", err);
  process.exit(1);
});
