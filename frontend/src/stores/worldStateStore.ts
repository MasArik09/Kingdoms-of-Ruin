import { create } from 'zustand';

interface WorldStateStore {
  states: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  fetchStates: () => Promise<void>;
  setWorldState: (key: string, value: string) => Promise<boolean>;
  getWorldState: (key: string) => string;
}

export const useWorldStateStore = create<WorldStateStore>((set, get) => ({
  states: {},
  isLoading: false,
  error: null,

  fetchStates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/worldstate');
      if (!response.ok) {
        throw new Error(`Failed to fetch world states: ${response.statusText}`);
      }
      const data = await response.json();
      set({ states: data || {}, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error occurred', isLoading: false });
    }
  },

  setWorldState: async (key: string, value: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/worldstate/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set world state: ${response.statusText}`);
      }

      // Update local state map immediately
      set((state) => ({
        states: {
          ...state.states,
          [key]: value,
        },
        isLoading: false,
      }));

      return true;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', isLoading: false });
      return false;
    }
  },

  getWorldState: (key: string) => {
    return get().states[key] || '';
  },
}));
