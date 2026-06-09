import { useCharacterStore } from '../stores/characterStore';

export interface CharacterCombatStats {
  level: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  attackPower: number;
  defense: number;
  agility: number;
}

/**
 * Returns a read-only snapshot of the player's combat statistics.
 * Acts as the single source of truth for all combat calculations (damage formulas, cooldowns, requirements).
 */
export function getCharacterCombatStats(): CharacterCombatStats {
  const charStore = useCharacterStore.getState();
  const totalBase = charStore.getTotalStats(); // Includes baseStats + equipped item stat bonuses
  const derived = charStore.getDerivedStats();  // Derived stats (max Health/Stamina, Attack Power, Armor Rating, Move Speed)

  return {
    level: charStore.level,
    hp: charStore.currentHp,
    maxHp: derived.maxHealth,
    stamina: charStore.currentStamina,
    maxStamina: derived.maxStamina,
    attackPower: derived.attackPower,
    defense: totalBase.defense,
    agility: totalBase.agility,
  };
}
