import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, ToolType, HistoryItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
      setApiKey: (key) => set({ apiKey: key }),
      
      activeTool: 'schema',
      setActiveTool: (tool) => set({ activeTool: tool }),
      
      history: [],
      addHistoryItem: (item) => set((state) => ({
        history: [
          {
            ...item,
            id: uuidv4(),
            timestamp: Date.now(),
          },
          ...state.history,
        ],
      })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'rdm-agent-storage',
      partialize: (state) => ({ 
        apiKey: state.apiKey,
        history: state.history 
      }),
    }
  )
);
