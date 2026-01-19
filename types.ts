
export enum WordNature {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative'
}

export interface WATBreakdown {
  word: string;
  nature: WordNature;
  natureReasoning: string;
  olqs: string[];
  thinkingDirection: string;
  sentenceLogic: {
    formula: string;
    avoid: string[];
  };
  weakResponses: {
    response: string;
    reason: string;
  }[];
  idealResponses: string[]; // Changed from idealResponse: string
}

export interface HistoryItem {
  word: string;
  timestamp: number;
}
