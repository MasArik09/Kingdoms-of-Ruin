import Phaser from 'phaser';
import { InteractionComponent } from './InteractionComponent';
import { InteractionSystem } from '../systems/InteractionSystem';

export class TreasureChest extends Phaser.Physics.Arcade.Sprite {
  public interaction: InteractionComponent;
  private shadow: Phaser.GameObjects.Image;
  private isOpened = false;

  constructor(scene: Phaser.Scene, x: number, y: number, system: InteractionSystem) {
    super(scene, x, y, 'chest-closed');

    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    this.setDepth(y);

    // Create shadow on the scene
    this.shadow = scene.add.image(x, y + 16, 'shadow').setScale(1.2, 0.45).setAlpha(0.8);
    this.shadow.setDepth(y - 1);

    // 3. Configure Static Physics Body
    this.scene.physics.add.existing(this, true);

    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(44, 36);
      // Center chest collision box inside the 64x64 frame (starts at x=10, y=20)
      body.setOffset(10, 20); 
    }

    // Setup Interaction Component
    this.interaction = new InteractionComponent(this, {
      radius: 64,
      offsetX: 0,
      offsetY: 0,
      promptText: '[E] Open Chest',
      onInteract: () => {
        this.open(system);
      },
    });

    system.register(this.interaction);
  }

  public open(system: InteractionSystem): void {
    if (this.isOpened) return;
    this.isOpened = true;

    // Change texture
    this.setTexture('chest-open');

    // Bounce tween effect
    this.scene.tweens.add({
      targets: this,
      scaleY: 1.25,
      scaleX: 0.9,
      duration: 120,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // Disable and unregister interaction
    this.interaction.enabled = false;
    system.unregister(this.interaction);

    // Emit event for looting
    this.scene.events.emit('landmark:chest-loot', {
      itemId: 'wood',
      quantity: 5,
    });
  }

  public destroy(fromScene?: boolean): void {
    if (this.shadow) {
      this.shadow.destroy();
    }
    super.destroy(fromScene);
  }
}
