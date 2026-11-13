export * from "./meeting.tools.js";
export * from "./workforce.tools.js";
export * from "./task.tools.js";
export * from "./recruitment.tools.js";
export * from "./document.tools.js";
export * from "./user-context.tools.js";

import {
  searchMeetingsTool,
  getUtterancesTool,
  audioScrubTool,
} from "./meeting.tools.js";

import {
  directoryLookupTool,
  entityGraphTool,
  upsertRelationshipTool,
} from "./workforce.tools.js";

import {
  extractActionItemsTool,
  kanbanCreateTool,
  twentyCrmSyncTool,
} from "./task.tools.js";

import {
  resumeParserTool,
  githubScraperTool,
  objectiveScoringTool,
} from "./recruitment.tools.js";

import {
  templateLoaderTool,
  documentRendererTool,
} from "./document.tools.js";

import {
  userContextMemoryTool,
} from "./user-context.tools.js";

export const allMastraTools = {
  searchMeetingsTool,
  getUtterancesTool,
  audioScrubTool,
  directoryLookupTool,
  entityGraphTool,
  upsertRelationshipTool,
  extractActionItemsTool,
  kanbanCreateTool,
  twentyCrmSyncTool,
  resumeParserTool,
  githubScraperTool,
  objectiveScoringTool,
  templateLoaderTool,
  documentRendererTool,
  userContextMemoryTool,
};

