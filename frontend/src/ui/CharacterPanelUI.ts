import Phaser from 'phaser';
import { useCharacterStore } from '../stores/characterStore';
import { EquipmentSlot } from '../types/equipment';
import { EquipmentRegistry, RarityColors } from '../config/equipmentRegistry';
import { ItemRegistry } from '../config/itemRegistry';
import { InventoryUI } from './InventoryUI';

export class CharacterPanelUI extends Phaser.GameObjects.Container {
  private isOpen = false;
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private slotsContainer!: Phaser.GameObjects.Container;
  private statsContainer!: Phaser.GameObjects.Container;
  private detailsContainer!: Phaser.GameObjects.Container;

  private selectedSlot: EquipmentSlot | null = null;
  private slotZones: Phaser.GameObjects.Zone[] = [];

  private detailTitleText!: Phaser.GameObjects.Text;
  private detailSlotText!: Phaser.GameObjects.Text;
  private detailDescText!: Phaser.GameObjects.Text;
  private unequipBtnZone: Phaser.GameObjects.Zone | null = null;
  private unequipBtnContainer!: Phaser.GameObjects.Container;

  private panelWidth = 420;
  private panelHeight = 400;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);

    this.scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(30000);

    this.createPanel();
    this.setVisible(false);

    // Re-draw panel on store updates (equipping/unequipping)
    useCharacterStore.subscribe(() => {
      if (this.isOpen) {
        this.renderEquipment();
        this.renderStats();
      }
    });
  }

  private createPanel(): void {
    const w = this.panelWidth;
    const h = this.panelHeight;

    // 1. Draw Panel Background
    this.bgGraphics = this.scene.add.graphics();
    this.add(this.bgGraphics);

    this.bgGraphics.fillStyle(0x0f0c1b, 0.96);
    this.bgGraphics.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    this.bgGraphics.lineStyle(2, 0xd97706, 0.95);
    this.bgGraphics.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    this.bgGraphics.lineStyle(1, 0xf59e0b, 0.4);
    this.bgGraphics.strokeRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 6);

    // Header Title
    const headerText = this.scene.add.text(-w / 2 + 24, -h / 2 + 20, 'HERO PROFILE', {
      fontFamily: 'Cinzel',
      fontSize: '20px',
      color: '#f59e0b',
      fontStyle: 'bold',
    });
    this.add(headerText);

    // Close prompt
    const closeText = this.scene.add.text(w / 2 - 110, -h / 2 + 24, 'PRESS C TO CLOSE', {
      fontFamily: 'Montserrat',
      fontSize: '10px',
      color: '#94a3b8',
      fontStyle: 'bold',
    });
    this.add(closeText);

    // 2. Left side: Slots Container
    this.slotsContainer = this.scene.add.container(-w / 2 + 24, -h / 2 + 75);
    this.add(this.slotsContainer);

    // 3. Right side: Stats Container
    this.statsContainer = this.scene.add.container(20, -h / 2 + 75);
    this.add(this.statsContainer);

    // 4. Bottom Center: Selected slot detail card
    this.detailsContainer = this.scene.add.container(-w / 2 + 24, h / 2 - 135);
    this.add(this.detailsContainer);

    this.createDetailsPanel();
  }

  private createDetailsPanel(): void {
    const w = 372;
    const h = 110;

    const dbg = this.scene.add.graphics();
    dbg.fillStyle(0x131127, 0.85);
    dbg.fillRoundedRect(0, 0, w, h, 6);
    dbg.lineStyle(1, 0x4f46e5, 0.4);
    dbg.strokeRoundedRect(0, 0, w, h, 6);
    this.detailsContainer.add(dbg);

    // Item title
    this.detailTitleText = this.scene.add.text(16, 14, 'NO EQUIPMENT SELECTED', {
      fontFamily: 'Cinzel',
      fontSize: '12px',
      color: '#f59e0b',
      fontStyle: 'bold',
    });
    this.detailsContainer.add(this.detailTitleText);

    // Slot type
    this.detailSlotText = this.scene.add.text(16, 32, 'Select a slot to view gear details.', {
      fontFamily: 'Montserrat',
      fontSize: '9px',
      color: '#a78bfa',
      fontStyle: 'bold',
    });
    this.detailsContainer.add(this.detailSlotText);

    // Description & stat bonuses
    this.detailDescText = this.scene.add.text(16, 48, '', {
      fontFamily: 'Montserrat',
      fontSize: '10px',
      color: '#cbd5e1',
      wordWrap: { width: w - 140, useAdvancedWrap: true },
      lineSpacing: 3,
    });
    this.detailsContainer.add(this.detailDescText);

    // Unequip button container
    this.unequipBtnContainer = this.scene.add.container(w - 110, 36);
    this.detailsContainer.add(this.unequipBtnContainer);

    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0x7f1d1d, 0.9); // Dark red unequip
    btnBg.fillRoundedRect(0, 0, 94, 30, 4);
    btnBg.lineStyle(1, 0xef4444, 0.6);
    btnBg.strokeRoundedRect(0, 0, 94, 30, 4);
    
    const btnTxt = this.scene.add.text(47, 15, 'UNEQUIP', {
      fontFamily: 'Montserrat',
      fontSize: '10px',
      color: '#fecaca',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.unequipBtnContainer.add([btnBg, btnTxt]);
    this.unequipBtnContainer.setVisible(false);
  }

  public renderEquipment(): void {
    // Clear slots and zones
    this.slotsContainer.removeAll(true);
    this.cleanupZones();

    const equip = useCharacterStore.getState().equipment;
    const slotSize = 52;
    const spacing = 10;

    const centerX = this.x;
    const centerY = this.scene.scale.height / 2;

    const startX = -this.panelWidth / 2 + 24;
    const startY = -this.panelHeight / 2 + 75;

    // Display equipment slots in a neat 2x3 grid
    const layout = [
      { slot: 'helmet', col: 0, row: 0, label: 'HELMET' },
      { slot: 'chest', col: 0, row: 1, label: 'CHEST' },
      { slot: 'boots', col: 0, row: 2, label: 'BOOTS' },
      { slot: 'gloves', col: 1, row: 0, label: 'GLOVES' },
      { slot: 'weapon', col: 1, row: 1, label: 'WEAPON' },
      { slot: 'ring', col: 1, row: 2, label: 'RING' },
    ];

    layout.forEach((pos) => {
      const px = pos.col * (slotSize + spacing);
      const py = pos.row * (slotSize + spacing);

      const slot = this.scene.add.container(px, py);
      const itemId = equip[pos.slot as EquipmentSlot];
      const isEquipped = !!itemId;

      const isSelected = this.selectedSlot === pos.slot;

      // Draw background slot border/plate
      const bg = this.scene.add.graphics();
      bg.fillStyle(isSelected ? 0x1e1b4b : 0x131127, isSelected ? 0.9 : 0.7);
      bg.fillRoundedRect(0, 0, slotSize, slotSize, 4);

      // Border colored by item rarity if equipped, otherwise standard blue
      let borderCol = 0x4f46e5;
      let borderThick = 1.5;
      if (isSelected) {
        borderCol = 0xd97706;
        borderThick = 2.0;
      } else if (isEquipped) {
        const def = EquipmentRegistry[itemId!];
        if (def) {
          borderCol = RarityColors[def.rarity].border;
          borderThick = 1.8;
        }
      }

      bg.lineStyle(borderThick, borderCol, isSelected || isEquipped ? 1.0 : 0.4);
      bg.strokeRoundedRect(0, 0, slotSize, slotSize, 4);
      slot.add(bg);

      if (isEquipped && itemId) {
        const itemDef = ItemRegistry[itemId];
        if (itemDef) {
          // Render item icon
          const icon = this.scene.add.image(slotSize / 2, slotSize / 2, itemDef.icon).setDisplaySize(36, 36);
          slot.add(icon);
        }
      } else {
        // Draw placeholder text / slot name
        const placeholder = this.scene.add.text(slotSize / 2, slotSize / 2, pos.label.substring(0, 4), {
          fontFamily: 'Montserrat',
          fontSize: '8px',
          color: '#4b5563',
          fontStyle: 'bold',
        }).setOrigin(0.5);
        slot.add(placeholder);
      }

      // Create interactive scene-level zone
      const absX = centerX + startX + px + slotSize / 2;
      const absY = centerY + startY + py + slotSize / 2;

      const zone = this.scene.add.zone(absX, absY, slotSize, slotSize)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(31000);

      zone.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x1e1b4b, 0.95);
        bg.fillRoundedRect(0, 0, slotSize, slotSize, 4);
        bg.lineStyle(2, 0xd97706, 0.95);
        bg.strokeRoundedRect(0, 0, slotSize, slotSize, 4);

        this.showSlotDetails(pos.slot as EquipmentSlot);
      });

      zone.on('pointerout', () => {
        const stillSelected = this.selectedSlot === pos.slot;
        bg.clear();
        bg.fillStyle(stillSelected ? 0x1e1b4b : 0x131127, stillSelected ? 0.9 : 0.7);
        bg.fillRoundedRect(0, 0, slotSize, slotSize, 4);

        let outBorderCol = 0x4f46e5;
        let outBorderThick = 1.5;
        if (stillSelected) {
          outBorderCol = 0xd97706;
          outBorderThick = 2.0;
        } else if (isEquipped) {
          const def = EquipmentRegistry[itemId!];
          if (def) {
            outBorderCol = RarityColors[def.rarity].border;
            outBorderThick = 1.8;
          }
        }
        bg.lineStyle(outBorderThick, outBorderCol, stillSelected || isEquipped ? 1.0 : 0.4);
        bg.strokeRoundedRect(0, 0, slotSize, slotSize, 4);

        if (this.selectedSlot) {
          this.showSlotDetails(this.selectedSlot);
        } else {
          this.clearDetails();
        }
      });

      zone.on('pointerdown', () => {
        if (this.selectedSlot === pos.slot) {
          this.selectedSlot = null;
          this.clearDetails();
        } else {
          this.selectedSlot = pos.slot as EquipmentSlot;
          this.showSlotDetails(this.selectedSlot);
        }
        this.renderEquipment();
      });

      this.slotZones.push(zone);
      this.slotsContainer.add(slot);
    });
  }

  public renderStats(): void {
    this.statsContainer.removeAll(true);

    const store = useCharacterStore.getState();
    const base = store.baseStats;
    const total = store.getTotalStats();
    const derived = store.getDerivedStats();

    const textStyleName = { fontFamily: 'Montserrat', fontSize: '10px', color: '#94a3b8', fontStyle: 'bold' };
    const textStyleVal = { fontFamily: 'Montserrat', fontSize: '11px', color: '#f59e0b', fontStyle: 'bold' };

    let yOffset = 0;

    // Header: Base Stats
    const baseHeader = this.scene.add.text(0, yOffset, 'BASE STATS', {
      fontFamily: 'Cinzel', fontSize: '12px', color: '#e2e8f0', fontStyle: 'bold'
    });
    this.statsContainer.add(baseHeader);
    yOffset += 16;

    const baseStatsList = [
      { key: 'Health', baseVal: base.health, totalVal: total.health },
      { key: 'Stamina', baseVal: base.stamina, totalVal: total.stamina },
      { key: 'Strength', baseVal: base.strength, totalVal: total.strength },
      { key: 'Defense', baseVal: base.defense, totalVal: total.defense },
      { key: 'Agility', baseVal: base.agility, totalVal: total.agility },
    ];

    baseStatsList.forEach((stat) => {
      const nameTxt = this.scene.add.text(0, yOffset, stat.key, textStyleName);
      this.statsContainer.add(nameTxt);

      // Show base stat, and (+bonus) if equipped items modify it
      let valStr = `${stat.totalVal}`;
      const bonus = stat.totalVal - stat.baseVal;
      if (bonus > 0) {
        valStr += ` (+${bonus})`;
      }

      const valTxt = this.scene.add.text(100, yOffset, valStr, textStyleVal);
      this.statsContainer.add(valTxt);
      yOffset += 14;
    });

    yOffset += 10;

    // Header: Derived Stats
    const derivedHeader = this.scene.add.text(0, yOffset, 'DERIVED RATINGS', {
      fontFamily: 'Cinzel', fontSize: '12px', color: '#e2e8f0', fontStyle: 'bold'
    });
    this.statsContainer.add(derivedHeader);
    yOffset += 16;

    const derivedStatsList = [
      { key: 'Max Health', val: derived.maxHealth },
      { key: 'Max Stamina', val: derived.maxStamina },
      { key: 'Attack Power', val: derived.attackPower },
      { key: 'Armor Rating', val: derived.armorRating },
      { key: 'Move Speed', val: Math.round(derived.moveSpeed) },
    ];

    derivedStatsList.forEach((stat) => {
      const nameTxt = this.scene.add.text(0, yOffset, stat.key, textStyleName);
      this.statsContainer.add(nameTxt);

      const valTxt = this.scene.add.text(100, yOffset, `${stat.val}`, textStyleVal);
      this.statsContainer.add(valTxt);
      yOffset += 14;
    });
  }

  private showSlotDetails(slot: EquipmentSlot): void {
    const equip = useCharacterStore.getState().equipment;
    const itemId = equip[slot];

    this.cleanupUnequipZone();

    if (itemId) {
      const itemDef = ItemRegistry[itemId];
      const eqDef = EquipmentRegistry[itemId];
      if (itemDef && eqDef) {
        const rarityInfo = RarityColors[eqDef.rarity];
        this.detailTitleText.setText(itemDef.name.toUpperCase());
        this.detailTitleText.setStyle({ color: rarityInfo.hexString });

        this.detailSlotText.setText(`${rarityInfo.text.toUpperCase()} ${slot.toUpperCase()}`);

        // Format stat bonuses
        let statsStr = '';
        Object.entries(eqDef.stats).forEach(([statKey, val]) => {
          if (val && val > 0) {
            statsStr += `+${val} ${statKey.toUpperCase()}   `;
          }
        });
        this.detailDescText.setText(`${itemDef.description}\n\n${statsStr}`);

        // Show unequip button
        this.unequipBtnContainer.setVisible(true);

        const w = 372;
        const absBtnX = this.x - this.panelWidth / 2 + 24 + (w - 110) + 47;
        const absBtnY = (this.scene.scale.height / 2) + (this.panelHeight / 2 - 135) + 36 + 15;

        this.unequipBtnZone = this.scene.add.zone(absBtnX, absBtnY, 94, 30)
          .setInteractive({ useHandCursor: true })
          .setScrollFactor(0)
          .setDepth(32000);

        this.unequipBtnZone.on('pointerdown', () => {
          this.scene.tweens.add({
            targets: this.unequipBtnContainer,
            scale: 0.92,
            duration: 80,
            yoyo: true,
            onComplete: () => {
              useCharacterStore.getState().unequipItem(slot).then((success) => {
                if (success) {
                  this.selectedSlot = null;
                  this.clearDetails();
                  this.renderEquipment();
                  this.renderStats();
                }
              });
            }
          });
        });
      }
    } else {
      this.detailTitleText.setText('EMPTY SLOT');
      this.detailTitleText.setStyle({ color: '#f59e0b' });
      this.detailSlotText.setText(slot.toUpperCase());
      this.detailDescText.setText('No equipment currently fitted in this slot.');
      this.unequipBtnContainer.setVisible(false);
    }
  }

  private clearDetails(): void {
    this.detailTitleText.setText('NO EQUIPMENT SELECTED');
    this.detailTitleText.setStyle({ color: '#f59e0b' });
    this.detailSlotText.setText('Select a slot to view gear details.');
    this.detailDescText.setText('');
    this.unequipBtnContainer.setVisible(false);
    this.cleanupUnequipZone();
  }

  private cleanupZones(): void {
    this.slotZones.forEach(z => z.destroy());
    this.slotZones = [];
    this.cleanupUnequipZone();
  }

  private cleanupUnequipZone(): void {
    if (this.unequipBtnZone) {
      this.unequipBtnZone.destroy();
      this.unequipBtnZone = null;
    }
  }

  public toggle(inventoryUI?: InventoryUI): void {
    this.isOpen = !this.isOpen;
    this.setVisible(this.isOpen);

    if (this.isOpen) {
      // Fetch fresh equipment status when opening
      useCharacterStore.getState().fetchEquipment();
      this.selectedSlot = null;
      this.clearDetails();
      this.renderEquipment();
      this.renderStats();

      // Dynamic side-by-side positioning check
      this.adjustLayout(inventoryUI);

      // Slide in animation
      const targetY = this.scene.scale.height / 2;
      this.y = targetY + 30;
      this.alpha = 0;
      this.scene.tweens.add({
        targets: this,
        y: targetY,
        alpha: 1,
        duration: 220,
        ease: 'Cubic.easeOut',
      });
    } else {
      this.cleanupZones();
      this.selectedSlot = null;
      this.clearDetails();
      
      // Reset layout for inventory if it remains open
      if (inventoryUI && inventoryUI.getIsOpen()) {
        inventoryUI.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);
        inventoryUI.renderInventory();
        inventoryUI.createTabZones();
      }
    }
  }

  public adjustLayout(inventoryUI?: InventoryUI): void {
    const { width, height } = this.scene.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    const isInventoryOpen = inventoryUI && inventoryUI.getIsOpen();

    if (isInventoryOpen) {
      // Shift side-by-side: Character Panel left, Inventory Panel right
      this.setPosition(centerX - 240, centerY);
      inventoryUI.setPosition(centerX + 270, centerY);
    } else {
      // Center
      this.setPosition(centerX, centerY);
    }

    // Force redraw slots to update absolute zones
    this.renderEquipment();
    this.renderStats();

    if (isInventoryOpen) {
      inventoryUI.renderInventory();
      inventoryUI.createTabZones();
    }
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public destroy(): void {
    this.cleanupZones();
    super.destroy();
  }
}
