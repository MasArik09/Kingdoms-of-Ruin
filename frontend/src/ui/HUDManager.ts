import Phaser from 'phaser';

export const HUD_THEME = {
  bgDefault: 0x1e1b4b,
  bgHover: 0x2e1065,
  bgActive: 0xd97706,
  
  borderDefault: 0x4f46e5,
  borderHover: 0xd97706,
  borderActive: 0xf59e0b,

  textMenuDefault: '#c084fc',
  textBtnDefault: '#cbd5e1',
  textActive: '#0f0c1b',
  textHover: '#f59e0b'
};

function onDebugStyleText(color: string) {
  return {
    fontFamily: 'Montserrat',
    fontSize: '11px',
    color: color,
    fontStyle: 'bold',
  };
}

export interface HUDCallbacks {
  onToggleInventory: () => void;
  onToggleCharacterPanel: () => void;
  onMainMenu: () => void;
}

export class HUDManager {
  private scene: Phaser.Scene;
  private callbacks: HUDCallbacks;

  // Containers
  private topLeftContainer!: Phaser.GameObjects.Container;
  private hudMenuContainer!: Phaser.GameObjects.Container;
  private hudActionBarContainer!: Phaser.GameObjects.Container;
  private instructionsContainer!: Phaser.GameObjects.Container;
  private debugContainer!: Phaser.GameObjects.Container;

  // Buttons & Graphics
  private inventoryBtnBg!: Phaser.GameObjects.Graphics;
  private inventoryBtnIcon!: Phaser.GameObjects.Image;
  private characterBtnBg!: Phaser.GameObjects.Graphics;
  private characterBtnIcon!: Phaser.GameObjects.Image;

