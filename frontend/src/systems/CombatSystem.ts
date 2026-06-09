import Phaser from 'phaser';
import { getCharacterCombatStats } from './CharacterCombatStats';
import { useCharacterStore } from '../stores/characterStore';
import { DamageSystem } from './DamageSystem';
import { EnemyBase } from '../entities/EnemyBase';
import { PaperDoll } from '../ui/PaperDoll';

export class CombatSystem {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  private enemies: Phaser.Physics.Arcade.Group;
  private paperDoll: PaperDoll;

  private spaceKey?: Phaser.Input.Keyboard.Key;
  private lastAttackTime = 0;
  private attackCooldown = 400; // Milliseconds between attacks
  private staminaCost = 15;

  constructor(
    scene: Phaser.Scene,
    player: Phaser.Physics.Arcade.Sprite,
    enemies: Phaser.Physics.Arcade.Group,
    paperDoll: PaperDoll
  ) {
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
    this.paperDoll = paperDoll;

    // Bind keyboard inputs
    if (scene.input.keyboard) {
      this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // Bind mouse pointer down event
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.player.active) return;
      if (pointer.leftButtonDown()) {
        const time = this.scene.time.now;
        if (time - this.lastAttackTime >= this.attackCooldown) {
          this.executeAttack(time);
        }
      }
    });
  }

  public update(): void {
    if (!this.player.active) return;

    const time = this.scene.time.now;

    // Check if SPACE key is just pressed
    const isSpaceJustDown = this.spaceKey ? Phaser.Input.Keyboard.JustDown(this.spaceKey) : false;

    if (isSpaceJustDown && time - this.lastAttackTime >= this.attackCooldown) {
      this.executeAttack(time);
    }

    // Passive stamina regeneration
    const stats = getCharacterCombatStats();
    if (stats.stamina < stats.maxStamina) {
      // Regenerate 0.15 stamina per tick
      useCharacterStore.getState().setStamina(stats.stamina + 0.15);
    }
  }

  private executeAttack(time: number): void {
    const stats = getCharacterCombatStats();

    // Check stamina availability
    if (stats.stamina < this.staminaCost) {
      // Show floating warning text above player
      DamageSystem.showFloatingText(this.scene, this.player.x, this.player.y - 12, 'No Stamina!', '#ef4444', 0.95);
      return;
    }

    // Deduct stamina
    useCharacterStore.getState().setStamina(stats.stamina - this.staminaCost);
    this.lastAttackTime = time;

    // Calculate angle from player to cursor (in world coordinates)
    const pointer = this.scene.input.activePointer;
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);

    // Flip the player sprite to face the cursor direction
    if (worldPoint.x < this.player.x) {
      this.player.setFlipX(true);
    } else {
      this.player.setFlipX(false);
    }

    // 1. Swing physical weapon sprite via PaperDoll (pass angle)
    this.paperDoll.swingWeapon(angle);

    // 2. Play attack body lurch (lunge in the direction of the cursor)
    const lungeDistance = 12;
    const lungeX = Math.cos(angle) * lungeDistance;
    const lungeY = Math.sin(angle) * lungeDistance;
    this.scene.tweens.add({
      targets: this.player,
      x: this.player.x + lungeX,
      y: this.player.y + lungeY,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    // 3. Spawn sword-slash arc visual effect at MELEE RANGE (fixed distance from player)
    const slashDistance = 28;
    const slashX = this.player.x + Math.cos(angle) * slashDistance;
    const slashY = this.player.y + Math.sin(angle) * slashDistance;
    const slash = this.scene.add.sprite(slashX, slashY, 'sword-slash');
    slash.setRotation(angle); // Rotate slash to face the cursor direction
    slash.setDepth(this.player.depth + 1);
    
    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 160,
      ease: 'Quad.easeOut',
      onComplete: () => {
        slash.destroy();
      },
    });

    // 4. Create collision overlap zone at MELEE RANGE (always near player, never at cursor)
    const hitDistance = 36; // Fixed melee range, regardless of cursor distance
    const hitX = this.player.x + Math.cos(angle) * hitDistance;
    const hitY = this.player.y + Math.sin(angle) * hitDistance;
    
    const zone = this.scene.add.zone(hitX, hitY, 52, 48);
    this.scene.physics.add.existing(zone);
    
    const body = zone.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);

    // Perform overlap detection with active enemies
    this.scene.physics.overlap(zone, this.enemies, (_, enemy) => {
      DamageSystem.applyDamageToEnemy(this.scene, this.player, enemy as EnemyBase);
    });

    // Destroy physics zone on the next tick
    this.scene.time.delayedCall(50, () => {
      zone.destroy();
    });
  }
}
