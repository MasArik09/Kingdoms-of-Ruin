import Phaser from 'phaser';

export abstract class EnemyBase extends Phaser.Physics.Arcade.Sprite {
  public id: string;
  public enemyType: string;
  public maxHp: number;
  public hp: number;
  public attackPower: number;
  public defense: number;
  public xpReward: number;
  public isDead = false;

  protected shadow: Phaser.GameObjects.Image;
  protected healthBar: Phaser.GameObjects.Graphics;

  // Health bar visibility state
  private healthBarAlpha = 0;
  private healthBarVisible = false;
  private lastDamageTime = 0;
  private healthBarShowDuration = 3000;  // Show for 3 seconds after damage
  private healthBarFadeDuration = 600;   // Fade out over 600ms

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    type: string,
    stats: { maxHp: number; attackPower: number; defense: number; xpReward: number }
  ) {
    super(scene, x, y, texture);

    this.id = id;
    this.enemyType = type;
    this.maxHp = stats.maxHp;
    this.hp = stats.maxHp;
    this.attackPower = stats.attackPower;
    this.defense = stats.defense;
    this.xpReward = stats.xpReward;

    // Add to scene & physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup visual components
    this.shadow = scene.add.image(x, y + 16, 'shadow').setScale(0.8, 0.3).setAlpha(0.5);
    this.shadow.setDepth(y - 1);

    this.healthBar = scene.add.graphics();
    this.healthBar.setDepth(y + 10); // Keep above other entities
    this.healthBar.setAlpha(0); // Start invisible

    this.setDepth(y);
    this.setOrigin(0.5, 0.5);

    // Configure physics properties
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setCollideWorldBounds(true);
      // Square colliders fit 64x64 sprites nicely
      body.setSize(32, 24);
      body.setOffset(16, 28);
    }
  }

  public update(): void {
    if (this.isDead) return;

    // Keep depth updated with position for proper overlapping
    this.setDepth(this.y);

    // Sync shadow position
    if (this.shadow) {
      this.shadow.setPosition(this.x, this.y + 12);
      this.shadow.setDepth(this.depth - 1);
    }

    // Update health bar visibility (fade in/out logic)
    this.updateHealthBarVisibility();

    // Redraw health bar
    this.drawHealthBar();
  }

  private updateHealthBarVisibility(): void {
    const now = this.scene.time.now;
    const timeSinceDamage = now - this.lastDamageTime;

    if (this.healthBarVisible) {
      if (timeSinceDamage < this.healthBarShowDuration) {
        // Still in combat — fully visible
        this.healthBarAlpha = Math.min(1, this.healthBarAlpha + 0.1);
      } else if (timeSinceDamage < this.healthBarShowDuration + this.healthBarFadeDuration) {
        // Fading out
        const fadeProgress = (timeSinceDamage - this.healthBarShowDuration) / this.healthBarFadeDuration;
        this.healthBarAlpha = 1 - fadeProgress;
      } else {
        // Fully faded
        this.healthBarAlpha = 0;
        this.healthBarVisible = false;
      }
    }
  }

  protected drawHealthBar(): void {
    this.healthBar.clear();
    if (this.hp <= 0 || this.healthBarAlpha <= 0) return;

    this.healthBar.setAlpha(this.healthBarAlpha);

    const barWidth = 36;
    const barHeight = 5;
    const barX = this.x - barWidth / 2;
    const barY = this.y - 22;
    this.healthBar.setDepth(this.depth + 10);

    // Draw background (dark border)
    this.healthBar.fillStyle(0x111111, 0.9);
    this.healthBar.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    // Draw dark red background (damage portion)
    this.healthBar.fillStyle(0x7f1d1d, 1);
    this.healthBar.fillRect(barX, barY, barWidth, barHeight);

    // Draw remaining health with color based on percentage
    const healthPercent = Math.max(0, this.hp / this.maxHp);
    let barColor = 0x22c55e; // Green
    if (healthPercent < 0.3) {
      barColor = 0xef4444; // Red (critical)
    } else if (healthPercent < 0.6) {
      barColor = 0xf59e0b; // Orange/amber (wounded)
    }
    this.healthBar.fillStyle(barColor, 1);
    this.healthBar.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Thin bright highlight at top of health bar
    this.healthBar.fillStyle(0xffffff, 0.3);
    this.healthBar.fillRect(barX, barY, barWidth * healthPercent, 1);
  }

  /** Call this to trigger health bar visibility on damage */
  private showHealthBar(): void {
    this.healthBarVisible = true;
    this.healthBarAlpha = 1;
    this.lastDamageTime = this.scene.time.now;
  }

  public takeDamage(amount: number): void {
    if (this.isDead) return;

    this.hp = Math.max(0, this.hp - amount);

    // Show health bar on damage
    this.showHealthBar();

    // Damage flash (tilt red)
    this.setTint(0xff5555);
    this.scene.time.delayedCall(150, () => {
      this.clearTint();
    });

    // Bouncy scale feedback on hit
    this.scene.tweens.add({
      targets: this,
      scaleY: this.scaleY * 0.85,
      scaleX: this.scaleX * 1.15,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    if (this.hp <= 0) {
      this.die();
    }
  }

  protected die(): void {
    this.isDead = true;
    
    // Disable physics body to prevent combat triggers
    if (this.body) {
      this.body.enable = false;
    }

    // Hide health bar
    this.healthBar.clear();

    // Death visual effect: fade out and slide downwards
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.1,
      scaleY: 0.1,
      y: this.y + 10,
      duration: 350,
      ease: 'Power2',
      onComplete: () => {
        // Emit death event for progression system
        this.scene.events.emit('enemy:death', {
          id: this.id,
          type: this.enemyType,
          xpReward: this.xpReward,
          x: this.x,
          y: this.y,
        });

        this.destroy();
      },
    });

    if (this.shadow) {
      this.scene.tweens.add({
        targets: this.shadow,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 350,
      });
    }
  }

  public destroy(fromScene?: boolean): void {
    if (this.shadow) this.shadow.destroy();
    if (this.healthBar) this.healthBar.destroy();
    super.destroy(fromScene);
  }
}
