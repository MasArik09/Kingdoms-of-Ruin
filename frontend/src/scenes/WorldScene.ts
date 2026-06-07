import Phaser from 'phaser';
import { usePlayerStore } from '../stores/playerStore';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  
  // UI Containers for dynamic anchoring
  private topLeftContainer!: Phaser.GameObjects.Container;
  private backBtnContainer!: Phaser.GameObjects.Container;
  private instructionsContainer!: Phaser.GameObjects.Container;
  private debugContainer!: Phaser.GameObjects.Container;

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

  create() {
    // 1. Establish Physics and Camera Boundaries
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 2. Render repeated Floor grass tiles (desaturated, low noise)
    this.add.tileSprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      'grass'
    );

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
    // Platform drop shadow
    this.add.image(shrineX, shrineY + 44, 'shadow').setScale(2.2, 0.7).setAlpha(0.85);
    // Shrine static body
    const shrine = obstacles.create(shrineX, shrineY, 'shrine');
    shrine.body.setSize(96, 44);
    shrine.body.setOffset(16, 76);

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
          this.add.image(posX, posY + 22, 'shadow').setScale(1.0, 0.45).setAlpha(0.75);
          const tree = obstacles.create(posX, posY, 'tree');
          tree.body.setSize(20, 24);
          tree.body.setOffset(22, 36);
        } else if (rand < 0.25) {
          // Rock + Shadow
          this.add.image(posX, posY + 16, 'shadow').setScale(1.2, 0.45).setAlpha(0.8);
          const rock = obstacles.create(posX, posY, 'rock');
          rock.body.setSize(40, 36);
          rock.body.setOffset(12, 18);
        } else if (rand < 0.38) {
          // Bush + Shadow
          this.add.image(posX, posY + 14, 'shadow').setScale(0.9, 0.42).setAlpha(0.6);
          this.add.image(posX, posY, 'bush');
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
    
    // Physical colliders
    this.physics.add.collider(this.player, obstacles);

    // Adjust collision body limits to match feet/shoulders on 64x64 frame
    if (this.player.body) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setSize(32, 28);
      body.setOffset(16, 34);
    }

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
    });

    // Camera fade-in
    this.cameras.main.fadeIn(800, 10, 6, 20);

    // 14. Probe Go backend server health check
    this.checkBackendStatus();
  }

  update() {
    if (!this.player) return;

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
    this.backBtnContainer.setPosition(safePadding, height - 40 - safePadding);
    this.instructionsContainer.setPosition(width - 300 - safePadding, height - 60 - safePadding);
    this.debugContainer.setPosition(width - 220 - safePadding, safePadding);
  }

  private createHUD() {
    // Top-left stats container
    this.topLeftContainer = this.add.container(0, 0).setScrollFactor(0);

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
    this.instructionsContainer = this.add.container(0, 0).setScrollFactor(0);

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

    // Bottom-left Back Button container
    this.backBtnContainer = this.add.container(0, 0).setScrollFactor(0);

    const backBtnBg = this.add.graphics();
    backBtnBg.fillStyle(0x1e1b4b, 0.85);
    backBtnBg.fillRoundedRect(0, 0, 140, 40, 6);
    backBtnBg.lineStyle(1.5, 0x4f46e5, 0.7);
    backBtnBg.strokeRoundedRect(0, 0, 140, 40, 6);
    this.backBtnContainer.add(backBtnBg);

    const backBtnText = this.add.text(70, 20, 'MAIN MENU', {
      fontFamily: 'Montserrat',
      fontSize: '12px',
      color: '#c084fc',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.backBtnContainer.add(backBtnText);

    backBtnText.setInteractive({ useHandCursor: true });
    
    backBtnText.on('pointerover', () => {
      backBtnText.setStyle({ color: '#f59e0b' });
    });
    
    backBtnText.on('pointerout', () => {
      backBtnText.setStyle({ color: '#c084fc' });
    });
    
    backBtnText.on('pointerdown', () => {
      this.cameras.main.fade(600, 10, 6, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });
  }

  private createDebugOverlay() {
    // Top-right debug container
    this.debugContainer = this.add.container(0, 0).setScrollFactor(0);

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
}

function onDebugStyleText(color: string) {
  return {
    fontFamily: 'Montserrat',
    fontSize: '11px',
    color: color,
    fontStyle: 'bold',
  };
}
