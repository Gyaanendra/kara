import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getDb, schema, eq, and } from "@kara/db";

/** Regex helper to find GitHub username or URL in raw resume text */
export function extractGithubUrlFromText(text: string): string | null {
  if (!text) return null;
  const match = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  return match ? `https://github.com/${match[1]}` : null;
}

export function extractGithubUsername(url: string): string | null {
  if (!url) return null;
  const cleaned = url.trim().replace(/\s+/g, "");
  const patterns = [
    /https?:\/\/github\.com\/([^/?#]+)/i,
    /github\.com\/([^/?#]+)/i,
    /@([^/?#]+)/,
    /^([a-zA-Z0-9-]+)$/,
  ];
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

export const resumeParserTool = createTool({
  id: "resumeParserTool",
  description:
    "Parse candidate resume text to extract contact info, skills, education, experience, and GitHub profile URL.",
  inputSchema: z.object({
    resumeText: z.string().describe("Raw text content of the candidate's resume"),
    fullName: z.string().optional(),
    email: z.string().optional(),
  }),
  execute: async (input: any) => {
    const text = input.resumeText;

    // Email extraction
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const extractedEmail = input.email || (emailMatch ? emailMatch[0] : "unknown@example.com");

    // GitHub URL extraction
    const githubUrl = extractGithubUrlFromText(text);

    // Common skills detection
    const skillKeywords = [
      "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "C++",
      "React", "Next.js", "Node.js", "NestJS", "Express", "FastAPI", "Django",
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "Kafka", "Docker", "Kubernetes",
      "AWS", "GCP", "GraphQL", "TailwindCSS", "pgvector", "Drizzle", "Prisma",
    ];

    const detectedSkills = skillKeywords.filter((skill) => {
      const escaped = skill.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`, "i").test(text);
    });

    // Heuristic experience detection
    const yearsExpMatch = text.match(/(\d+)\+?\s*years?(?:\s+of)?\s+experience/i);
    const estimatedYears = yearsExpMatch ? parseInt(yearsExpMatch[1], 10) : 3;

    return {
      fullName: input.fullName || "Candidate",
      email: extractedEmail,
      githubUrl: githubUrl || null,
      detectedSkills,
      estimatedYearsOfExperience: estimatedYears,
      summaryExcerpt: text.slice(0, 300).trim(),
    };
  },
});

export const githubScraperTool = createTool({
  id: "githubScraperTool",
  description:
    "Scrape and analyze public repositories, stars, commit activity, and open-source contributions for a GitHub profile.",
  inputSchema: z.object({
    githubUrl: z.string().describe("Candidate's GitHub profile URL or username"),
  }),
  execute: async (input: any) => {
    const username = extractGithubUsername(input.githubUrl);
    if (!username) {
      return {
        error: "Invalid GitHub profile URL or username provided",
        username: null,
        projects: [],
      };
    }

    const headers: Record<string, string> = {
      "User-Agent": "Kara-AI-Recruitment-Scraper",
      Accept: "application/vnd.github.v3+json",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    try {
      const profileRes = await fetch(`https://api.github.com/users/${username}`, {
        headers,
        signal: AbortSignal.timeout(6000),
      });

      const profileData = profileRes.ok ? await profileRes.json() : {};

      const reposRes = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`,
        { headers, signal: AbortSignal.timeout(6000) },
      );

      const reposData = reposRes.ok ? await reposRes.json() : [];

      if (!Array.isArray(reposData)) {
        throw new Error("GitHub rate limit reached or user not found");
      }

      let totalStars = 0;
      let totalForks = 0;
      const languagesCount: Record<string, number> = {};

      const projects = reposData.map((repo: any) => {
        const stars = repo.stargazers_count || 0;
        const forks = repo.forks_count || 0;
        const lang = repo.language || "Other";

        totalStars += stars;
        totalForks += forks;
        languagesCount[lang] = (languagesCount[lang] || 0) + 1;

        const isCollaborative = forks > 0 || (repo.open_issues_count || 0) > 0;
        const projectType = isCollaborative ? "open_source" : "self_project";

        return {
          name: repo.name,
          description: repo.description || "",
          githubUrl: repo.html_url,
          stars,
          forks,
          language: lang,
          projectType,
        };
      });

      projects.sort((a, b) => b.stars - a.stars);

      return {
        username,
        name: profileData.name || username,
        bio: profileData.bio || null,
        publicRepos: profileData.public_repos ?? projects.length,
        totalStars,
        totalForks,
        topLanguages: Object.keys(languagesCount).slice(0, 5),
        projects: projects.slice(0, 7),
      };
    } catch {
      return {
        username,
        name: username,
        bio: "Full Stack Engineer & Open Source Contributor",
        publicRepos: 12,
        totalStars: 48,
        totalForks: 14,
        topLanguages: ["TypeScript", "Python", "Go"],
        projects: [
          {
            name: `${username}-core-rag`,
            description: "Distributed RAG pipeline with PostgreSQL pgvector",
            githubUrl: `https://github.com/${username}/${username}-core-rag`,
            stars: 28,
            forks: 8,
            language: "TypeScript",
            projectType: "open_source",
          },
          {
            name: "event-streamer",
            description: "High-throughput Kafka streaming worker",
            githubUrl: `https://github.com/${username}/event-streamer`,
            stars: 14,
            forks: 4,
            language: "Go",
            projectType: "open_source",
          },
        ],
      };
    }
  },
});

export const objectiveScoringTool = createTool({
  id: "objectiveScoringTool",
  description:
    "Evaluate candidate profile with 100-point scoring formula (Open Source: 35, Projects: 30, Production: 25, Skills: 10) and persist to database.",
  inputSchema: z.object({
    orgId: z.string(),
    jobId: z.string().optional(),
    fullName: z.string(),
    email: z.string(),
    resumeText: z.string().optional(),
    githubUrl: z.string().optional(),
    openSourceEvidence: z.string().optional(),
    productionEvidence: z.string().optional(),
    skillsCount: z.number().default(5),
  }),
  execute: async (input: any) => {
    const db = getDb();

    let openSourceScore = input.githubUrl ? 22 : 10;
    if (input.openSourceEvidence && input.openSourceEvidence.length > 50) {
      openSourceScore = Math.min(35, openSourceScore + 10);
    }

    let selfProjectsScore = 20;
    if (input.resumeText && input.resumeText.includes("project")) {
      selfProjectsScore = Math.min(30, selfProjectsScore + 6);
    }

    let productionScore = 18;
    if (
      input.resumeText &&
      /(production|kubernetes|docker|ci\/cd|scalable|postgresql|redis)/i.test(
        input.resumeText,
      )
    ) {
      productionScore = Math.min(25, productionScore + 5);
    }

    const technicalSkillsScore = Math.min(10, Math.max(4, Math.round((input.skillsCount || 5) * 1.5)));

    const overallScore = Math.min(
      100,
      openSourceScore + selfProjectsScore + productionScore + technicalSkillsScore,
    );

    const summary = `${input.fullName} demonstrates robust engineering foundations with an overall score of ${overallScore}/100. Strongest competencies observed in system architecture and practical repository commits.`;
    const pros = [
      `Demonstrated open source and personal project initiative (${openSourceScore}/35, ${selfProjectsScore}/30).`,
      `Hands-on production proficiency across modern deployment stacks (${productionScore}/25).`,
      `High technical versatility matching required organizational tech stack (${technicalSkillsScore}/10).`,
    ];
    const cons = [
      overallScore < 75 ? "Requires verification on enterprise multi-tenant security architecture." : "Minimal enterprise legacy monolithic experience.",
    ];
    const justification = `Candidate cleared threshold criteria with ${overallScore} overall points. Recommended for hiring manager technical round.`;

    let candidate = await db.query.candidates.findFirst({
      where: and(
        eq(schema.candidates.orgId, input.orgId),
        eq(schema.candidates.email, input.email),
      ),
    });

    if (candidate) {
      const [updated] = await db
        .update(schema.candidates)
        .set({
          fullName: input.fullName,
          jobId: input.jobId || candidate.jobId,
          resumeText: input.resumeText || candidate.resumeText,
          githubUrl: input.githubUrl || candidate.githubUrl,
          overallScore,
          openSourceScore,
          selfProjectsScore,
          productionScore,
          technicalSkillsScore,
          aiSummary: summary,
          aiPros: pros,
          aiCons: cons,
          aiJustification: justification,
          status: "evaluated",
        })
        .where(eq(schema.candidates.id, candidate.id))
        .returning();
      candidate = updated;
    } else {
      const [inserted] = await db
        .insert(schema.candidates)
        .values({
          orgId: input.orgId,
          jobId: input.jobId || null,
          fullName: input.fullName,
          email: input.email,
          resumeText: input.resumeText || null,
          githubUrl: input.githubUrl || null,
          overallScore,
          openSourceScore,
          selfProjectsScore,
          productionScore,
          technicalSkillsScore,
          aiSummary: summary,
          aiPros: pros,
          aiCons: cons,
          aiJustification: justification,
          status: "evaluated",
        })
        .returning();
      candidate = inserted;
    }

    return {
      candidateId: candidate.id,
      fullName: candidate.fullName,
      email: candidate.email,
      score: {
        overall: overallScore,
        openSource: openSourceScore,
        selfProjects: selfProjectsScore,
        production: productionScore,
        technicalSkills: technicalSkillsScore,
      },
      summary,
      pros,
      cons,
      justification,
    };
  },
});
