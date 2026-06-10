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
import { PaperDoll } from '../ui/PaperDoll';
import { HUDManager } from '../ui/HUDManager';
import { Slime } from '../entities/Slime';
import { EnemyBase } from '../entities/EnemyBase';
import { CombatSystem } from '../systems/CombatSystem';
import { DamageSystem } from '../systems/DamageSystem';
import { ExperienceSystem } from '../systems/ExperienceSystem';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Image;
  private interactionSystem!: InteractionSystem;
  private interactionManager!: InteractionManager;
  private toastManager!: ToastManager;
  private inventoryUI!: InventoryUI;
  private characterPanelUI!: CharacterPanelUI;

  // Refactored modular sub-systems
  private hudManager!: HUDManager;
  private paperDoll!: PaperDoll;
  private enemies!: Phaser.Physics.Arcade.Group;
  private combatSystem!: CombatSystem;

  private tabKey!: Phaser.Input.Keyboard.Key;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

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
        useCharacterStore.getState().fetchProgress(),
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
    
    // Setup player equipment sprites
    this.paperDoll = new PaperDoll(this, this.player);
    
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

    // Initialize Combat & Progression Systems
    this.enemies = this.physics.add.group({ runChildUpdate: true });
    this.combatSystem = new CombatSystem(this, this.player, this.enemies, this.paperDoll, () => {
      return this.inventoryUI.getIsOpen() || this.characterPanelUI.getIsOpen();
    });
    new ExperienceSystem(this, this.player);

    // Slime Respawn System — 12 spawn points, 6 active at a time, 20s respawn cycle
    const slimeSpawnPoints = [
      { x: 600, y: 600 },
      { x: 800, y: 780 },
      { x: 1200, y: 820 },
      { x: 1400, y: 650 },
      { x: 720, y: 1100 },
      { x: 1280, y: 1140 },
      { x: 400, y: 900 },
      { x: 1600, y: 950 },
      { x: 500, y: 1400 },
      { x: 1500, y: 1350 },
      { x: 900, y: 1500 },
      { x: 1100, y: 500 },
    ];
    const maxAliveSlimes = 6;
    const respawnIntervalMs = 35000; // 35 seconds
    let slimeIdCounter = 0;

    const spawnSlimeWave = () => {
      // Count alive slimes
      const aliveSlimes = this.enemies.getChildren().filter(
        (e) => (e as EnemyBase).active && !(e as EnemyBase).isDead
      );
      const slotsAvailable = maxAliveSlimes - aliveSlimes.length;
      if (slotsAvailable <= 0) return;

      // Shuffle spawn points and pick available ones (not too close to existing slimes)
      const shuffled = Phaser.Utils.Array.Shuffle([...slimeSpawnPoints]);
      let spawned = 0;

      for (const point of shuffled) {
        if (spawned >= slotsAvailable) break;

        // Skip if a living slime is already near this point
        const tooClose = aliveSlimes.some((e) => {
          const enemy = e as EnemyBase;
          return Phaser.Math.Distance.Between(enemy.x, enemy.y, point.x, point.y) < 120;
        });
        if (tooClose) continue;

        // Skip if player is too close to the spawn point (avoid spawning on top of player)
        const distToPlayer = Phaser.Math.Distance.Between(
          this.player.x, this.player.y, point.x, point.y
        );
        if (distToPlayer < 200) continue;

        const slime = new Slime(this, point.x, point.y, `slime_${slimeIdCounter++}`, this.player);
        this.enemies.add(slime);

        // Spawn-in visual: fade in + scale pop
        slime.setAlpha(0);
        slime.setScale(0.3);
        this.tweens.add({
          targets: slime,
          alpha: 1,
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 400,
          ease: 'Back.easeOut',
        });

        spawned++;
      }
    };

    // Initial spawn
    spawnSlimeWave();

    // Recurring respawn timer
    this.time.addEvent({
      delay: respawnIntervalMs,
      callback: spawnSlimeWave,
      loop: true,
    });

    // Set collisions and overlaps for slimes
    this.physics.add.collider(this.enemies, obstacles);
    this.physics.add.collider(this.enemies, shrine);
    this.physics.add.collider(this.enemies, chest);
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      DamageSystem.applyDamageToPlayer(this, player as Phaser.Physics.Arcade.Sprite, enemy as EnemyBase);
    }, undefined, this);

    this.events.on('player:death', () => {
      this.toastManager.showToast('You fell in battle! Respawning beside the campfire...', false);
      const derived = useCharacterStore.getState().getDerivedStats();
      useCharacterStore.getState().setHp(derived.maxHealth);
      useCharacterStore.getState().setStamina(derived.maxStamina);
      this.player.setPosition(1000, 980);
    });

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

    // 12. Initialize HUD Manager
    this.hudManager = new HUDManager(this, {
      onToggleInventory: () => this.toggleInventory(),
      onToggleCharacterPanel: () => this.toggleCharacterPanel(),
      onMainMenu: () => {
        this.cameras.main.fade(600, 10, 6, 20);
        this.scene.start('MainMenuScene');
      }
    });

    // Initial positioning
    this.resize(this.scale);

    // 13. Hook up resize and postupdate event listeners
    this.scale.on('resize', this.resize, this);
    this.events.on('postupdate', this.postUpdate, this);

    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resize, this);
      this.events.off('postupdate', this.postUpdate, this);
      if (this.interactionManager) this.interactionManager.destroy();
      if (this.toastManager) this.toastManager.destroy();
      if (this.inventoryUI) this.inventoryUI.destroy();
      if (this.characterPanelUI) this.characterPanelUI.destroy();
      if (this.hudManager) this.hudManager.destroy();
      if (this.paperDoll) this.paperDoll.destroy();
    });

    // Camera fade-in
    this.cameras.main.fadeIn(800, 10, 6, 20);

    // 14. Probe Go backend server health check
    this.checkBackendStatus();
  }

  update() {
    if (!this.player) return;

    // Update systems
    if (this.combatSystem) {
      this.combatSystem.update();
    }

    // Update player floating health bar (fade in/out logic)
    DamageSystem.updatePlayerHealthBar(this, this.player);

    // Update interactions
    if (this.interactionManager) {
      this.interactionManager.update();
    }

    // Movement speeds
    const derivedStats = useCharacterStore.getState().getDerivedStats();
    const speed = derivedStats.moveSpeed;
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
    
    this.hudManager.updateCoordinates(px, py);
    usePlayerStore.getState().setPlayerPosition(px, py);

    // Update debug text
    const fps = Math.round(this.game.loop.actualFps);
    this.hudManager.updateDebugText(fps, px, py);
  }

  private resize(gameSize: { width: number; height: number }) {
    const { width, height } = gameSize;

    // Delegate HUD positioning to HUDManager
    this.hudManager.resize(width, height);

    // Call adjustLayout on characterPanelUI if it exists to maintain side-by-side positioning on resize
    if (this.characterPanelUI && this.characterPanelUI.getIsOpen()) {
      this.characterPanelUI.adjustLayout(this.inventoryUI);
    } else if (this.inventoryUI && this.inventoryUI.getIsOpen()) {
      this.inventoryUI.setPosition(width / 2, height / 2);
      this.inventoryUI.renderInventory();
      this.inventoryUI.createTabZones();
    }
  }

  private checkBackendStatus() {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('API server status: ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (data.status === 'ok') {
          this.hudManager.updateBackendStatus(true);
        } else {
          this.hudManager.updateBackendStatus(false, 'BACKEND: DB OFFLINE');
        }
      })
      .catch((err) => {
        console.error('Failed to communicate with Go backend:', err);
        this.hudManager.updateBackendStatus(false, 'BACKEND: OFFLINE (API ERROR)');
      });
  }

  private toggleInventory() {
    this.inventoryUI.toggle(this.characterPanelUI);
    this.hudManager.updateMenuButtonsHighlight(
      this.inventoryUI.getIsOpen(),
      this.characterPanelUI.getIsOpen()
    );
  }

  private toggleCharacterPanel() {
    this.characterPanelUI.toggle(this.inventoryUI);
    this.hudManager.updateMenuButtonsHighlight(
      this.inventoryUI.getIsOpen(),
      this.characterPanelUI.getIsOpen()
    );
  }

  private postUpdate() {
    if (!this.player || !this.player.active) return;

    // Sync player shadow position
    if (this.playerShadow && this.playerShadow.active) {
      this.playerShadow.setPosition(this.player.x, this.player.y + 24);
    }

    // Depth sorting
    this.player.setDepth(this.player.y);
    if (this.playerShadow && this.playerShadow.active) {
      this.playerShadow.setDepth(this.player.y - 1);
    }

    // Sync player equipment positions (runs post-physics, eliminating sync lag)
    if (this.paperDoll) {
      this.paperDoll.syncPositions();
    }
  }
}
