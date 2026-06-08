import { ItemDefinition } from '../types/item';

export const ItemRegistry: Record<string, ItemDefinition> = {
  wood: {
    id: 'wood',
    name: 'Wood',
    description: 'A sturdy piece of timber, useful for crafting and fuel.',
    category: 'resource',
    icon: 'item-wood',
    maxStack: 99
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'Iron Ore',
    description: 'Raw iron ore waiting to be smelted.',
    category: 'resource',
    icon: 'item-iron-ore',
    maxStack: 99
  },
  rusty_sword: {
    id: 'rusty_sword',
    name: 'Rusty Sword',
    description: 'A basic, weather-worn blade.',
    category: 'weapon',
    icon: 'item-rusty-sword',
    maxStack: 1
  },
  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    description: 'Light protection made of cured hides.',
    category: 'armor',
    icon: 'item-leather-armor',
    maxStack: 1
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    description: 'A sweet, crisp fruit. Restores a small amount of health.',
    category: 'consumable',
    icon: 'item-apple',
    maxStack: 10
  },
  ancient_key: {
    id: 'ancient_key',
    name: 'Ancient Key',
    description: 'A heavy key covered in mysterious runes.',
    category: 'quest',
    icon: 'item-ancient-key',
    maxStack: 1
  }
};
