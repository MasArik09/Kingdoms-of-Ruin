import Phaser from 'phaser';
import { InteractionComponent } from './InteractionComponent';
import { InteractionSystem } from '../systems/InteractionSystem';

export class Campfire extends Phaser.GameObjects.Container {
  public interaction: InteractionComponent;
  private glow: Phaser.GameObjects.Image;
  private logs: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, system: InteractionSystem) {
    super(scene, x, y);

    this.scene.add.existing(this);
    this.setDepth(y); // Y-depth sorting

    // 1. Light Glow Effect (behind logs) - Smooth radial gradient texture
    this.glow = this.scene.add.image(0, 10, 'campfire-glow');
    this.add(this.glow);

    // Realistic flickering firelight tween (changes scale and alpha dynamically)
    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.75, to: 1.05 },
      scaleX: { from: 0.92, to: 1.08 },
      scaleY: { from: 0.92, to: 1.08 },
      duration: 160,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 2. Base Logs
    this.logs = this.scene.add.image(0, 10, 'campfire-base');
    this.add(this.logs);

    // 3. Smoke Particles (emitted behind the flames)
    const smokeEmitter = this.scene.add.particles(0, 10, 'smoke-particle', {
      lifespan: { min: 1000, max: 1800 },
      speedY: { min: -45, max: -25 },
      speedX: { min: -15, max: 15 },
      scale: { start: 0.5, end: 1.6 },
      alpha: { start: 0.15, end: 0 }, // Softer smoke
      tint: 0x374151, // Slate/gray smoke
      frequency: 140,
      quantity: 1,
    });
    this.add(smokeEmitter);

    // 4. Main Flame Particles
    const fireEmitter = this.scene.add.particles(0, 10, 'fire-particle', {
      lifespan: { min: 450, max: 750 },
      speedY: { min: -85, max: -50 },
      speedX: { min: -15, max: 15 },
      scale: { start: 1.2, end: 0.2 }, // Slightly smaller fire core
      alpha: { start: 0.45, end: 0 },  // Fainter core to prevent blinding white glow
      tint: { start: 0xffcc00, end: 0xff3300 }, // Warm orange-yellow to red
      blendMode: 'ADD',
      frequency: 35, // Less dense emission frequency to prevent brightness blow-out
      quantity: 1,
    });
    this.add(fireEmitter);

    // 5. Rising Spark Particles
    const sparkEmitter = this.scene.add.particles(0, 5, 'spark-particle', {
      lifespan: { min: 700, max: 1400 },
      speedY: { min: -150, max: -80 },
      speedX: { min: -35, max: 35 },
      scale: { start: 0.9, end: 0.15 }, // Smaller spark sizes
      alpha: { start: 0.8, end: 0 },      // Fainter sparks
      tint: { start: 0xfff088, end: 0xff5500 },
      blendMode: 'ADD',
      frequency: 90, // Less frequent spark pops
      quantity: 1,
      maxParticles: 20,
    });
    this.add(sparkEmitter);

    // 6. Setup Interaction Component
    this.interaction = new InteractionComponent(this, {
      radius: 70,
      offsetX: 0,
      offsetY: -16,
      promptText: '[E] Rest',
      onInteract: () => {
        // Emit global event, handled in WorldScene to trigger toast
        this.scene.events.emit('landmark:campfire-rest');
      },
    });

    system.register(this.interaction);
  }

  public destroy(fromScene?: boolean): void {
    if (this.glow) {
      this.scene.tweens.killTweensOf(this.glow);
    }
    super.destroy(fromScene);
  }
}
