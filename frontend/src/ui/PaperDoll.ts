import Phaser from 'phaser';
import { useCharacterStore } from '../stores/characterStore';
import { ItemRegistry } from '../config/itemRegistry';
import { EquipmentSlot } from '../types/equipment';

export class PaperDoll {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  private sprites: Record<string, Phaser.GameObjects.Image> = {};
  private isSwinging = false;
  private unsubscribe?: () => void;

  constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite) {
    this.scene = scene;
    this.player = player;
    this.init();
  }

  private init() {
    // Initial update
    this.updateAppearance();

    // Subscribe to store updates
    this.unsubscribe = useCharacterStore.subscribe(() => {
      this.updateAppearance();
    });
  }

  public updateAppearance() {
    const equipment = useCharacterStore.getState().equipment;
    const slots = ['weapon', 'helmet', 'chest', 'boots'];

    slots.forEach((slot) => {
      const itemId = equipment[slot as EquipmentSlot];
      if (!itemId) {
        if (this.sprites[slot]) {
          this.sprites[slot].setVisible(false);
        }
        return;
      }

      const itemDef = ItemRegistry[itemId];
      // Weapon uses standard icon, armor pieces use character-fit overlays
      const textureKey = slot === 'weapon'
        ? (itemDef ? itemDef.icon : `item-${itemId.replace(/_/g, '-')}`)
        : `char-${slot}-${itemId}`;

      if (!this.scene.textures.exists(textureKey)) {
        console.warn(`PaperDoll: Texture for ${slot} (${textureKey}) does not exist in cache.`);
        if (this.sprites[slot]) {
          this.sprites[slot].setVisible(false);
        }
        return;
      }

      let sprite = this.sprites[slot];
      if (!sprite) {
        sprite = this.scene.add.image(this.player.x, this.player.y, textureKey);
        
        if (slot === 'weapon') {
          sprite.setOrigin(0.5, 0.75); // Weapon pivot
        } else {
          sprite.setOrigin(0.5, 0.5); // Armor overlays fit exactly
        }

        this.sprites[slot] = sprite;
      } else {
        sprite.setTexture(textureKey);
        sprite.setVisible(true);
      }
    });

    this.syncPositions();
  }

  public syncPositions() {
    if (!this.player || !this.player.active) return;

    const isFlipped = this.player.flipX;

    Object.entries(this.sprites).forEach(([slot, sprite]) => {
      if (!sprite || !sprite.active || !sprite.visible) return;

      // Sync scale (inheriting player walking/breathing squish 1:1)
      sprite.setScale(this.player.scaleX, this.player.scaleY);

      // Depth layering
      let depthOffset = 0.1;
      if (slot === 'boots') depthOffset = 0.1;
      else if (slot === 'chest') depthOffset = 0.2;
      else if (slot === 'helmet') depthOffset = 0.3;
      else if (slot === 'weapon') depthOffset = 0.4;
      sprite.setDepth(this.player.depth + depthOffset);

      if (slot === 'weapon') {
        if (!this.isSwinging) {
          const offsetX = (isFlipped ? -18 : 18) * this.player.scaleX;
          const offsetY = 14 * this.player.scaleY;
          sprite.setPosition(this.player.x + offsetX, this.player.y + offsetY);
          sprite.setRotation(isFlipped ? -0.6 : 0.6);
        }
      } else {
        sprite.setPosition(this.player.x, this.player.y);
        sprite.setRotation(0);
        sprite.setFlipX(isFlipped);
      }
    });
  }

  /**
   * Swing the weapon toward a specific angle (radians from player to cursor).
   * @param angle - The angle in radians from the player toward the cursor/target.
   */
  public swingWeapon(angle: number) {
    const weapon = this.sprites['weapon'];
    if (!weapon || !weapon.active || this.isSwinging) return;

    this.isSwinging = true;

    // Position weapon in the direction of the swing (close to the player body)
    const swingDistance = 20;
    const weaponX = this.player.x + Math.cos(angle) * swingDistance;
    const weaponY = this.player.y + Math.sin(angle) * swingDistance;
    weapon.setPosition(weaponX, weaponY);

    // Rotate weapon to point outward in the attack direction
    // Add PI/4 so the blade graphic points along the swing arc
    const baseRotation = angle + Math.PI / 4;
    weapon.setRotation(baseRotation);

    // Swing arc: rotate ±0.8 radians around the base angle
    this.scene.tweens.add({
      targets: weapon,
      rotation: baseRotation + 0.8,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut',
      onStart: () => {
        weapon.setRotation(baseRotation - 0.8);
      },
      onComplete: () => {
        this.isSwinging = false;
      }
    });
  }

  public destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    Object.values(this.sprites).forEach((sprite) => {
      if (sprite) sprite.destroy();
    });
    this.sprites = {};
  }
}
