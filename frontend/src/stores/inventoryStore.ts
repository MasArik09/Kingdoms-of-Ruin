import { create } from 'zustand';
import { InventoryItem } from '../types/item';

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  fetchInventory: (ownerType?: string, ownerId?: string) => Promise<void>;
  addItem: (itemId: string, quantity: number, ownerType?: string, ownerId?: string) => Promise<InventoryItem | null>;
  clearError: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchInventory: async (ownerType = 'player', ownerId = 'player_default') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/inventory?owner_type=${ownerType}&owner_id=${ownerId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.statusText}`);
      }
      const data: any[] = await response.json();
      
      // Clean mapping to ensure matching properties
      const items = data.map((item) => ({
        id: item.id,
        ownerType: item.owner_type || item.ownerType,
        ownerId: item.owner_id || item.ownerId,
        itemId: item.item_id || item.itemId,
        quantity: item.quantity,
      }));

      set({ items, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error occurred', isLoading: false });
    }
  },

  addItem: async (itemId, quantity, ownerType = 'player', ownerId = 'player_default') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/inventory/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_type: ownerType,
          owner_id: ownerId,
          item_id: itemId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add item: ${response.statusText}`);
      }

      const data = await response.json();
      const updatedItem: InventoryItem = {
        id: data.id,
        ownerType: data.owner_type || data.ownerType,
        ownerId: data.owner_id || data.ownerId,
        itemId: data.item_id || data.itemId,
        quantity: data.quantity,
      };

      // Update local state directly to be responsive
      const currentItems = get().items;
      const existingItemIndex = currentItems.findIndex(
        (item) => item.ownerType === ownerType && item.ownerId === ownerId && item.itemId === itemId
      );

      let newItems = [...currentItems];
      if (existingItemIndex > -1) {
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: updatedItem.quantity,
        };
      } else {
        newItems.push(updatedItem);
      }

      set({ items: newItems, isLoading: false });
      return updatedItem;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error occurred', isLoading: false });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
