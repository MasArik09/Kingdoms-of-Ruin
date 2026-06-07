import { create } from 'zustand';

interface PlayerState {
  playerName: string;
  playerPosition: { x: number; y: number };
  setPlayerPosition: (x: number, y: number) => void;
  setPlayerName: (name: string) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  playerName: 'Hero',
  playerPosition: { x: 400, y: 300 }, // Default position in the center of the world
  setPlayerPosition: (x: number, y: number) =>
    set({ playerPosition: { x, y } }),
  setPlayerName: (name: string) => set({ playerName: name }),
}));
