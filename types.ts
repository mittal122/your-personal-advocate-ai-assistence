
export type View = 'home' | 'advocate' | 'fine_verifier' | 'history' | 'rights_library';
export type Language = 'en' | 'hi' | 'gu';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: GroundingChunk[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  query: string;
  response: string;
  sources: GroundingChunk[];
}

export interface Fine {
  offense: Record<Language, string>;
  section: string;
  fine: string;
  procedure: Record<Language, string>;
}

export interface FineData {
  [state: string]: Fine[];
}

export interface RightCategory {
  title: Record<Language, string>;
  rights: Right[];
}

export interface Right {
  title: Record<Language, string>;
  description: Record<Language, string>;
}

export interface Translations {
  [key: string]: Record<Language, string>;
}

// Simplified from Gemini API for demonstration
export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  }
}
