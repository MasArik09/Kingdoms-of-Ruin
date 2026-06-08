export type ItemCategory = 'resource' | 'weapon' | 'armor' | 'consumable' | 'quest';

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  icon: string;
  maxStack: number;
}

export interface InventoryItem {
  id?: number;
  ownerType: string;
  ownerId: string;
  itemId: string;
  quantity: number;
}