  // Text Nodes
  private hudCoordinatesText!: Phaser.GameObjects.Text;
  private hudBackendStatusText!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, callbacks: HUDCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.create();
  }

  private create() {
    // 1. Top-Left Status Info
    this.topLeftContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(20000);

    const headerBg = this.scene.add.graphics();
    headerBg.fillStyle(0x0f0c1b, 0.85);
    headerBg.fillRoundedRect(0, 0, 280, 100, 8);
    headerBg.lineStyle(1.5, 0xd97706, 0.6);
    headerBg.strokeRoundedRect(0, 0, 280, 100, 8);
    this.topLeftContainer.add(headerBg);

    const hudTitle = this.scene.add.text(16, 12, 'KINGDOMS OF RUIN', {
      fontFamily: 'Cinzel',
      fontSize: '15px',
      color: '#f59e0b',
      fontStyle: 'bold',
    });
    this.topLeftContainer.add(hudTitle);

    this.hudCoordinatesText = this.scene.add.text(16, 38, 'POSITION: X: 0, Y: 0', {
      fontFamily: 'Montserrat',
      fontSize: '12px',
      color: '#cbd5e1',
    });
    this.topLeftContainer.add(this.hudCoordinatesText);

    this.hudBackendStatusText = this.scene.add.text(16, 60, 'BACKEND: CONNECTING...', {
      fontFamily: 'Montserrat',
      fontSize: '12px',
      color: '#94a3b8',
      fontStyle: '700',
    });
    this.topLeftContainer.add(this.hudBackendStatusText);

    // 2. Bottom-Right Instructions Overlay
    this.instructionsContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(20000);

    const instructionsBg = this.scene.add.graphics();
    instructionsBg.fillStyle(0x0f0c1b, 0.85);
    instructionsBg.fillRoundedRect(0, 0, 300, 60, 8);
    instructionsBg.lineStyle(1.5, 0x3b82f6, 0.5);
    instructionsBg.strokeRoundedRect(0, 0, 300, 60, 8);
    this.instructionsContainer.add(instructionsBg);

    const instructionsText = this.scene.add.text(16, 12, 'CONTROLS: WASD / ARROWS\nBOUNDED WORLD PROTOTYPE', {
      fontFamily: 'Montserrat',
      fontSize: '12px',
      color: '#93c5fd',
      fontStyle: 'bold',
      lineSpacing: 4,
    });
    this.instructionsContainer.add(instructionsText);

    // 3. Bottom-Left Main Menu Button
    this.hudMenuContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(20000);

    const menuBtnX = 0;
    const menuBtnY = 0;
    const menuBtnW = 140;
    const menuBtnH = 40;
    const menuBtnBg = this.scene.add.graphics();
    menuBtnBg.fillStyle(HUD_THEME.bgDefault, 0.85);
    menuBtnBg.fillRoundedRect(menuBtnX, menuBtnY, menuBtnW, menuBtnH, 6);
    menuBtnBg.lineStyle(1.5, HUD_THEME.borderDefault, 0.7);
    menuBtnBg.strokeRoundedRect(menuBtnX, menuBtnY, menuBtnW, menuBtnH, 6);
    this.hudMenuContainer.add(menuBtnBg);

    const menuBtnText = this.scene.add.text(menuBtnX + menuBtnW / 2, menuBtnY + menuBtnH / 2, 'MAIN MENU', {
      fontFamily: 'Montserrat',
      fontSize: '12px',
      color: HUD_THEME.textMenuDefault,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.hudMenuContainer.add(menuBtnText);

    menuBtnText.setScrollFactor(0);
    menuBtnText.setInteractive({ useHandCursor: true });
    menuBtnText.on('pointerover', () => {
      menuBtnText.setStyle({ color: HUD_THEME.textHover });
      menuBtnBg.clear();
      menuBtnBg.fillStyle(HUD_THEME.bgHover, 0.9);
      menuBtnBg.fillRoundedRect(menuBtnX, menuBtnY, menuBtnW, menuBtnH, 6);
      menuBtnBg.lineStyle(1.5, HUD_THEME.borderHover, 0.95);
      menuBtnBg.strokeRoundedRect(menuBtnX, menuBtnY, menuBtnW, menuBtnH, 6);
    });
    menuBtnText.on('pointerout', () => {
      menuBtnText.setStyle({ color: HUD_THEME.textMenuDefault });
      menuBtnBg.clear();
      menuBtnBg.fillStyle(HUD_THEME.bgDefault, 0.85);
      menuBtnBg.fillRoundedRect(menuBtnX, menuBtnY, menuBtnW, menuBtnH, 6);
      menuBtnBg.lineStyle(1.5, HUD_THEME.borderDefault, 0.7);
      menuBtnBg.strokeRoundedRect(menuBtnX, menuBtnY, menuBtnW, menuBtnH, 6);
    });
    menuBtnText.on('pointerdown', () => {
      this.callbacks.onMainMenu();
    });

    // 4. Vertical Action Bar (Inventory & Character Panel shortcuts)
    this.hudActionBarContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(20000);

    const barW = 56;
    const barH = 112;
    const barBg = this.scene.add.graphics();
    barBg.fillStyle(0x0f0c1b, 0.85);
    barBg.fillRoundedRect(0, 0, barW, barH, 8);
    barBg.lineStyle(1.5, 0x4f46e5, 0.6);
    barBg.strokeRoundedRect(0, 0, barW, barH, 8);
    this.hudActionBarContainer.add(barBg);

    // Button 2: Inventory Button
    const invBtnX = 4;
    const invBtnY = 4;
    const btnSize = 48;

    this.inventoryBtnBg = this.scene.add.graphics();
    this.drawIconButtonBorder(this.inventoryBtnBg, invBtnX, invBtnY, btnSize, false);
    this.hudActionBarContainer.add(this.inventoryBtnBg);

    this.inventoryBtnIcon = this.scene.add.image(invBtnX + btnSize / 2, invBtnY + btnSize / 2, 'icon-inventory');
    this.hudActionBarContainer.add(this.inventoryBtnIcon);

    this.inventoryBtnIcon.setScrollFactor(0);
    this.inventoryBtnIcon.setInteractive({ useHandCursor: true });
    this.inventoryBtnIcon.on('pointerover', () => {
      this.scene.tweens.add({
        targets: this.inventoryBtnIcon,
        scale: 1.12,
        duration: 100,
        ease: 'Quad.easeOut'
      });
      this.drawIconButtonBorder(this.inventoryBtnBg, invBtnX, invBtnY, btnSize, false, true);
    });
    this.inventoryBtnIcon.on('pointerout', () => {
      this.scene.tweens.add({
        targets: this.inventoryBtnIcon,
        scale: 1.0,
        duration: 100,
        ease: 'Quad.easeOut'
      });
      this.updateMenuButtonsHighlight(false, false); // highlight states will be refreshed dynamically
    });
    this.inventoryBtnIcon.on('pointerdown', () => {
      this.callbacks.onToggleInventory();
    });

    // Button 3: Character Button
    const charBtnX = 4;
    const charBtnY = 60;

    this.characterBtnBg = this.scene.add.graphics();
    this.drawIconButtonBorder(this.characterBtnBg, charBtnX, charBtnY, btnSize, false);
    this.hudActionBarContainer.add(this.characterBtnBg);

    this.characterBtnIcon = this.scene.add.image(charBtnX + btnSize / 2, charBtnY + btnSize / 2, 'icon-character');
    this.hudActionBarContainer.add(this.characterBtnIcon);

    this.characterBtnIcon.setScrollFactor(0);
    this.characterBtnIcon.setInteractive({ useHandCursor: true });
    this.characterBtnIcon.on('pointerover', () => {
      this.scene.tweens.add({
        targets: this.characterBtnIcon,
        scale: 1.12,
        duration: 100,
        ease: 'Quad.easeOut'
      });
      this.drawIconButtonBorder(this.characterBtnBg, charBtnX, charBtnY, btnSize, false, true);
    });
    this.characterBtnIcon.on('pointerout', () => {
      this.scene.tweens.add({
        targets: this.characterBtnIcon,
        scale: 1.0,
        duration: 100,
        ease: 'Quad.easeOut'
      });
      this.updateMenuButtonsHighlight(false, false);
    });
    this.characterBtnIcon.on('pointerdown', () => {
      this.callbacks.onToggleCharacterPanel();
    });

    // 5. Debug Overlay Container
    this.debugContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(20000);

    const debugBg = this.scene.add.graphics();
    debugBg.fillStyle(0x090514, 0.9);
    debugBg.fillRoundedRect(0, 0, 220, 110, 8);
    debugBg.lineStyle(1.5, 0xef4444, 0.6);
    debugBg.strokeRoundedRect(0, 0, 220, 110, 8);
    this.debugContainer.add(debugBg);

    const debugTitle = this.scene.add.text(16, 8, 'UI DEBUG OVERLAY', onDebugStyleText('#f87171'));
    this.debugContainer.add(debugTitle);

    this.debugText = this.scene.add.text(16, 28, 'SCENE: WorldScene\nFPS: 0\nCOORDS: [0, 0]\nSYS: Phaser 3 + TS\nDB: Active Pool', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: '#cbd5e1',
      lineSpacing: 4,
    });
    this.debugContainer.add(this.debugText);
  }

  public drawIconButtonBorder(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    isActive: boolean,
    isHover: boolean = false
  ) {
    graphics.clear();
    if (isActive) {
      graphics.fillStyle(HUD_THEME.bgActive, 0.2);
      graphics.fillRoundedRect(x, y, size, size, 6);
      graphics.lineStyle(2, HUD_THEME.borderActive, 0.95);
      graphics.strokeRoundedRect(x, y, size, size, 6);
    } else if (isHover) {
      graphics.fillStyle(HUD_THEME.bgHover, 0.4);
      graphics.fillRoundedRect(x, y, size, size, 6);
      graphics.lineStyle(2, HUD_THEME.borderHover, 0.9);
      graphics.strokeRoundedRect(x, y, size, size, 6);
    } else {
      graphics.fillStyle(0x0f0c1b, 0.3);
      graphics.fillRoundedRect(x, y, size, size, 6);
      graphics.lineStyle(1.5, HUD_THEME.borderDefault, 0.5);
      graphics.strokeRoundedRect(x, y, size, size, 6);
    }
  }

  public updateCoordinates(x: number, y: number) {
    if (this.hudCoordinatesText) {
      this.hudCoordinatesText.setText(`POSITION: X: ${x}, Y: ${y}`);
    }
  }

  public updateBackendStatus(connected: boolean, statusText?: string) {
    if (!this.hudBackendStatusText) return;
    if (connected) {
      this.hudBackendStatusText.setText(statusText || 'BACKEND: ONLINE (DB CONNECTED)');
      this.hudBackendStatusText.setStyle({ color: '#10b981' });
    } else {
      this.hudBackendStatusText.setText(statusText || 'BACKEND: OFFLINE');
      this.hudBackendStatusText.setStyle({ color: '#ef4444' });
    }
  }

  public updateDebugText(fps: number, px: number, py: number) {
    if (this.debugText) {
      this.debugText.setText(
        `SCENE: WorldScene\nFPS: ${fps}\nCOORDS: [${px}, ${py}]\nSYS: Phaser 3 + TS\nDB: Active Pool`
      );
    }
  }

  public updateMenuButtonsHighlight(isInventoryOpen: boolean, isCharacterOpen: boolean) {
    if (this.inventoryBtnBg) {
      this.drawIconButtonBorder(this.inventoryBtnBg, 4, 4, 48, isInventoryOpen);
    }
    if (this.characterBtnBg) {
      this.drawIconButtonBorder(this.characterBtnBg, 4, 60, 48, isCharacterOpen);
    }
  }

  public resize(width: number, height: number) {
    const safePadding = 32;
    
    this.topLeftContainer.setPosition(safePadding, safePadding);
    this.hudMenuContainer.setPosition(safePadding, height - 40 - safePadding);
    this.hudActionBarContainer.setPosition(safePadding, safePadding + 100 + 12);
    this.instructionsContainer.setPosition(width - 300 - safePadding, height - 60 - safePadding);
    this.debugContainer.setPosition(width - 220 - safePadding, safePadding);
  }

  public destroy() {
    this.topLeftContainer.destroy();
    this.hudMenuContainer.destroy();
    this.hudActionBarContainer.destroy();
    this.instructionsContainer.destroy();
    this.debugContainer.destroy();
  }
}
