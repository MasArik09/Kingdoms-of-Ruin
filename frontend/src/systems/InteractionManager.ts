import Phaser from 'phaser';
import { InteractionSystem } from './InteractionSystem';
import { InteractionComponent } from '../entities/InteractionComponent';

export class InteractionManager {
  private scene: Phaser.Scene;
  private system: InteractionSystem;
  private player: Phaser.Physics.Arcade.Sprite;

  private activeInteractable: InteractionComponent | null = null;
  private promptContainer: Phaser.GameObjects.Container;
  private promptText: Phaser.GameObjects.Text;
  private promptBg: Phaser.GameObjects.Graphics;

  private interactKey: Phaser.Input.Keyboard.Key | null = null;

  constructor(
    scene: Phaser.Scene,
    system: InteractionSystem,
    player: Phaser.Physics.Arcade.Sprite
  ) {
    this.scene = scene;
    this.system = system;
    this.player = player;

    // 1. Create Floating Prompt Container
    this.promptContainer = this.scene.add.container(0, 0).setDepth(10000); // Render above all map elements

    this.promptBg = this.scene.add.graphics();
    this.promptText = this.scene.add.text(0, 0, '', {
      fontFamily: 'Montserrat',
      fontSize: '12px',
      color: '#fcd34d', // Gold text
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.promptContainer.add([this.promptBg, this.promptText]);
    this.promptContainer.setVisible(false);

    // 2. Register Keyboard Input E
    if (this.scene.input.keyboard) {
      this.interactKey = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E
      );
      this.interactKey.on('down', this.onInteractKeyPress, this);
    }
  }

  public update(): void {
    if (!this.player) return;

    // Query closest interactable based on player's physics body center (feet/shoulders)
    const closest = this.system.getClosestInteractable(this.player.x, this.player.y);

    if (closest) {
      if (this.activeInteractable !== closest) {
        this.activeInteractable = closest;
        this.showPrompt(closest);
      } else {
        // Update position in case of dynamic movement (though mostly static)
        const pos = closest.getInteractionPosition();
        this.promptContainer.setPosition(pos.x, pos.y);
      }
    } else {
      if (this.activeInteractable) {
        this.activeInteractable = null;
        this.hidePrompt();
      }
    }
  }

  private showPrompt(comp: InteractionComponent): void {
    const textStr = comp.promptText;
    this.promptText.setText(textStr);

    // Dynamic width based on text length
    const paddingX = 14;
    const paddingY = 6;
    const textWidth = this.promptText.width;
    const textHeight = this.promptText.height;
    const width = textWidth + paddingX * 2;
    const height = textHeight + paddingY * 2;

    this.promptBg.clear();
    // Premium dark indigo backing
    this.promptBg.fillStyle(0x0f0c1b, 0.85);
    this.promptBg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
    // Gold border line
    this.promptBg.lineStyle(1.5, 0xd97706, 0.85);
    this.promptBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);

    const pos = comp.getInteractionPosition();
    this.promptContainer.setPosition(pos.x, pos.y);
    this.promptContainer.setVisible(true);

    // Subtle float animation
    this.scene.tweens.killTweensOf(this.promptContainer);
    this.promptContainer.y = pos.y + 4;
    this.scene.tweens.add({
      targets: this.promptContainer,
      y: pos.y - 4,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private hidePrompt(): void {
    this.scene.tweens.killTweensOf(this.promptContainer);
    this.promptContainer.setVisible(false);
  }

  private onInteractKeyPress(): void {
    if (this.activeInteractable && this.activeInteractable.enabled) {
      // Small scale click visual cue
      this.scene.tweens.add({
        targets: this.promptContainer,
        scale: 0.9,
        duration: 80,
        yoyo: true,
        ease: 'Cubic.easeOut',
      });

      this.activeInteractable.onInteract();
    }
  }

  public destroy(): void {
    if (this.interactKey) {
      this.interactKey.off('down', this.onInteractKeyPress, this);
    }
    this.promptContainer.destroy();
  }
}
