import Phaser from 'phaser';
import { useInventoryStore } from '../stores/inventoryStore';
import { ItemRegistry } from '../config/itemRegistry';
import { ItemCategory, ItemDefinition } from '../types/item';

export class InventoryUI extends Phaser.GameObjects.Container {
  private isOpen = false;
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private gridContainer!: Phaser.GameObjects.Container;
  private detailsContainer!: Phaser.GameObjects.Container;

  private currentFilter: 'all' | ItemCategory = 'all';
  private tabButtons: Phaser.GameObjects.Container[] = [];
  private selectedItem: ItemDefinition | null = null;
  private tabZones: Phaser.GameObjects.Zone[] = [];
  private slotZones: Phaser.GameObjects.Zone[] = [];

  // Detail panel elements
  private detailTitleText!: Phaser.GameObjects.Text;
  private detailCategoryText!: Phaser.GameObjects.Text;
  private detailDescText!: Phaser.GameObjects.Text;

  private panelWidth = 560;
  private panelHeight = 400;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);

    this.scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(30000);

    this.createPanel();
    this.setVisible(false);

    // Watch for inventory state updates to redraw dynamically
    useInventoryStore.subscribe(() => {
      if (this.isOpen) {
        this.renderInventory();
      }
    });

    scene.scale.on('resize', this.onResize, this);
  }

  private onResize(gameSize: { width: number; height: number }): void {
    this.setPosition(gameSize.width / 2, gameSize.height / 2);
    if (this.isOpen) {
      this.createTabZones();
      this.renderInventory();
    }
  }

  private createPanel(): void {
    // 1. Draw Panel Background
    this.bgGraphics = this.scene.add.graphics();
    this.add(this.bgGraphics);

    const w = this.panelWidth;
    const h = this.panelHeight;

    this.bgGraphics.clear();
    // Inner panel backing
    this.bgGraphics.fillStyle(0x0f0c1b, 0.96);
    this.bgGraphics.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    // Double gold border
    this.bgGraphics.lineStyle(2, 0xd97706, 0.95);
    this.bgGraphics.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    this.bgGraphics.lineStyle(1, 0xf59e0b, 0.4);
    this.bgGraphics.strokeRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 6);

    // Header Text
    const headerText = this.scene.add.text(-w / 2 + 24, -h / 2 + 20, 'HERO INVENTORY', {
      fontFamily: 'Cinzel',
      fontSize: '20px',
      color: '#f59e0b',
      fontStyle: 'bold',
    });
    this.add(headerText);

    // Close button instruction
    const closeInstruction = this.scene.add.text(w / 2 - 140, -h / 2 + 24, 'PRESS TAB TO CLOSE', {
      fontFamily: 'Montserrat',
      fontSize: '10px',
      color: '#94a3b8',
      fontStyle: 'bold',
    });
    this.add(closeInstruction);

    // 2. Create Grid Container (Left Side)
    this.gridContainer = this.scene.add.container(-w / 2 + 24, -h / 2 + 90);
    this.add(this.gridContainer);

    // 3. Create Details Container (Right Side)
    this.detailsContainer = this.scene.add.container(w / 2 - 180, -h / 2 + 90);
    this.add(this.detailsContainer);

    this.createDetailsPanel();
    this.createCategoryTabs();
  }

  private createCategoryTabs(): void {
    const categories: { label: string; value: 'all' | ItemCategory }[] = [
      { label: 'ALL', value: 'all' },
      { label: 'RESOURCES', value: 'resource' },
      { label: 'WEAPONS', value: 'weapon' },
      { label: 'ARMOR', value: 'armor' },
      { label: 'CONSUMABLES', value: 'consumable' },
      { label: 'QUESTS', value: 'quest' },
    ];

    const tabWidth = 72;
    const tabHeight = 26;
    const startX = -this.panelWidth / 2 + 24;
    const startY = -this.panelHeight / 2 + 58;

    categories.forEach((cat, idx) => {
      const tab = this.scene.add.container(startX + idx * (tabWidth + 4), startY);
      
      const bg = this.scene.add.graphics();
      const txt = this.scene.add.text(tabWidth / 2, tabHeight / 2 - 1, cat.label, {
        fontFamily: 'Montserrat',
        fontSize: '9px',
        color: '#94a3b8',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      tab.add([bg, txt]);
      this.add(tab);
      this.tabButtons.push(tab);

      const drawTab = (active: boolean) => {
        bg.clear();
        if (active) {
          bg.fillStyle(0xd97706, 0.85); // Gold background
          bg.fillRoundedRect(0, 0, tabWidth, tabHeight, { tl: 4, tr: 4, bl: 0, br: 0 });
          txt.setStyle({ color: '#0f0c1b' });
        } else {
          bg.fillStyle(0x1e1b4b, 0.4); // Dark background
          bg.fillRoundedRect(0, 0, tabWidth, tabHeight, { tl: 4, tr: 4, bl: 0, br: 0 });
          bg.lineStyle(1, 0x4f46e5, 0.4);
          bg.strokeRoundedRect(0, 0, tabWidth, tabHeight, { tl: 4, tr: 4, bl: 0, br: 0 });
          txt.setStyle({ color: '#94a3b8' });
        }
      };

      // Set initial
      drawTab(this.currentFilter === cat.value);
    });
  }

  private updateTabStyles(): void {
    const categories: { label: string; value: 'all' | ItemCategory }[] = [
      { label: 'ALL', value: 'all' },
      { label: 'RESOURCES', value: 'resource' },
      { label: 'WEAPONS', value: 'weapon' },
      { label: 'ARMOR', value: 'armor' },
      { label: 'CONSUMABLES', value: 'consumable' },
      { label: 'QUESTS', value: 'quest' },
    ];

    const tabWidth = 72;
    const tabHeight = 26;

    this.tabButtons.forEach((btn, bIdx) => {
      const isActive = categories[bIdx].value === this.currentFilter;
      const btnBg = btn.list[0] as Phaser.GameObjects.Graphics;
      const btnTxt = btn.list[1] as Phaser.GameObjects.Text;
      btnBg.clear();
      if (isActive) {
        btnBg.fillStyle(0xd97706, 0.85);
        btnBg.fillRoundedRect(0, 0, tabWidth, tabHeight, { tl: 4, tr: 4, bl: 0, br: 0 });
        btnTxt.setStyle({ color: '#0f0c1b' });
      } else {
        btnBg.fillStyle(0x1e1b4b, 0.4);
        btnBg.fillRoundedRect(0, 0, tabWidth, tabHeight, { tl: 4, tr: 4, bl: 0, br: 0 });
        btnBg.lineStyle(1, 0x4f46e5, 0.4);
        btnBg.strokeRoundedRect(0, 0, tabWidth, tabHeight, { tl: 4, tr: 4, bl: 0, br: 0 });
        btnTxt.setStyle({ color: '#94a3b8' });
      }
    });
  }

  private createTabZones(): void {
    this.tabZones.forEach(z => z.destroy());
    this.tabZones = [];

    const categories: { label: string; value: 'all' | ItemCategory }[] = [
      { label: 'ALL', value: 'all' },
      { label: 'RESOURCES', value: 'resource' },
      { label: 'WEAPONS', value: 'weapon' },
      { label: 'ARMOR', value: 'armor' },
      { label: 'CONSUMABLES', value: 'consumable' },
      { label: 'QUESTS', value: 'quest' },
    ];

    const tabWidth = 72;
    const tabHeight = 26;
    const startX = -this.panelWidth / 2 + 24;
    const startY = -this.panelHeight / 2 + 58;

    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    categories.forEach((cat, idx) => {
      const absX = centerX + startX + idx * (tabWidth + 4) + tabWidth / 2;
      const absY = centerY + startY + tabHeight / 2;

      const zone = this.scene.add.zone(absX, absY, tabWidth, tabHeight)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(31000);

      zone.on('pointerdown', () => {
        this.currentFilter = cat.value;
        this.updateTabStyles();
        this.renderInventory();
      });

      this.tabZones.push(zone);
    });
  }

  private createDetailsPanel(): void {
    const w = 160;
    const h = 286;

    // Background card for item detail
    const detailsBg = this.scene.add.graphics();
    detailsBg.fillStyle(0x131127, 0.85);
    detailsBg.fillRoundedRect(0, 0, w, h, 6);
    detailsBg.lineStyle(1, 0x4f46e5, 0.4);
    detailsBg.strokeRoundedRect(0, 0, w, h, 6);
    this.detailsContainer.add(detailsBg);

    // Detail Title
    this.detailTitleText = this.scene.add.text(w / 2, 24, 'NO ITEM SELECTED', {
      fontFamily: 'Cinzel',
      fontSize: '12px',
      color: '#f59e0b',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);
    this.detailsContainer.add(this.detailTitleText);

    // Detail Category
    this.detailCategoryText = this.scene.add.text(w / 2, 44, '', {
      fontFamily: 'Montserrat',
      fontSize: '9px',
      color: '#a78bfa',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.detailsContainer.add(this.detailCategoryText);

    // Description text
    this.detailDescText = this.scene.add.text(12, 64, 'Hover over an item slot to view details.', {
      fontFamily: 'Montserrat',
      fontSize: '10px',
      color: '#cbd5e1',
      wordWrap: { width: w - 24, useAdvancedWrap: true },
      lineSpacing: 4,
    });
    this.detailsContainer.add(this.detailDescText);
  }

  private renderInventory(): void {
    // Clear previous grid elements and slot zones
    this.gridContainer.removeAll(true);
    this.slotZones.forEach(z => z.destroy());
    this.slotZones = [];

    const items = useInventoryStore.getState().items;

    // Filter items
    const filteredItems = items.filter((item) => {
      if (this.currentFilter === 'all') return true;
      const def = ItemRegistry[item.itemId];
      return def && def.category === this.currentFilter;
    });

    const slotSize = 52;
    const spacing = 8;
    const cols = 6;
    const rows = 5;
    const totalSlots = cols * rows;

    const gridStartX = -this.panelWidth / 2 + 24;
    const gridStartY = -this.panelHeight / 2 + 90;

    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    for (let i = 0; i < totalSlots; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * (slotSize + spacing);
      const y = row * (slotSize + spacing);

      const slot = this.scene.add.container(x, y);
      slot.setSize(slotSize, slotSize);

      const isItem = i < filteredItems.length;
      let def: ItemDefinition | null = null;
      let item: any = null;

      if (isItem) {
        item = filteredItems[i];
        def = ItemRegistry[item.itemId];
      }

      const isSelected = def && this.selectedItem && this.selectedItem.id === def.id;

      const bg = this.scene.add.graphics();
      bg.fillStyle(isSelected ? 0x1e1b4b : 0x131127, isSelected ? 0.9 : 0.7);
      bg.fillRoundedRect(0, 0, slotSize, slotSize, 4);
      bg.lineStyle(isSelected ? 2 : 1.5, isSelected ? 0xd97706 : 0x4f46e5, isSelected ? 1.0 : 0.4);
      bg.strokeRoundedRect(0, 0, slotSize, slotSize, 4);
      slot.add(bg);

      // Render item if exists
      if (isItem && def) {
        // Add icon texture
        const iconImg = this.scene.add.image(slotSize / 2, slotSize / 2, def.icon).setDisplaySize(36, 36);
        slot.add(iconImg);

        // Add quantity text
        if (item.quantity > 1) {
          const qtyTxt = this.scene.add.text(slotSize - 4, slotSize - 4, `${item.quantity}`, {
            fontFamily: 'Montserrat',
            fontSize: '10px',
            color: '#ffffff',
            fontStyle: 'bold',
          }).setOrigin(1, 1).setShadow(1, 1, '#000000', 3);
          slot.add(qtyTxt);
        }

        const itemDef = def; // Local copy for callbacks

        // Create scene-level interactive zone
        const absX = centerX + gridStartX + x + slotSize / 2;
        const absY = centerY + gridStartY + y + slotSize / 2;

        const zone = this.scene.add.zone(absX, absY, slotSize, slotSize)
          .setInteractive({ useHandCursor: true })
          .setScrollFactor(0)
          .setDepth(31000);

        zone.on('pointerover', () => {
          bg.clear();
          bg.fillStyle(0x1e1b4b, 0.95);
          bg.fillRoundedRect(0, 0, slotSize, slotSize, 4);
          bg.lineStyle(2, 0xd97706, 0.95); // Hover/Highlight gold border
          bg.strokeRoundedRect(0, 0, slotSize, slotSize, 4);

          this.showItemDetails(itemDef);
        });

        zone.on('pointerout', () => {
          const stillSelected = this.selectedItem && this.selectedItem.id === itemDef.id;
          bg.clear();
          bg.fillStyle(stillSelected ? 0x1e1b4b : 0x131127, stillSelected ? 0.9 : 0.7);
          bg.fillRoundedRect(0, 0, slotSize, slotSize, 4);
          bg.lineStyle(stillSelected ? 2 : 1.5, stillSelected ? 0xd97706 : 0x4f46e5, stillSelected ? 1.0 : 0.4);
          bg.strokeRoundedRect(0, 0, slotSize, slotSize, 4);

          // Restore details of selected item if any, otherwise clear
          if (this.selectedItem) {
            this.showItemDetails(this.selectedItem);
          } else {
            this.clearItemDetails();
          }
        });

        zone.on('pointerdown', () => {
          if (this.selectedItem && this.selectedItem.id === itemDef.id) {
            this.selectedItem = null;
            this.clearItemDetails();
          } else {
            this.selectedItem = itemDef;
            this.showItemDetails(itemDef);
          }
          
          // Re-render inventory grid to update selections
          this.renderInventory();
        });

        this.slotZones.push(zone);
      }

      this.gridContainer.add(slot);
    }
  }

  private showItemDetails(def: ItemDefinition): void {
    this.detailTitleText.setText(def.name.toUpperCase());
    this.detailCategoryText.setText(def.category.toUpperCase());
    this.detailDescText.setText(def.description);
  }

  private clearItemDetails(): void {
    this.detailTitleText.setText('NO ITEM SELECTED');
    this.detailCategoryText.setText('');
    this.detailDescText.setText('Hover over an item slot to view details.');
  }

  private cleanupZones(): void {
    this.tabZones.forEach(z => z.destroy());
    this.tabZones = [];
    this.slotZones.forEach(z => z.destroy());
    this.slotZones = [];
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
    this.setVisible(this.isOpen);

    if (this.isOpen) {
      // Fetch fresh inventory when UI opens
      useInventoryStore.getState().fetchInventory();
      this.updateTabStyles();
      this.renderInventory();
      this.createTabZones();

      // Soft slide-in animation
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
      this.selectedItem = null;
      this.clearItemDetails();
    }
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public destroy(): void {
    this.scene.scale.off('resize', this.onResize, this);
    this.cleanupZones();
    super.destroy();
  }
}
