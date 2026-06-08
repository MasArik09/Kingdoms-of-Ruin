import { EquipmentSlot } from '../types/equipment';

export interface StatModifiers {
  health?: number;
  stamina?: number;
  strength?: number;
  defense?: number;
  agility?: number;
  attackPower?: number;
  armor?: number;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface EquipmentDefinition {
  itemId: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  stats: StatModifiers;
}

export const EquipmentRegistry: Record<string, EquipmentDefinition> = {
  rusty_sword: {
    itemId: 'rusty_sword',
    slot: 'weapon',
    rarity: 'common',
    stats: { strength: 3, attackPower: 8 }
  },
  traveler_hood: {
    itemId: 'traveler_hood',
    slot: 'helmet',
    rarity: 'common',
    stats: { defense: 1, agility: 2, health: 5 }
  },
  worn_leather_armor: {
    itemId: 'worn_leather_armor',
    slot: 'chest',
    rarity: 'common',
    stats: { defense: 4, health: 15, strength: 1 }
  },
  old_boots: {
    itemId: 'old_boots',
    slot: 'boots',
    rarity: 'common',
    stats: { agility: 3, defense: 1, stamina: 10 }
  },
  leather_armor: {
    itemId: 'leather_armor',
    slot: 'chest',
    rarity: 'common',
    stats: { defense: 3, health: 10 }
  }
};

export const RarityColors: Record<ItemRarity, { border: number; hexString: string; text: string }> = {
  common: { border: 0x94a3b8, hexString: '#94a3b8', text: 'Common' },
  uncommon: { border: 0x22c55e, hexString: '#22c55e', text: 'Uncommon' },
  rare: { border: 0x3b82f6, hexString: '#3b82f6', text: 'Rare' },
  epic: { border: 0xa855f7, hexString: '#a855f7', text: 'Epic' },
  legendary: { border: 0xf97316, hexString: '#f97316', text: 'Legendary' }
};
