import { Injectable, Logger } from "@nestjs/common";
import { UtteranceType, MeetingType, ChatRoute } from "@kara/shared-types";

export interface LayaUtteranceClassification {
  category: UtteranceType;
  confidence: number;
}

export interface LayaRouteResult {
  route: ChatRoute;
  requiredTool: string;
  confidence: number;
}

@Injectable()
export class LayaService {
  private readonly logger = new Logger(LayaService.name);
  private readonly baseUrl = process.env.LAYA_ROUTER_URL || "http://localhost:8001";
  private isAvailable = false;

  constructor() {
    this.checkHealth();
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(1000) });
      this.isAvailable = res.ok;
      return res.ok;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }

  async classifyUtterance(text: string, speaker?: string): Promise<LayaUtteranceClassification> {
    if (this.isAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/classify-utterance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, speaker }),
          signal: AbortSignal.timeout(1500),
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          return {
            category: data.category as UtteranceType,
            confidence: data.confidence,
          };
        }
      } catch (err) {
        this.logger.warn(`Laya sidecar classification failed: ${err}`);
      }
    }

    // High-speed internal reflex fallback
    const lower = text.toLowerCase();
    if (text.includes("?") || /^(what|who|when|where|why|how|can|is|should)\b/.test(lower)) {
      return { category: UtteranceType.QUESTION, confidence: 0.9 };
    }
    if (/\b(will deploy|will build|will create|i will|we need to|action item|todo)\b/.test(lower)) {
      return { category: UtteranceType.ACTION_ITEM, confidence: 0.85 };
    }
    if (/\b(agreed|decided|decision made|standardize on|conclusion)\b/.test(lower)) {
      return { category: UtteranceType.DECISION, confidence: 0.88 };
    }
    return { category: UtteranceType.INFORMATION, confidence: 0.75 };
  }

  async routeQuery(query: string): Promise<LayaRouteResult> {
    if (this.isAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/route-query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
          signal: AbortSignal.timeout(1500),
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          return {
            route: data.route as ChatRoute,
            requiredTool: data.required_tool,
            confidence: data.confidence,
          };
        }
      } catch (err) {
        this.logger.warn(`Laya route failed: ${err}`);
      }
    }

    const q = query.toLowerCase();
    if (/\b(upcoming|future|schedule|calendar|tomorrow|next week)\b/.test(q)) {
      return { route: "UPCOMING_SCHEDULE" as any, requiredTool: "getUpcomingSchedule", confidence: 0.95 };
    }
    if (/\b(deal|pipeline|crm|lead|customer|account|revenue)\b/.test(q)) {
      return { route: "CRM_DATA" as any, requiredTool: "queryCrmRecords", confidence: 0.92 };
    }
    if (/\b(task|todo|kanban|in progress|done|assignee|action item)\b/.test(q)) {
      return { route: "TASK_MANAGEMENT" as any, requiredTool: "manageTasks", confidence: 0.93 };
    }
    if (/\b(yesterday|last meeting|discussed|decided|said|transcript|recording)\b/.test(q)) {
      return { route: "PAST_MEETINGS" as any, requiredTool: "getPastMeetings", confidence: 0.94 };
    }
    return { route: "KNOWLEDGE_SEARCH" as any, requiredTool: "searchKnowledgeBase", confidence: 0.8 };
  }

  async tagMeeting(title: string): Promise<MeetingType> {
    const t = title.toLowerCase();
    if (t.includes("standup") || t.includes("daily")) return MeetingType.STANDUP;
    if (t.includes("sprint") || t.includes("architecture") || t.includes("roadmap")) return MeetingType.SPRINT_REVIEW;
    if (t.includes("1:1") || t.includes("1-on-1") || t.includes("one on one")) return MeetingType.ONE_ON_ONE;
    if (t.includes("client") || t.includes("demo") || t.includes("sales")) return MeetingType.CLIENT_CALL;
    return MeetingType.ALL_HANDS;
  }
}
