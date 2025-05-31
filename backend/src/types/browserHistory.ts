/**
 * Types for browser history service
 */

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  timestamp: number;
  content: string;
  topic: string;
  userId: string;
  metadata: {
    deviceId?: string;
    domain: string;
    path: string;
    referrer?: string;
    visitDuration?: number;
  };
}

export interface HistoryQuery {
  userId: string;
  timeRange?: {
    start?: number;
    end?: number;
  };
  topics?: string[];
  similarity?: {
    text: string;
    minScore?: number;
  };
  limit?: number;
  offset?: number;
}

export interface TopicSummary {
  topic: string;
  count: number;
  firstVisit: number;
  lastVisit: number;
}

export interface HistoryStats {
  totalEntries: number;
  domains: {
    [domain: string]: number;
  };
  topics: TopicSummary[];
  timeRanges: {
    today: number;
    yesterday: number;
    lastWeek: number;
    lastMonth: number;
    older: number;
  };
} 