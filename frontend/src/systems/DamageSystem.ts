import Phaser from 'phaser';
import { getCharacterCombatStats } from './CharacterCombatStats';
import { useCharacterStore } from '../stores/characterStore';
import { EnemyBase } from '../entities/EnemyBase';

export class DamageSystem {
  private static playerInvincibilityDuration = 1000; // 1 second invincibility
  private static playerLastHitTime = 0;

  // --- Player floating health bar state ---
  private static playerHealthBar: Phaser.GameObjects.Graphics | null = null;
  private static playerHealthBarAlpha = 0;
  private static playerHealthBarVisible = false;
  private static playerLastDamageTime = 0;
  private static playerBarShowDuration = 3000;   // Visible 3 seconds after damage
  private static playerBarFadeDuration = 600;     // Fade out over 600ms

  /**
   * Call this every frame from WorldScene.update() to keep the player health bar synced.
   */
  public static updatePlayerHealthBar(
    scene: Phaser.Scene,
    player: Phaser.Physics.Arcade.Sprite
  ): void {
    if (!player || !player.active) return;

    // Create graphics object on first call
    if (!this.playerHealthBar || !this.playerHealthBar.active) {
      this.playerHealthBar = scene.add.graphics();
    }

    const now = scene.time.now;
    const timeSinceDamage = now - this.playerLastDamageTime;

    // Update alpha based on combat timing
    if (this.playerHealthBarVisible) {
      if (timeSinceDamage < this.playerBarShowDuration) {
        this.playerHealthBarAlpha = Math.min(1, this.playerHealthBarAlpha + 0.1);
      } else if (timeSinceDamage < this.playerBarShowDuration + this.playerBarFadeDuration) {
        const fadeProgress = (timeSinceDamage - this.playerBarShowDuration) / this.playerBarFadeDuration;
        this.playerHealthBarAlpha = 1 - fadeProgress;
      } else {
        this.playerHealthBarAlpha = 0;
        this.playerHealthBarVisible = false;
      }
    }

    // Draw the bar
    this.playerHealthBar.clear();
    if (this.playerHealthBarAlpha <= 0) return;

    this.playerHealthBar.setAlpha(this.playerHealthBarAlpha);

    const stats = getCharacterCombatStats();
    const healthPercent = Math.max(0, stats.hp / stats.maxHp);

    const barWidth = 40;
    const barHeight = 5;
    const barX = player.x - barWidth / 2;
    const barY = player.y - 42;
    this.playerHealthBar.setDepth(player.depth + 10);

    // Black border
    this.playerHealthBar.fillStyle(0x111111, 0.9);
    this.playerHealthBar.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    // Dark red background
    this.playerHealthBar.fillStyle(0x7f1d1d, 1);
    this.playerHealthBar.fillRect(barX, barY, barWidth, barHeight);

    // Health color based on percentage
    let barColor = 0x3b82f6; // Blue for player (distinct from enemy green)
    if (healthPercent < 0.3) {
      barColor = 0xef4444; // Red (critical)
    } else if (healthPercent < 0.6) {
      barColor = 0xf59e0b; // Amber (wounded)
    }
    this.playerHealthBar.fillStyle(barColor, 1);
    this.playerHealthBar.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Bright highlight on top
    this.playerHealthBar.fillStyle(0xffffff, 0.3);
    this.playerHealthBar.fillRect(barX, barY, barWidth * healthPercent, 1);
  }

  /** Trigger visibility of the player health bar */
  private static showPlayerHealthBar(scene: Phaser.Scene): void {
    this.playerHealthBarVisible = true;
    this.playerHealthBarAlpha = 1;
    this.playerLastDamageTime = scene.time.now;
  }

  /**
   * Applies damage from player to an enemy.
   */
  public static applyDamageToEnemy(
    scene: Phaser.Scene,
    player: Phaser.Physics.Arcade.Sprite,
    enemy: EnemyBase
  ): void {
    if (enemy.isDead) return;

    const stats = getCharacterCombatStats();
    
    // Formula: Attack Power minus Defender's Defense
    const finalDamage = Math.max(1, stats.attackPower - enemy.defense);

    // Apply damage to enemy
    enemy.takeDamage(finalDamage);

    // Show floating red text
    this.showFloatingText(scene, enemy.x, enemy.y, finalDamage.toString(), '#ef4444', 1.3);
    
    // Small pushback effect on enemy
    if (enemy.body) {
      const angle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
      const pushX = Math.cos(angle) * 80;
      const pushY = Math.sin(angle) * 80;
      
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(pushX, pushY);
      
      // Stop velocity after 150ms
      scene.time.delayedCall(150, () => {
        if (enemy.active && !enemy.isDead && enemy.body) {
          (enemy.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        }
      });
    }
  }

  /**
   * Applies damage from an enemy to the player.
   */
  public static applyDamageToPlayer(
    scene: Phaser.Scene,
    player: Phaser.Physics.Arcade.Sprite,
    enemy: EnemyBase
  ): void {
    if (enemy.isDead) return;

    const time = scene.time.now;
    if (time - this.playerLastHitTime < this.playerInvincibilityDuration) {
      return; // Player is invincible right now
    }

    this.playerLastHitTime = time;
    const stats = getCharacterCombatStats();

    // Formula: Enemy Attack minus Player Defense
    const finalDamage = Math.max(1, enemy.attackPower - stats.defense);
    const nextHp = Math.max(0, stats.hp - finalDamage);

    // Update player HP in store
    useCharacterStore.getState().setHp(nextHp);

    // Show player health bar
    this.showPlayerHealthBar(scene);

    // Visual feedback: flash player red
    player.setTint(0xff5555);
    scene.time.delayedCall(150, () => {
      player.clearTint();
    });

    // Knockback player slightly
    if (player.body) {
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
      const body = player.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);
      
      scene.time.delayedCall(150, () => {
        if (player.active && player.body) {
          (player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        }
      });
    }

    // Show floating orange text
    this.showFloatingText(scene, player.x, player.y, finalDamage.toString(), '#f97316', 1.2);

    // If player HP reaches 0, trigger a game over toast (or reset HP for testing convenience)
    if (nextHp <= 0) {
      scene.events.emit('player:death');
    }
  }

  /**
   * Helper to spawn drifting, scaling floating text at coordinates.
   */
  public static showFloatingText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    color: string,
    scale = 1.0
  ): void {
    const randomX = x + Phaser.Math.Between(-12, 12);
    const floatingText = scene.add.text(randomX, y - 16, text, {
      fontSize: '18px',
      fontFamily: 'Outfit, Inter, sans-serif',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold',
    }).setOrigin(0.5).setScale(scale);
    floatingText.setDepth(y + 100);

    scene.tweens.add({
      targets: floatingText,
      y: y - 56,
      alpha: 0,
      scale: scale * 1.3,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        floatingText.destroy();
      },
    });
  }
}
