import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private moonGlowGraphics!: Phaser.GameObjects.Graphics;
  private moonImage!: Phaser.GameObjects.Image;

  // Ruined castle composition layers
  private ruinsBgImg!: Phaser.GameObjects.Image;     // Distant background fortress silhouette
  private ruinsLeftImg!: Phaser.GameObjects.Image;   // Supporting left edge watchtower ruins
  private ruinsRightImg!: Phaser.GameObjects.Image;  // Supporting right edge crumbling walls
  private ruinsCenterImg!: Phaser.GameObjects.Image; // Large central gatehouse/keep fortress

  private titleBarGraphics!: Phaser.GameObjects.Graphics;
  private glowTitleText!: Phaser.GameObjects.Text;
  private mainTitleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private buttonsContainerArray: Phaser.GameObjects.Container[] = [];
  private toastContainer: Phaser.GameObjects.Container | null = null;

  // Clouds (bg = behind moon, fg = in front of moon/castle)
  private bgClouds: Phaser.GameObjects.Image[] = [];
  private fgClouds: Phaser.GameObjects.Image[] = [];
  private bgCloudSpeeds: number[] = [];
  private fgCloudSpeeds: number[] = [];

  private fogs: Phaser.GameObjects.Image[] = [];
  private fogSpeeds: number[] = [];
  private embersGraphics!: Phaser.GameObjects.Graphics;
  private particleArray: Array<{ x: number; y: number; speedY: number; speedX: number; radius: number; alpha: number }> = [];

  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // 1. Sky Background Graphics
    this.bgGraphics = this.add.graphics();

    // 2. Background Clouds (behind moon)
    const bgCloudCount = 3;
    for (let i = 0; i < bgCloudCount; i++) {
      const c = this.add.image(
        Phaser.Math.Between(-100, width),
        Phaser.Math.Between(30, 150),
        'cloud'
      ).setOrigin(0.5).setAlpha(Phaser.Math.FloatBetween(0.08, 0.15)).setScale(Phaser.Math.FloatBetween(0.6, 1.0));
      
      c.setTint(0x7c3aed);
      this.bgClouds.push(c);
      this.bgCloudSpeeds.push(Phaser.Math.FloatBetween(0.06, 0.16));
    }

    // 3. Layered Moon Glow Graphics (Halo)
    this.moonGlowGraphics = this.add.graphics();

    // 4. Cratered Moon Image
    this.moonImage = this.add.image(0, 0, 'moon').setOrigin(0.5).setScale(1.25);

    // 5. Distant Background Fortress Silhouette
    this.ruinsBgImg = this.add.image(0, 0, 'fortress-bg').setScale(1.2).setOrigin(0.5, 1).setAlpha(0.24).setTint(0x0e081c);

    // 6. Foreground Clouds (passing IN FRONT of the moon/bg structures)
    const fgCloudCount = 3;
    for (let i = 0; i < fgCloudCount; i++) {
      const c = this.add.image(
        Phaser.Math.Between(-150, width),
        Phaser.Math.Between(100, 240),
        'cloud'
      ).setOrigin(0.5).setAlpha(Phaser.Math.FloatBetween(0.25, 0.45)).setScale(Phaser.Math.FloatBetween(0.5, 0.9));
      
      c.setTint(0x93c5fd);
      this.fgClouds.push(c);
      this.fgCloudSpeeds.push(Phaser.Math.FloatBetween(0.12, 0.32));
    }

    // 7. Supporting Ruins at the screen edges
    this.ruinsLeftImg = this.add.image(0, 0, 'ruins-edge-left').setScale(1.2).setOrigin(0, 1).setAlpha(0.95).setTint(0x07040d);
    this.ruinsRightImg = this.add.image(0, 0, 'ruins-edge-right').setScale(1.2).setOrigin(1, 1).setAlpha(0.95).setTint(0x07040d);

    // 8. Large Ruined Central Fortress Keep (Connected walls, main gate, spires, banner)
    this.ruinsCenterImg = this.add.image(0, 0, 'fortress-center').setScale(1.35).setOrigin(0.5, 1).setTint(0x07040e);

    // 9. Low Lying Drifting Fog
    const fogCount = 3;
    for (let i = 0; i < fogCount; i++) {
      const f = this.add.image(
        Phaser.Math.Between(-200, width),
        height - Phaser.Math.Between(10, 60),
        'cloud'
      ).setOrigin(0.5, 1).setAlpha(Phaser.Math.FloatBetween(0.08, 0.16)).setScale(Phaser.Math.FloatBetween(2.0, 3.0), Phaser.Math.FloatBetween(0.6, 1.0));
      
      f.setTint(0xa78bfa);
      this.fogs.push(f);
      this.fogSpeeds.push(Phaser.Math.FloatBetween(0.15, 0.45));
    }

    // 10. Floating Sparks / Embers Graphics
    this.embersGraphics = this.add.graphics();
    const particleCount = 35;
    for (let i = 0; i < particleCount; i++) {
      this.particleArray.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(height / 2, height),
        speedY: Phaser.Math.FloatBetween(-0.15, -0.45),
        speedX: Phaser.Math.FloatBetween(-0.08, 0.08),
        radius: Phaser.Math.FloatBetween(1, 2.5),
        alpha: Phaser.Math.FloatBetween(0.15, 0.55),
      });
    }

    // 11. High-Contrast Title Shroud Backing (Improves legibility)
    this.titleBarGraphics = this.add.graphics();

    // 10. Title Logo Outer Glow Text
    this.glowTitleText = this.add.text(0, 0, 'KINGDOMS OF RUIN', {
      fontFamily: 'Cinzel',
      fontSize: '64px',
      fontStyle: '900',
      color: '#d97706',
    }).setOrigin(0.5).setAlpha(0.25);

    this.glowTitleText.setShadow(0, 0, '#f59e0b', 20, true, false);

    this.tweens.add({
      targets: this.glowTitleText,
      alpha: 0.65,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 13. Main Title Text
    this.mainTitleText = this.add.text(0, 0, 'KINGDOMS OF RUIN', {
      fontFamily: 'Cinzel',
      fontSize: '64px',
      fontStyle: '900',
    }).setOrigin(0.5);

    // Apply linear gold gradient fill
    const gradient = this.mainTitleText.context.createLinearGradient(0, -30, 0, 30);
    gradient.addColorStop(0, '#fef08a');
    gradient.addColorStop(0.4, '#f59e0b');
    gradient.addColorStop(0.7, '#d97706');
    gradient.addColorStop(1.0, '#78350f');
    this.mainTitleText.setFill(gradient);

    // Extra heavy outline & drop shadow for readability
    this.mainTitleText.setStroke('#05030b', 14);
    this.mainTitleText.setShadow(4, 6, 'rgba(0,0,0,0.95)', 16, true, true);

    // Subtitle Text
    this.subtitleText = this.add.text(0, 0, 'PHASE 0A VISUAL VERTICAL SLICE', {
      fontFamily: 'Montserrat',
      fontSize: '14px',
      color: '#a78bfa',
      letterSpacing: 6,
      fontStyle: '600',
    }).setOrigin(0.5).setShadow(2, 3, '#000000', 8);

    // 14. Centered Action Buttons
    this.buttonsContainerArray.push(
      this.createFantasyButton('NEW GAME', () => {
        this.cameras.main.fade(800, 10, 6, 20);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('WorldScene');
        });
      })
    );

    this.buttonsContainerArray.push(
      this.createFantasyButton('SETTINGS', () => {
        this.showFeedbackToast('Settings menu will be added in Phase 3');
      })
    );

    this.buttonsContainerArray.push(
      this.createFantasyButton('EXIT', () => {
        this.showFeedbackToast('Exit application will be added in Phase 2');
      })
    );

    // Apply initial layout positions
    this.resize(this.scale);

    // 15. Hook up resize event listener
    this.scale.on('resize', this.resize, this);

    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resize, this);
    });

    // Camera fade-in
    this.cameras.main.fadeIn(800, 10, 6, 20);

    // Update particle and cloud drifts
    this.events.on('update', () => {
      const { width: currentW, height: currentH } = this.scale;

      // Drift bg clouds
      for (let i = 0; i < this.bgClouds.length; i++) {
        const cloud = this.bgClouds[i];
        cloud.x += this.bgCloudSpeeds[i];
        if (cloud.x - cloud.width * cloud.scaleX > currentW) {
          cloud.x = -cloud.width * cloud.scaleX;
          cloud.y = Phaser.Math.Between(30, 150);
        }
      }

      // Drift fg clouds (in front of moon/castle)
      for (let i = 0; i < this.fgClouds.length; i++) {
        const cloud = this.fgClouds[i];
        cloud.x += this.fgCloudSpeeds[i];
        if (cloud.x - cloud.width * cloud.scaleX > currentW) {
          cloud.x = -cloud.width * cloud.scaleX;
          cloud.y = Phaser.Math.Between(100, 240);
        }
      }

      // Drift fogs
      for (let i = 0; i < this.fogs.length; i++) {
        const fog = this.fogs[i];
        fog.x += this.fogSpeeds[i];
        if (fog.x - fog.width * fog.scaleX > currentW) {
          fog.x = -fog.width * fog.scaleX;
        }
      }

      // Embers
      this.embersGraphics.clear();
      this.particleArray.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < currentH / 2 - 50) {
          p.y = currentH;
          p.x = Phaser.Math.Between(0, currentW);
        }

        this.embersGraphics.fillStyle(0xf59e0b, p.alpha);
        this.embersGraphics.fillCircle(p.x, p.y, p.radius);
      });
    });
  }

  private resize(gameSize: { width: number; height: number }) {
    const { width, height } = gameSize;

    // 1. Redraw background gradient
    this.bgGraphics.clear();
    this.bgGraphics.fillGradientStyle(0x050409, 0x050409, 0x110a22, 0x110a22, 1);
    this.bgGraphics.fillRect(0, 0, width, height);

    // 2. Position Large Central Ruined Fortress Silhouette
    // Scales to look massive and fit screen bottom nicely
    this.ruinsCenterImg.setPosition(width / 2, height - 15);

    // 3. Position moon to visually frame the fortress center peak (right flank tower)
    // Tower peak is at x = center + (scaled offset of tower relative to texture center)
    // Texture width is 384, right tower is at x=266 (offset from center is +74)
    // At scale 1.35, the visual offset is +74 * 1.35 = +100 pixels
    // Visually center the moon behind this peak:
    const moonX = width / 2 + 100;
    // Right tower peak height is y=50 relative to texture bottom (256-50=206 offset)
    // Visual offset is -206 * 1.35 = -278 pixels from screen bottom
    const moonY = height - 200;

    this.moonGlowGraphics.clear();
    this.moonGlowGraphics.fillStyle(0xfffbeb, 0.02);
    this.moonGlowGraphics.fillCircle(moonX, moonY, 120);
    this.moonGlowGraphics.fillStyle(0xfffbeb, 0.05);
    this.moonGlowGraphics.fillCircle(moonX, moonY, 90);
    this.moonGlowGraphics.fillStyle(0xfffbeb, 0.12);
    this.moonGlowGraphics.fillCircle(moonX, moonY, 70);
    this.moonGlowGraphics.fillStyle(0xfffbeb, 0.22);
    this.moonGlowGraphics.fillCircle(moonX, moonY, 54);

    this.moonImage.setPosition(moonX, moonY);

    // 4. Position Distant background fortress
    this.ruinsBgImg.setPosition(width / 2, height - 25);

    // 5. Position Supporting Edge watchtowers ruins
    this.ruinsLeftImg.setPosition(0, height);
    this.ruinsRightImg.setPosition(width, height);

    // 6. Reposition Title Text & high contrast backing bar
    const titleY = height / 3 - 25;

    this.titleBarGraphics.clear();
    this.titleBarGraphics.fillGradientStyle(
      0x000000, 0x000000, 0x000000, 0x000000,
      0, 0.45, 0.45, 0
    );
    this.titleBarGraphics.fillRect(0, titleY - 60, width, 120);

    this.glowTitleText.setPosition(width / 2, titleY);
    this.mainTitleText.setPosition(width / 2, titleY);
    this.subtitleText.setPosition(width / 2, titleY + 65);

    // 7. Reposition Buttons
    const startY = height / 2 + 60;
    const buttonSpacing = 72;
    this.buttonsContainerArray.forEach((btn, idx) => {
      btn.setPosition(width / 2, startY + (idx * buttonSpacing));
    });

    // 8. Reposition toast
    if (this.toastContainer && this.toastContainer.active) {
      this.toastContainer.setPosition(width / 2, height - 100);
    }
  }

  private createFantasyButton(text: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);

    const plate = this.add.image(0, 0, 'button-plate').setOrigin(0.5);
    const label = this.add.text(0, -2, text, {
      fontFamily: 'Montserrat',
      fontSize: '18px',
      color: '#fef08a',
      fontStyle: '700',
    }).setOrigin(0.5);

    label.setShadow(2, 2, '#000000', 4);
    container.add([plate, label]);

    plate.setInteractive({ useHandCursor: true });

    plate.on('pointerover', () => {
      label.setStyle({ color: '#ffffff' });
      plate.setTint(0xfef08a);
      this.tweens.add({
        targets: container,
        scale: 1.08,
        duration: 120,
        ease: 'Cubic.easeOut',
      });
    });

    plate.on('pointerout', () => {
      label.setStyle({ color: '#fef08a' });
      plate.clearTint();
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 120,
        ease: 'Cubic.easeOut',
      });
    });

    plate.on('pointerdown', () => {
      plate.setTint(0xd97706);
      this.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: callback,
      });
    });

    return container;
  }

  private showFeedbackToast(message: string) {
    if (this.toastContainer) {
      this.toastContainer.destroy();
    }

    const { width, height } = this.scale;
    this.toastContainer = this.add.container(width / 2, height - 100).setName('toast');

    const bg = this.add.graphics();
    bg.fillStyle(0x130f1e, 0.95);
    bg.fillRoundedRect(-180, -20, 360, 40, 6);
    bg.lineStyle(1.5, 0xd97706, 0.8);
    bg.strokeRoundedRect(-180, -20, 360, 40, 6);
    this.toastContainer.add(bg);

    const txt = this.add.text(0, -1, message, {
      fontFamily: 'Montserrat',
      fontSize: '13px',
      color: '#fcd34d',
      fontStyle: '700',
    }).setOrigin(0.5);
    this.toastContainer.add(txt);

    this.toastContainer.alpha = 0;
    this.tweens.add({
      targets: this.toastContainer,
      alpha: 1,
      y: height - 120,
      duration: 250,
      ease: 'Power2',
      yoyo: true,
      hold: 1800,
      onComplete: () => {
        if (this.toastContainer) {
          this.toastContainer.destroy();
          this.toastContainer = null;
        }
      },
    });
  }
}
