export type ToolType = 'schema' | 'query' | 'debugger' | 'dummy';

export interface HistoryItem {
  id: string;
  tool: ToolType;
  prompt: string;
  response: string;
  timestamp: number;
}

export interface AppState {
  apiKey: string;
  setApiKey: (key: string) => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}
