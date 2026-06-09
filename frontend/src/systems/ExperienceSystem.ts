import Phaser from 'phaser';
import { useCharacterStore } from '../stores/characterStore';
import { DamageSystem } from './DamageSystem';

export class ExperienceSystem {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;

  constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite) {
    this.scene = scene;
    this.player = player;

    // Listen to enemy death events in the scene
    this.scene.events.on('enemy:death', this.onEnemyDeath, this);

    // Clean up on scene shutdown
    this.scene.events.once('shutdown', () => {
      this.destroy();
    });
  }

  private onEnemyDeath(data: { id: string; type: string; xpReward: number; x: number; y: number }): void {
    const charStore = useCharacterStore.getState();
    const currentLevel = charStore.level;
    const currentXp = charStore.experience;

    let newXp = currentXp + data.xpReward;
    let newLevel = currentLevel;
    let xpNeeded = this.getXpNeeded(newLevel);
    let didLevelUp = false;

    // Support leveling up multiple times if huge XP is gained
    while (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel++;
      xpNeeded = this.getXpNeeded(newLevel);
      didLevelUp = true;
    }

    // Show floating XP reward
    DamageSystem.showFloatingText(
      this.scene,
      data.x,
      data.y - 12,
      `+${data.xpReward} XP`,
      '#a855f7', // Purple color for XP
      1.1
    );

    if (didLevelUp) {
      this.handleLevelUp(newLevel, newXp);
    } else {
      // Save progress to store & database
      charStore.updateProgress(newLevel, newXp);
    }
  }

  private handleLevelUp(newLevel: number, newXp: number): void {
    const charStore = useCharacterStore.getState();

    // 1. Calculate and update stats
    const currentStats = charStore.baseStats;
    const updatedStats = {
      health: currentStats.health + 2,
      stamina: currentStats.stamina + 2,
      strength: currentStats.strength + 2,
      defense: currentStats.defense + 1,
      agility: currentStats.agility + 1,
    };

    // Update baseStats in the store
    charStore.baseStats = updatedStats;

    // 2. Save progress to database & store
    charStore.updateProgress(newLevel, newXp).then(() => {
      // 3. Set current HP and Stamina to full based on updated derived stats
      const derived = charStore.getDerivedStats();
      charStore.setHp(derived.maxHealth);
      charStore.setStamina(derived.maxStamina);
    });

    // 4. Play visual feedback
    // Flash player golden
    this.player.setTint(0xf59e0b);
    this.scene.time.delayedCall(400, () => {
      this.player.clearTint();
    });

    // Scale bounce player sprite
    this.scene.tweens.add({
      targets: this.player,
      scaleY: 1.3,
      scaleX: 0.8,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // Spawn floating golden text
    DamageSystem.showFloatingText(
      this.scene,
      this.player.x,
      this.player.y - 24,
      `LEVEL UP! (Lvl ${newLevel})`,
      '#fbbf24', // Gold text
      1.5
    );
  }

  /**
   * Helper to get XP needed for a given level.
   */
  public getXpNeeded(level: number): number {
    return 100 * level;
  }

  public destroy(): void {
    this.scene.events.off('enemy:death', this.onEnemyDeath, this);
  }
}
