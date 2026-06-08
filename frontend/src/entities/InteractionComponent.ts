import Phaser from 'phaser';

export class InteractionComponent {
  public parent: Phaser.GameObjects.GameObject;
  public radius: number;
  public offsetX: number;
  public offsetY: number;
  public promptText: string;
  public onInteract: () => void;
  public enabled: boolean;

  constructor(
    parent: Phaser.GameObjects.GameObject,
    config: {
      radius?: number;
      offsetX?: number;
      offsetY?: number;
      promptText?: string;
      onInteract: () => void;
    }
  ) {
    this.parent = parent;
    this.radius = config.radius ?? 64;
    this.offsetX = config.offsetX ?? 0;
    this.offsetY = config.offsetY ?? -24; // Default prompt displays slightly above the object
    this.promptText = config.promptText ?? '[E] Interact';
    this.onInteract = config.onInteract;
    this.enabled = true;
  }

  public getInteractionPosition(): { x: number; y: number } {
    const sprite = this.parent as any;
    return {
      x: (sprite.x ?? 0) + this.offsetX,
      y: (sprite.y ?? 0) + this.offsetY,
    };
  }
}
