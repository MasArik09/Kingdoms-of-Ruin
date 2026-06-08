import Phaser from 'phaser';

export class ToastManager {
  private scene: Phaser.Scene;
  private activeToasts: Phaser.GameObjects.Container[] = [];
  private basePosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.updatePosition();

    // Hook to resize event to keep toasts centered
    this.scene.scale.on('resize', this.updatePosition, this);
  }

  private updatePosition(): void {
    const { width, height } = this.scene.scale;
    this.basePosition = {
      x: width / 2,
      y: height - 120, // Start just above HUD
    };
  }

  public showToast(message: string, isSuccess = true): void {
    const { x, y } = this.basePosition;

    // 1. Limit active toasts to max 4 (dismiss the oldest toast if limit exceeded)
    const maxToasts = 4;
    if (this.activeToasts.length >= maxToasts) {
      const oldestToast = this.activeToasts[0];
      this.scene.tweens.killTweensOf(oldestToast);
      
      this.scene.tweens.add({
        targets: oldestToast,
        alpha: 0,
        y: oldestToast.y - 20,
        duration: 150,
        ease: 'Power2.easeIn',
        onComplete: () => {
          oldestToast.destroy();
        }
      });
      
      this.activeToasts.shift();
    }

    // 2. Shift existing toasts upwards
    const spacing = 48;
    this.activeToasts.forEach((toast) => {
      this.scene.tweens.add({
        targets: toast,
        y: toast.y - spacing,
        duration: 200,
        ease: 'Cubic.easeOut',
      });
    });

    // 3. Create new Toast Container
    const toast = this.scene.add.container(x, y).setScrollFactor(0).setDepth(40000);

    const txt = this.scene.add.text(0, 0, message, {
      fontFamily: 'Montserrat',
      fontSize: '13px',
      color: isSuccess ? '#fcd34d' : '#fca5a5', // Gold for success, light red for error/info
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const paddingX = 20;
    const paddingY = 8;
    const width = txt.width + paddingX * 2;
    const height = txt.height + paddingY * 2;

    const bg = this.scene.add.graphics();
    // Dark fantasy background
    bg.fillStyle(0x0f0c1b, 0.95);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
    // Orange/Gold border for success, red border for others
    bg.lineStyle(1.5, isSuccess ? 0xd97706 : 0xef4444, 0.85);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);

    toast.add([bg, txt]);
    this.activeToasts.push(toast);

    // 3. Slide in, Hold, Slide/Fade out lifecycle
    toast.alpha = 0;
    toast.y = y + 20;

    this.scene.tweens.add({
      targets: toast,
      alpha: 1,
      y: y,
      duration: 250,
      ease: 'Power2.easeOut',
      onComplete: () => {
        // Hold for 2 seconds, then fade out
        this.scene.time.delayedCall(2200, () => {
          this.scene.tweens.add({
            targets: toast,
            alpha: 0,
            y: toast.y - 20,
            duration: 250,
            ease: 'Power2.easeIn',
            onComplete: () => {
              // Remove from array and destroy
              const index = this.activeToasts.indexOf(toast);
              if (index > -1) {
                this.activeToasts.splice(index, 1);
              }
              toast.destroy();
            },
          });
        });
      },
    });
  }

  public destroy(): void {
    this.scene.scale.off('resize', this.updatePosition, this);
    this.activeToasts.forEach((t) => t.destroy());
    this.activeToasts = [];
  }
}
