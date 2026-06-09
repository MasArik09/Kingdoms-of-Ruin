import Phaser from 'phaser';
import { usePlayerStore } from '../stores/playerStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { InteractionSystem } from '../systems/InteractionSystem';
import { InteractionManager } from '../systems/InteractionManager';
import { Campfire } from '../entities/Campfire';
import { AncientShrine } from '../entities/AncientShrine';
import { TreasureChest } from '../entities/TreasureChest';
import { ToastManager } from '../ui/ToastManager';
import { InventoryUI } from '../ui/InventoryUI';
import { CharacterPanelUI } from '../ui/CharacterPanelUI';
import { useCharacterStore } from '../stores/characterStore';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Image;
  private interactionSystem!: InteractionSystem;
  private interactionManager!: InteractionManager;
  private toastManager!: ToastManager;
  private inventoryUI!: InventoryUI;
  private characterPanelUI!: CharacterPanelUI;

  private tabKey!: Phaser.Input.Keyboard.Key;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  
  // UI Containers for dynamic anchoring
  private topLeftContainer!: Phaser.GameObjects.Container;
  private hudMenuContainer!: Phaser.GameObjects.Container;
  private hudActionBarContainer!: Phaser.GameObjects.Container;
  private instructionsContainer!: Phaser.GameObjects.Container;
  private debugContainer!: Phaser.GameObjects.Container;

  private inventoryBtnBg!: Phaser.GameObjects.Graphics;
  private inventoryBtnIcon!: Phaser.GameObjects.Image;
  private characterBtnBg!: Phaser.GameObjects.Graphics;
  private characterBtnIcon!: Phaser.GameObjects.Image;

  // Text nodes
  private hudCoordinatesText!: Phaser.GameObjects.Text;
  private hudBackendStatusText!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;

  // Tweens
  private idleTween!: Phaser.Tweens.Tween;
  private walkTween: Phaser.Tweens.Tween | null = null;
  private isWalking = false;

  // Map settings
  private worldWidth = 2000;
  private worldHeight = 2000;

  constructor() {
    super('WorldScene');
  }

  async create() {
    // 1. Establish Physics and Camera Boundaries
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Wait for initial database states to load fully before spawning any interactable entities
    try {
      await Promise.all([
        useInventoryStore.getState().fetchInventory(),
        useCharacterStore.getState().fetchEquipment(),
        useWorldStateStore.getState().fetchStates()
      ]);
    } catch (err) {
      console.error('Failed to fetch initial database states:', err);
    }

    // 2. Render repeated Floor grass tiles (desaturated, low noise)
    this.add.tileSprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      'grass'
    );

    // 2.1 Spawn organic Moss Patches randomly across the map (below obstacles and player)
    const mossCount = 150;
    for (let i = 0; i < mossCount; i++) {
      const x = Phaser.Math.Between(64, this.worldWidth - 64);
      const y = Phaser.Math.Between(64, this.worldHeight - 64);
      const isLarge = Math.random() < 0.4;
      const texture = isLarge ? 'moss' : 'moss-small';
      
      const moss = this.add.image(x, y, texture);
      
      // Randomize scale, rotation, and alpha to look natural
      const scaleMultiplier = Phaser.Math.FloatBetween(0.8, 1.5);
      moss.setScale(scaleMultiplier);
      moss.setAngle(Phaser.Math.Between(0, 360));
      moss.setAlpha(Phaser.Math.FloatBetween(0.4, 0.8));
    }

    // Initialize Systems
    this.interactionSystem = new InteractionSystem();
    this.toastManager = new ToastManager(this);

    // 3. Static Groups for Obstacles
    const obstacles = this.physics.add.staticGroup();

    // 4. Bounded Stone border walls
    const wallThickness = 64;
    obstacles.create(this.worldWidth / 2, wallThickness / 2, 'stone')
      .setDisplaySize(this.worldWidth, wallThickness)
      .refreshBody();
    obstacles.create(this.worldWidth / 2, this.worldHeight - wallThickness / 2, 'stone')
      .setDisplaySize(this.worldWidth, wallThickness)
      .refreshBody();
    obstacles.create(wallThickness / 2, this.worldHeight / 2, 'stone')
      .setDisplaySize(wallThickness, this.worldHeight)
      .refreshBody();
    obstacles.create(this.worldWidth - wallThickness / 2, this.worldHeight / 2, 'stone')
      .setDisplaySize(wallThickness, this.worldHeight)
      .refreshBody();

    // 5. Spawn World Landmark: Ruined Shrine (Just north of spawning center at x=1000, y=840)
    const shrineX = 1000;
    const shrineY = 840;
    const shrine = new AncientShrine(this, shrineX, shrineY, this.interactionSystem);

    // 6. Populate World with Scattered Environment Assets
    const gridSize = 120;
    const spawnCenterX = this.worldWidth / 2;
    const spawnCenterY = this.worldHeight / 2;

    for (let x = 100; x < this.worldWidth - 100; x += gridSize) {
      for (let y = 100; y < this.worldHeight - 100; y += gridSize) {
        // Skip spawning obstacles too close to player spawning center and landmark area
        const distToCenter = Phaser.Math.Distance.Between(x, y, spawnCenterX, spawnCenterY);
        const distToShrine = Phaser.Math.Distance.Between(x, y, shrineX, shrineY);
        if (distToCenter < 180 || distToShrine < 140) {
          continue;
        }

        const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const rand = hash - Math.floor(hash);

        // Random offset
        const offsetX = (rand * 60) - 30;
        const offsetY = ((rand * 10) % 1 * 60) - 30;
        const posX = x + offsetX;
        const posY = y + offsetY;

        if (rand < 0.15) {
          // Tree + Shadow
          const shadow = this.add.image(posX, posY + 22, 'shadow').setScale(1.0, 0.45).setAlpha(0.75);
          shadow.setDepth(posY + 22 - 1);
          const tree = obstacles.create(posX, posY, 'tree');
          tree.setDepth(posY);
          tree.body.setSize(20, 24);
          tree.body.setOffset(22, 36);
        } else if (rand < 0.25) {
          // Rock + Shadow
          const shadow = this.add.image(posX, posY + 16, 'shadow').setScale(1.2, 0.45).setAlpha(0.8);
          shadow.setDepth(posY + 16 - 1);
          const rock = obstacles.create(posX, posY, 'rock');
          rock.setDepth(posY);
          rock.body.setSize(40, 36);
          rock.body.setOffset(12, 18);
        } else if (rand < 0.38) {
          // Bush + Shadow
          const shadow = this.add.image(posX, posY + 14, 'shadow').setScale(0.9, 0.42).setAlpha(0.6);
          shadow.setDepth(posY + 14 - 1);
          const bush = this.add.image(posX, posY, 'bush');
          bush.setDepth(posY);
        }
      }
    }

    // 7. Ambient Wind-Swept Leaf Particles
    this.add.particles(0, 0, 'leaf', {
      x: { min: -100, max: this.worldWidth + 100 },
      y: { min: -100, max: this.worldHeight + 100 },
      speedX: { min: -80, max: -35 },
      speedY: { min: 25, max: 55 },
      scale: { min: 0.6, max: 1.3 },
      alpha: { min: 0.3, max: 0.65 },
      lifespan: 12000,
      frequency: 220,
      rotate: { min: 0, max: 360 },
      quantity: 1,
    });

    // 8. Spawn 2x Larger Player Character
    const storePos = usePlayerStore.getState().playerPosition;
    // Add shadow below the player
    this.playerShadow = this.add.image(storePos.x, storePos.y + 24, 'shadow').setScale(1.5, 0.55).setAlpha(0.8);
    this.player = this.physics.add.sprite(storePos.x, storePos.y, 'player');
    this.player.setCollideWorldBounds(true);
    
    // Spawn Campfire Landmark
    new Campfire(this, 920, 980, this.interactionSystem);

    // Spawn Treasure Chest Landmark
    const chest = new TreasureChest(this, 1080, 980, this.interactionSystem);

    // Physical colliders
    this.physics.add.collider(this.player, obstacles);
    this.physics.add.collider(this.player, shrine);
    this.physics.add.collider(this.player, chest);

    // Adjust collision body limits to match feet/shoulders on 64x64 frame
    if (this.player.body) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setSize(32, 28);
      body.setOffset(16, 34);
    }

    // Initialize UI and managers
    this.interactionManager = new InteractionManager(this, this.interactionSystem, this.player);
    this.inventoryUI = new InventoryUI(this);
    this.characterPanelUI = new CharacterPanelUI(this);

    // Register Tab key for inventory toggle
    if (this.input.keyboard) {
      this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
      this.tabKey.on('down', () => {
        this.toggleInventory();
      });

      // Register C key for character sheet toggle
      const cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
      cKey.on('down', () => {
        this.toggleCharacterPanel();
      });
    }

    // Hook up Landmark Events
    this.events.on('landmark:campfire-rest', () => {
      this.toastManager.showToast('Campfire Rested: You rest beside the fire.');
    });

    this.events.on('landmark:shrine-examine', () => {
      this.toastManager.showToast('Shrine Examined: The shrine is ancient and worn.');
    });

    this.events.on('landmark:chest-loot', (data: { itemId: string; quantity: number }) => {
      useInventoryStore.getState().addItem(data.itemId, data.quantity).then((res) => {
        if (res) {
          this.toastManager.showToast(`Obtained: Wood x${data.quantity}`);
        } else {
          this.toastManager.showToast('Failed to save loot to server', false);
        }
      });
    });

    // 9. Idle breathing scale animation
    this.idleTween = this.tweens.add({
      targets: this.player,
      scaleY: 1.05,
      scaleX: 0.96,
      yoyo: true,
      duration: 650,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 10. Configure Smooth follow camera (Lerp 0.08, Zoom 1.0 to resolve HUD edge clipping)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.0); // FIXED: 1.0 zoom ensures HUD container has exactly 1:1 sizing with screen dimensions

    // 11. Register Keyboard Inputs
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // 12. Create HUD Elements
    this.createHUD();
    this.createDebugOverlay();

    // Initial positioning
    this.resize(this.scale);

    // 13. Hook up resize event listener
    this.scale.on('resize', this.resize, this);

    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resize, this);
      if (this.interactionManager) this.interactionManager.destroy();
      if (this.toastManager) this.toastManager.destroy();
      if (this.inventoryUI) this.inventoryUI.destroy();
      if (this.characterPanelUI) this.characterPanelUI.destroy();
    });

    // Camera fade-in
    this.cameras.main.fadeIn(800, 10, 6, 20);

    // 14. Probe Go backend server health check
    this.checkBackendStatus();
  }

  update() {
    if (!this.player) return;

    // Update interactions
    if (this.interactionManager) {
      this.interactionManager.update();
    }

    // Movement speeds
    const speed = 250;
    let vx = 0;
    let vy = 0;

    // Read inputs
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      vx = -speed;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      vx = speed;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      vy = -speed;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      vy = speed;
    }

    // Normalize diagonal velocities
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // Sync player shadow position
    this.playerShadow.setPosition(this.player.x, this.player.y + 24);

    // Sync depth sorting
    this.player.setDepth(this.player.y);
    this.playerShadow.setDepth(this.player.y - 1);

    // Flip horizontal scale based on motion direction
    if (vx < 0) {
      this.player.setFlipX(true);
    } else if (vx > 0) {
      this.player.setFlipX(false);
    }

    // Walk squish loop
    if (vx !== 0 || vy !== 0) {
      if (!this.isWalking) {
        this.isWalking = true;
        this.idleTween.pause();
        
        this.walkTween = this.tweens.add({
          targets: this.player,
          scaleY: 0.86,
          scaleX: 1.14,
          yoyo: true,
          duration: 160,
          repeat: -1,
          ease: 'Quad.easeInOut',
        });
      }
    } else {
      if (this.isWalking) {
        this.isWalking = false;
        if (this.walkTween) {
          this.walkTween.stop();
          this.walkTween = null;
        }
        this.player.setScale(1.0);
        this.idleTween.resume();
      }
    }

    // Coordinate sync
    const px = Math.round(this.player.x);
    const py = Math.round(this.player.y);
    
    this.hudCoordinatesText.setText(`POSITION: X: ${px}, Y: ${py}`);
    usePlayerStore.getState().setPlayerPosition(px, py);

    // Update debug text
    const fps = Math.round(this.game.loop.actualFps);
    this.debugText.setText(
      `SCENE: WorldScene\nFPS: ${fps}\nCOORDS: [${px}, [${py}]]\nSYS: Phaser 3 + TS\nDB: Active Pool`
    );
  }

  private resize(gameSize: { width: number; height: number }) {
    const { width, height } = gameSize;

    // Anchor HUD elements dynamically to window edges with 32px Spacious Safe-Area padding
    const safePadding = 32;
    
    this.topLeftContainer.setPosition(safePadding, safePadding);
    this.hudMenuContainer.setPosition(safePadding, height - 40 - safePadding);
    this.hudActionBarContainer.setPosition(safePadding, safePadding + 100 + 12);
    this.instructionsContainer.setPosition(width - 300 - safePadding, height - 60 - safePadding);
    this.debugContainer.setPosition(width - 220 - safePadding, safePadding);

    // Call adjustLayout on characterPanelUI if it exists to maintain side-by-side positioning on resize
    if (this.characterPanelUI && this.characterPanelUI.getIsOpen()) {
      this.characterPanelUI.adjustLayout(this.inventoryUI);
    } else if (this.inventoryUI && this.inventoryUI.getIsOpen()) {
      this.inventoryUI.setPosition(width / 2, height / 2);
      this.inventoryUI.renderInventory();
      this.inventoryUI.createTabZones();
    }
  }

  private createHUD() {
    // Top-left stats container
    this.topLeftContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(20000);

    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x0f0c1b, 0.85);
    headerBg.fillRoundedRect(0, 0, 280, 100, 8);
    headerBg.lineStyle(1.5, 0xd97706, 0.6);
    headerBg.strokeRoundedRect(0, 0, 280, 100, 8);
    this.topLeftContainer.add(headerBg);

    const hudTitle = this.add.text(16, 12, 'KINGDOMS OF RUIN', {
      fontFamily: 'Cinzel',
      fontSize: '15px',
      color: '#f59e0b',
      fontStyle: 'bold',
    });
    this.topLeftContainer.add(hudTitle);

    this.hudCoordinatesText = this.add.text(16, 38, 'POSITION: X: 0, Y: 0', {
      fontFamily: 'Montserrat',
      fontSize: '12px',
      color: '#cbd5e1',
    });
    this.topLeftContainer.add(this.hudCoordinatesText);

    this.hudBackendStatusText = this.add.text(16, 60, 'BACKEND: CONNECTING...', {
      fontFamily: 'Montserrat',
      fontSize: '12px',
      color: '#94a3b8',
      fontStyle: '700',
    });
    this.topLeftContainer.add(this.hudBackendStatusText);

    // Bottom-right instructions container
    this.instructionsContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(20000);

    const instructionsBg = this.add.graphics();
    instructionsBg.fillStyle(0x0f0c1b, 0.85);
    instructionsBg.fillRoundedRect(0, 0, 300, 60, 8);
    instructionsBg.lineStyle(1.5, 0x3b82f6, 0.5);
    instructionsBg.strokeRoundedRect(0, 0, 300, 60, 8);
    this.instructionsContainer.add(instructionsBg);

    const instructionsText = this.add.text(16, 12, 'CONTROLS: WASD / ARROWS\nBOUNDED WORLD PROTOTYPE', {
      fontFamily: 'Montserrat',
      fontSize: '12px',
      color: '#93c5fd',
      fontStyle: 'bold',
      lineSpacing: 4,
    });
    this.instructionsContainer.add(instructionsText);

    // Bottom-left Navigation Bar container
    this.hudMenuContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(20000);

    // Button 1: Main Menu
    const menuBtnX = 0;
    const menuBtnY = 0;
    const menuBtnW = 140;
    const menuBtnH = 40;
    const menuBtnBg = this.add.graphics();
    menuBtnBg.fillStyle(HUD_THEME.bgDefault, 0.85);
    menuBtnBg.fillRoundedRect(menuBtnX, menuBtnY, menuBtnW, menuBtnH, 6);
    menuBtnBg.lineStyle(1.5, HUD_THEME.borderDefault, 0.7);
    menuBtnBg.strokeRoundedRect(menuBtnX, menuBtnY, menuBtnW, menuBtnH, 6);
    this.hudMenuContainer.add(menuBtnBg);

    const menuBtnText = this.add.text(menuBtnX + menuBtnW / 2, menuBtnY + menuBtnH / 2, 'MAIN MENU', {
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
      this.cameras.main.fade(600, 10, 6, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });

    // Bottom-center Action Bar container
    this.hudActionBarContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(20000);

    const barW = 56;
    const barH = 112;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x0f0c1b, 0.85);
    barBg.fillRoundedRect(0, 0, barW, barH, 8);
    barBg.lineStyle(1.5, 0x4f46e5, 0.6);
    barBg.strokeRoundedRect(0, 0, barW, barH, 8);
    this.hudActionBarContainer.add(barBg);

    // Button 2: Inventory Icon Button
    const invBtnX = 4;
    const invBtnY = 4;
    const btnSize = 48;

    this.inventoryBtnBg = this.add.graphics();
    this.drawIconButtonBorder(this.inventoryBtnBg, invBtnX, invBtnY, btnSize, false);
    this.hudActionBarContainer.add(this.inventoryBtnBg);

    this.inventoryBtnIcon = this.add.image(invBtnX + btnSize / 2, invBtnY + btnSize / 2, 'icon-inventory');
    this.hudActionBarContainer.add(this.inventoryBtnIcon);

    this.inventoryBtnIcon.setScrollFactor(0);
    this.inventoryBtnIcon.setInteractive({ useHandCursor: true });
    this.inventoryBtnIcon.on('pointerover', () => {
      this.tweens.add({
        targets: this.inventoryBtnIcon,
        scale: 1.12,
        duration: 100,
        ease: 'Quad.easeOut'
      });
      if (!this.inventoryUI || !this.inventoryUI.getIsOpen()) {
        this.drawIconButtonBorder(this.inventoryBtnBg, invBtnX, invBtnY, btnSize, false, true);
      }
    });
    this.inventoryBtnIcon.on('pointerout', () => {
      this.tweens.add({
        targets: this.inventoryBtnIcon,
        scale: 1.0,
        duration: 100,
        ease: 'Quad.easeOut'
      });
      this.updateMenuButtonsHighlight();
    });
    this.inventoryBtnIcon.on('pointerdown', () => {
      this.toggleInventory();
    });

    // Button 3: Character Panel Icon Button
    const charBtnX = 4;
    const charBtnY = 60;

    this.characterBtnBg = this.add.graphics();
    this.drawIconButtonBorder(this.characterBtnBg, charBtnX, charBtnY, btnSize, false);
    this.hudActionBarContainer.add(this.characterBtnBg);

    this.characterBtnIcon = this.add.image(charBtnX + btnSize / 2, charBtnY + btnSize / 2, 'icon-character');
    this.hudActionBarContainer.add(this.characterBtnIcon);

    this.characterBtnIcon.setScrollFactor(0);
    this.characterBtnIcon.setInteractive({ useHandCursor: true });
    this.characterBtnIcon.on('pointerover', () => {
      this.tweens.add({
        targets: this.characterBtnIcon,
        scale: 1.12,
        duration: 100,
        ease: 'Quad.easeOut'
      });
      if (!this.characterPanelUI || !this.characterPanelUI.getIsOpen()) {
        this.drawIconButtonBorder(this.characterBtnBg, charBtnX, charBtnY, btnSize, false, true);
      }
    });
    this.characterBtnIcon.on('pointerout', () => {
      this.tweens.add({
        targets: this.characterBtnIcon,
        scale: 1.0,
        duration: 100,
        ease: 'Quad.easeOut'
      });
      this.updateMenuButtonsHighlight();
    });
    this.characterBtnIcon.on('pointerdown', () => {
      this.toggleCharacterPanel();
    });
  }

  private createDebugOverlay() {
    // Top-right debug container
    this.debugContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(20000);

    const debugBg = this.add.graphics();
    debugBg.fillStyle(0x090514, 0.9);
    debugBg.fillRoundedRect(0, 0, 220, 110, 8);
    debugBg.lineStyle(1.5, 0xef4444, 0.6);
    debugBg.strokeRoundedRect(0, 0, 220, 110, 8);
    this.debugContainer.add(debugBg);

    const debugTitle = this.add.text(16, 8, 'UI DEBUG OVERLAY', onDebugStyleText('#f87171'));
    this.debugContainer.add(debugTitle);

    this.debugText = this.add.text(16, 28, 'SCENE: WorldScene\nFPS: 0\nCOORDS: [0, 0]\nSYS: Phaser 3 + TS\nDB: Active Pool', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: '#cbd5e1',
      lineSpacing: 4,
    });
    this.debugContainer.add(this.debugText);
  }

  private checkBackendStatus() {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('API server status: ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (data.status === 'ok') {
          this.hudBackendStatusText.setText('BACKEND: ONLINE (DB CONNECTED)');
          this.hudBackendStatusText.setStyle({ color: '#10b981' });
        } else {
          this.hudBackendStatusText.setText('BACKEND: DB OFFLINE');
          this.hudBackendStatusText.setStyle({ color: '#ef4444' });
        }
      })
      .catch((err) => {
        console.error('Failed to communicate with Go backend:', err);
        this.hudBackendStatusText.setText('BACKEND: OFFLINE (API ERROR)');
        this.hudBackendStatusText.setStyle({ color: '#f59e0b' });
      });
  }

  private toggleInventory() {
    this.inventoryUI.toggle(this.characterPanelUI);
    this.updateMenuButtonsHighlight();
  }

  private toggleCharacterPanel() {
    this.characterPanelUI.toggle(this.inventoryUI);
    this.updateMenuButtonsHighlight();
  }

  private drawIconButtonBorder(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    isOpen: boolean,
    isHover = false
  ) {
    graphics.clear();
    if (isOpen) {
      graphics.fillStyle(HUD_THEME.bgActive, 0.4);
      graphics.fillRoundedRect(x, y, size, size, 6);
      graphics.lineStyle(1.8, HUD_THEME.borderActive, 1.0);
      graphics.strokeRoundedRect(x, y, size, size, 6);
    } else if (isHover) {
      graphics.fillStyle(HUD_THEME.bgHover, 0.3);
      graphics.fillRoundedRect(x, y, size, size, 6);
      graphics.lineStyle(1.5, HUD_THEME.borderHover, 0.95);
      graphics.strokeRoundedRect(x, y, size, size, 6);
    } else {
      graphics.fillStyle(0x0f0c1b, 0.3);
      graphics.fillRoundedRect(x, y, size, size, 6);
      graphics.lineStyle(1.5, HUD_THEME.borderDefault, 0.5);
      graphics.strokeRoundedRect(x, y, size, size, 6);
    }
  }

  private updateMenuButtonsHighlight() {
    const isInventoryOpen = this.inventoryUI && this.inventoryUI.getIsOpen();
    const isCharacterOpen = this.characterPanelUI && this.characterPanelUI.getIsOpen();

    if (this.inventoryBtnBg) {
      this.drawIconButtonBorder(this.inventoryBtnBg, 4, 4, 48, isInventoryOpen);
    }
    if (this.characterBtnBg) {
      this.drawIconButtonBorder(this.characterBtnBg, 4, 60, 48, isCharacterOpen);
    }
  }
}

function onDebugStyleText(color: string) {
  return {
    fontFamily: 'Montserrat',
    fontSize: '11px',
    color: color,
    fontStyle: 'bold',
  };
}

const HUD_THEME = {
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
