import Phaser from 'phaser';
import { EnemyBase } from './EnemyBase';
import { EnemyRegistry } from '../config/enemyRegistry';

export class Slime extends EnemyBase {
  private player: Phaser.Physics.Arcade.Sprite;
  private nextHopTime = 0;
  private isHopping = false;
  private aggroRange = 250;
  private baseScale = 0.9;

  constructor(scene: Phaser.Scene, x: number, y: number, id: string, player: Phaser.Physics.Arcade.Sprite) {
    const def = EnemyRegistry.slime;
    super(scene, x, y, def.texture, id, def.type, {
      maxHp: def.maxHp,
      attackPower: def.attackPower,
      defense: def.defense,
      xpReward: def.xpReward,
    });

    this.player = player;
    this.baseScale = def.scale;
    this.setScale(this.baseScale);
    
    // Set random delay for initial hop to stagger enemy movements
    this.nextHopTime = scene.time.now + Phaser.Math.Between(500, 2000);
  }

  public update(): void {
    if (this.isDead) return;

    super.update();

    const time = this.scene.time.now;
    if (time >= this.nextHopTime && !this.isHopping) {
      this.hop();
    }
  }

  private hop(): void {
    this.isHopping = true;
    const def = EnemyRegistry.slime;

    // 1. Calculate direction (chase player if within range, otherwise wander)
    const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
    let angle = 0;

    if (distanceToPlayer <= this.aggroRange) {
      // Chase player
      angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    } else {
      // Wander in random direction
      angle = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
    }

    // Flip sprite based on movement direction
    const dx = Math.cos(angle);
    this.setFlipX(dx > 0);

    // 2. Visual leap anticipation: squish down first
    this.scene.tweens.add({
      targets: this,
      scaleX: this.baseScale * 1.3,
      scaleY: this.baseScale * 0.7,
      duration: 150,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (this.isDead || !this.body) return;

        // Apply leap velocity
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(Math.cos(angle) * def.speed * 2, Math.sin(angle) * def.speed * 2);

        // Visual leap stretch: stretch tall in mid-air
        this.scene.tweens.add({
          targets: this,
          scaleX: this.baseScale * 0.8,
          scaleY: this.baseScale * 1.4,
          y: this.y - 12, // Slight jump offset
          duration: 250,
          yoyo: true,
          ease: 'Sine.easeOut',
          onComplete: () => {
            if (this.isDead || !this.body) return;

            // Decelerate body on landing
            body.setDrag(200);

            // Visual land impact: squish on impact, then restore scale
            this.scene.tweens.add({
              targets: this,
              scaleX: this.baseScale * 1.25,
              scaleY: this.baseScale * 0.85,
              duration: 120,
              yoyo: true,
              ease: 'Quad.easeIn',
              onComplete: () => {
                if (this.isDead) return;
                this.setScale(this.baseScale);
                this.isHopping = false;
                
                // Clear drag and velocity
                if (this.body) {
                  const b = this.body as Phaser.Physics.Arcade.Body;
                  b.setVelocity(0, 0);
                  b.setDrag(0);
                }

                // Schedule next hop (1.5 to 2.5 seconds wait)
                this.nextHopTime = this.scene.time.now + Phaser.Math.Between(1500, 2500);
              },
            });
          },
        });
      },
    });
  }
}
