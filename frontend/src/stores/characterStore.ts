import { create } from 'zustand';
import { EquipmentSlot } from '../types/equipment';
import { EquipmentRegistry } from '../config/equipmentRegistry';
import { useInventoryStore } from './inventoryStore';

export interface BaseStats {
  health: number;
  stamina: number;
  strength: number;
  defense: number;
  agility: number;
}

export interface DerivedStats {
  maxHealth: number;
  maxStamina: number;
  attackPower: number;
  armorRating: number;
  moveSpeed: number;
}

interface CharacterState {
  baseStats: BaseStats;
  equipment: Record<EquipmentSlot, string | null>;
  level: number;
  experience: number;
  currentHp: number;
  currentStamina: number;
  isLoading: boolean;
  error: string | null;

  fetchEquipment: (ownerType?: string, ownerId?: string) => Promise<void>;
  equipItem: (slot: EquipmentSlot, itemId: string, ownerType?: string, ownerId?: string) => Promise<boolean>;
  unequipItem: (slot: EquipmentSlot, ownerType?: string, ownerId?: string) => Promise<boolean>;
  getTotalStats: () => BaseStats;
  getDerivedStats: () => DerivedStats;
  fetchProgress: (ownerId?: string) => Promise<void>;
  updateProgress: (level: number, experience: number, ownerId?: string) => Promise<boolean>;
  setHp: (hp: number) => void;
  setStamina: (stamina: number) => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  baseStats: {
    health: 10,
    stamina: 10,
    strength: 10,
    defense: 10,
    agility: 10,
  },
  equipment: {
    weapon: null,
    helmet: null,
    chest: null,
    gloves: null,
    boots: null,
    ring: null,
  },
  isLoading: false,
  error: null,
  level: 1,
  experience: 0,
  currentHp: 100,
  currentStamina: 100,

  fetchEquipment: async (ownerType = 'player', ownerId = 'player_default') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/equipment?owner_type=${ownerType}&owner_id=${ownerId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch equipment: ${response.statusText}`);
      }
      const data = await response.json();
      
      const newEquip: Record<EquipmentSlot, string | null> = {
        weapon: data.weapon || null,
        helmet: data.helmet || null,
        chest: data.chest || null,
        gloves: data.gloves || null,
        boots: data.boots || null,
        ring: data.ring || null,
      };

      set({ equipment: newEquip, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error occurred', isLoading: false });
    }
  },

  equipItem: async (slot: EquipmentSlot, itemId: string, ownerType = 'player', ownerId = 'player_default') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/equipment/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_type: ownerType,
          owner_id: ownerId,
          slot_id: slot,
          item_id: itemId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to equip item: ${response.statusText}`);
      }

      // Refresh both equipment and inventory states from database
      await Promise.all([
        get().fetchEquipment(ownerType, ownerId),
        useInventoryStore.getState().fetchInventory(ownerType, ownerId),
      ]);

      return true;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error occurred', isLoading: false });
      return false;
    }
  },

  unequipItem: async (slot: EquipmentSlot, ownerType = 'player', ownerId = 'player_default') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/equipment/unequip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_type: ownerType,
          owner_id: ownerId,
          slot_id: slot,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to unequip item: ${response.statusText}`);
      }

      // Refresh both equipment and inventory states from database
      await Promise.all([
        get().fetchEquipment(ownerType, ownerId),
        useInventoryStore.getState().fetchInventory(ownerType, ownerId),
      ]);

      return true;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error occurred', isLoading: false });
      return false;
    }
  },

  getTotalStats: () => {
    const { baseStats, equipment } = get();
    const total = { ...baseStats };

    Object.entries(equipment).forEach(([, itemId]) => {
      if (itemId) {
        const def = EquipmentRegistry[itemId];
        if (def && def.stats) {
          if (def.stats.health) total.health += def.stats.health;
          if (def.stats.stamina) total.stamina += def.stats.stamina;
          if (def.stats.strength) total.strength += def.stats.strength;
          if (def.stats.defense) total.defense += def.stats.defense;
          if (def.stats.agility) total.agility += def.stats.agility;
        }
      }
    });

    return total;
  },

  getDerivedStats: () => {
    const total = get().getTotalStats();
    const { equipment } = get();

    let attackPowerBonus = 0;
    let armorBonus = 0;

    Object.entries(equipment).forEach(([, itemId]) => {
      if (itemId) {
        const def = EquipmentRegistry[itemId];
        if (def && def.stats) {
          if (def.stats.attackPower) attackPowerBonus += def.stats.attackPower;
          if (def.stats.armor) armorBonus += def.stats.armor;
        }
      }
    });

    return {
      maxHealth: 100 + total.health * 10 + total.strength * 5,
      maxStamina: 100 + total.stamina * 5 + total.agility * 2,
      attackPower: 10 + total.strength * 2 + attackPowerBonus,
      armorRating: total.defense * 3 + armorBonus,
      moveSpeed: 250 + total.agility * 1.5,
    };
  },

  fetchProgress: async (ownerId = 'player_default') => {
    try {
      const response = await fetch(`/api/character/progress?owner_id=${ownerId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch progress: ${response.statusText}`);
      }
      const data = await response.json();
      set({
        level: data.level,
        experience: data.experience,
      });
      // Set current HP and stamina to max values calculated on startup
      const derived = get().getDerivedStats();
      set({
        currentHp: derived.maxHealth,
        currentStamina: derived.maxStamina,
      });
    } catch (err: any) {
      console.error('Failed to fetch character progress:', err);
    }
  },

  updateProgress: async (level: number, experience: number, ownerId = 'player_default') => {
    try {
      const response = await fetch('/api/character/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_id: ownerId,
          level: level,
          experience: experience,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update progress: ${response.statusText}`);
      }
      set({ level, experience });
      return true;
    } catch (err: any) {
      console.error('Failed to update character progress:', err);
      return false;
    }
  },

  setHp: (hp: number) => {
    const derived = get().getDerivedStats();
    const boundedHp = Math.max(0, Math.min(derived.maxHealth, hp));
    set({ currentHp: boundedHp });
  },

  setStamina: (stamina: number) => {
    const derived = get().getDerivedStats();
    const boundedStamina = Math.max(0, Math.min(derived.maxStamina, stamina));
    set({ currentStamina: boundedStamina });
  },
}));
