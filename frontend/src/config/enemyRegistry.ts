export interface EnemyDefinition {
  type: string;
  name: string;
  maxHp: number;
  attackPower: number;
  defense: number;
  speed: number;
  scale: number;
  xpReward: number;
  texture: string;
}

export const EnemyRegistry: Record<string, EnemyDefinition> = {
  slime: {
    type: 'slime',
    name: 'Green Slime',
    maxHp: 55,
    attackPower: 12,  // Slime deals punishing damage without armor
    defense: 3,       // Slime has moderate defense
    speed: 60,        // Bouncy hops speed
    scale: 0.9,       // Slime scale multiplier
    xpReward: 30,     // Experience rewarded on kill
    texture: 'enemy-slime',
  },
};
