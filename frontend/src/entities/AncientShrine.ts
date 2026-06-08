import Phaser from 'phaser';
import { InteractionComponent } from './InteractionComponent';
import { InteractionSystem } from '../systems/InteractionSystem';

export class AncientShrine extends Phaser.Physics.Arcade.Sprite {
  public interaction: InteractionComponent;
  private shadow: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, system: InteractionSystem) {
    super(scene, x, y, 'shrine');

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    this.setDepth(y + 20);

    // Platform Drop Shadow on scene
    this.shadow = scene.add.image(x, y + 44, 'shadow').setScale(2.2, 0.7).setAlpha(0.85);
    this.shadow.setDepth(y + 20 - 1);

    // 3. Configure Static Physics Body for Collisions
    this.scene.physics.add.existing(this, true);

    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(96, 44);
      // Center shrine collision box inside the 128x128 frame (starts at x=16, y=76 relative to center)
      body.setOffset(16, 76);
    }

    // Setup Interaction Component
    this.interaction = new InteractionComponent(this, {
      radius: 90,
      offsetX: 0,
      offsetY: 24,
      promptText: '[E] Examine',
      onInteract: () => {
        this.scene.events.emit('landmark:shrine-examine');
      },
    });

    system.register(this.interaction);
  }

  public destroy(fromScene?: boolean): void {
    if (this.shadow) {
      this.shadow.destroy();
    }
    super.destroy(fromScene);
  }
}
