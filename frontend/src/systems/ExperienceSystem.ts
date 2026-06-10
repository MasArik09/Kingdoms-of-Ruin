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

    // 4. Play enhanced level-up visual feedback

    // --- Phase 1: Rapid golden flash sequence (3 quick pulses) ---
    const flashColors = [0xfbbf24, 0xfde68a, 0xf59e0b];
    flashColors.forEach((color, i) => {
      this.scene.time.delayedCall(i * 120, () => {
        this.player.setTint(color);
        this.scene.time.delayedCall(60, () => {
          this.player.clearTint();
        });
      });
    });

    // --- Phase 2: Expanding golden ring burst ---
    const ringGraphics = this.scene.add.graphics();
    ringGraphics.setDepth(this.player.depth + 5);
    let ringRadius = 8;
    const maxRingRadius = 60;
    this.scene.tweens.addCounter({
      from: 8,
      to: maxRingRadius,
      duration: 500,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        ringRadius = tween.getValue() as number;
        const alpha = 1 - (ringRadius / maxRingRadius);
        ringGraphics.clear();
        ringGraphics.lineStyle(3, 0xfbbf24, alpha * 0.8);
        ringGraphics.strokeCircle(this.player.x, this.player.y, ringRadius);
        ringGraphics.lineStyle(1.5, 0xfde68a, alpha * 0.4);
        ringGraphics.strokeCircle(this.player.x, this.player.y, ringRadius * 0.7);
      },
      onComplete: () => {
        ringGraphics.destroy();
      },
    });

    // --- Phase 3: Sustained golden glow aura (fades over 2s) ---
    const glowGraphics = this.scene.add.graphics();
    glowGraphics.setDepth(this.player.depth - 1);
    glowGraphics.setBlendMode(Phaser.BlendModes.ADD);

    // Draw a soft golden glow behind the player
    const drawGlow = (alpha: number) => {
      glowGraphics.clear();
      glowGraphics.fillStyle(0xf59e0b, alpha * 0.25);
      glowGraphics.fillCircle(this.player.x, this.player.y, 40);
      glowGraphics.fillStyle(0xfbbf24, alpha * 0.15);
      glowGraphics.fillCircle(this.player.x, this.player.y, 55);
    };

    drawGlow(1);

    // Fade out the glow over 2 seconds
    this.scene.tweens.addCounter({
      from: 1,
      to: 0,
      duration: 2000,
      ease: 'Quad.easeIn',
      onUpdate: (tween) => {
        drawGlow(tween.getValue() as number);
        // Keep glow centered on player
        glowGraphics.setPosition(0, 0);
      },
      onComplete: () => {
        glowGraphics.destroy();
      },
    });

    // --- Phase 4: Player tinted golden for 1.5s with pulse ---
    this.scene.time.delayedCall(360, () => {
      this.player.setTint(0xfbbf24);

      // Pulsing scale animation
      this.scene.tweens.add({
        targets: this.player,
        scaleX: 1.2,
        scaleY: 0.85,
        duration: 180,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.player.setScale(1.0);
        },
      });

      // Remove tint after sustained glow period
      this.scene.time.delayedCall(1500, () => {
        this.player.clearTint();
      });
    });

    // --- Phase 5: Camera shake for impact ---
    this.scene.cameras.main.shake(200, 0.005);

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
