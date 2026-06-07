import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    console.log('BootScene: Creating high-quality polished textures...');

    // 1. CALM Grass Floor Tile (64x64) - Reduced density, desaturated, soft color variations, no grid lines, no wildflower dots
    const grassGraphics = this.make.graphics();
    grassGraphics.fillStyle(0x121813, 1);
    grassGraphics.fillRect(0, 0, 64, 64);
    // Soft subtle color variations
    grassGraphics.fillStyle(0x0e140f, 0.4);
    grassGraphics.fillCircle(18, 18, 16);
    grassGraphics.fillStyle(0x151c16, 0.4);
    grassGraphics.fillCircle(46, 46, 20);
    // Extremely subtle grass blades (low contrast)
    grassGraphics.fillStyle(0x19221a, 0.6);
    grassGraphics.fillRect(12, 14, 2, 4);
    grassGraphics.fillRect(40, 42, 2, 4);
    grassGraphics.generateTexture('grass', 64, 64);

    // 2. Bounded Stone border blocks (64x64)
    const stoneGraphics = this.make.graphics();
    stoneGraphics.fillStyle(0x21252d, 1);
    stoneGraphics.fillRect(0, 0, 64, 64);
    stoneGraphics.lineStyle(2, 0x111317, 1);
    stoneGraphics.strokeRect(0, 0, 64, 64);
    // Brick lines
    stoneGraphics.fillStyle(0x2d323c, 1);
    stoneGraphics.fillRect(2, 2, 60, 26);
    stoneGraphics.fillRect(2, 32, 28, 28);
    stoneGraphics.fillRect(34, 32, 28, 28);
    // Shading
    stoneGraphics.fillStyle(0x3b414e, 0.5);
    stoneGraphics.fillRect(4, 4, 56, 3);
    stoneGraphics.fillRect(4, 34, 24, 3);
    stoneGraphics.fillRect(36, 34, 24, 3);
    stoneGraphics.generateTexture('stone', 64, 64);

    // 3. Fading Ambient Drop Shadow Texture (64x64)
    const shadowGraphics = this.make.graphics();
    shadowGraphics.fillStyle(0x000000, 0.08);
    shadowGraphics.fillEllipse(32, 32, 30, 15);
    shadowGraphics.fillStyle(0x000000, 0.16);
    shadowGraphics.fillEllipse(32, 32, 24, 12);
    shadowGraphics.fillStyle(0x000000, 0.28);
    shadowGraphics.fillEllipse(32, 32, 18, 9);
    shadowGraphics.generateTexture('shadow', 64, 64);

    // 4. Polished Tree (64x64)
    const treeGraphics = this.make.graphics();
    // Trunk with bark textures
    treeGraphics.fillStyle(0x3c1d11, 1);
    treeGraphics.fillRect(28, 36, 8, 28);
    treeGraphics.fillStyle(0x200d07, 1);
    treeGraphics.fillRect(30, 36, 1.5, 28);
    treeGraphics.fillRect(34, 42, 1.5, 22);

    // Layered foliage
    treeGraphics.fillStyle(0x064e3b, 1);
    treeGraphics.fillCircle(32, 25, 21);
    treeGraphics.fillCircle(20, 23, 13);
    treeGraphics.fillCircle(44, 23, 13);
    treeGraphics.fillStyle(0x047857, 1);
    treeGraphics.fillCircle(32, 21, 19);
    treeGraphics.fillCircle(22, 19, 11);
    treeGraphics.fillCircle(42, 19, 11);
    treeGraphics.fillStyle(0x10b981, 1);
    treeGraphics.fillCircle(30, 16, 14);
    treeGraphics.fillCircle(24, 15, 8);
    treeGraphics.fillCircle(36, 15, 8);
    treeGraphics.fillStyle(0x34d399, 0.85);
    treeGraphics.fillCircle(28, 12, 6);
    treeGraphics.fillCircle(32, 10, 5);
    treeGraphics.generateTexture('tree', 64, 64);

    // 5. Polished Rock with Chiseled Facets (64x64)
    const rockGraphics = this.make.graphics();
    rockGraphics.fillStyle(0x1a2230, 1);
    rockGraphics.fillCircle(32, 36, 21);
    rockGraphics.fillStyle(0x475569, 1);
    rockGraphics.fillCircle(32, 34, 19);
    rockGraphics.fillStyle(0x64748b, 1);
    rockGraphics.fillCircle(30, 32, 15);
    rockGraphics.fillStyle(0x94a3b8, 1);
    rockGraphics.fillCircle(25, 27, 10);
    rockGraphics.fillCircle(35, 29, 8);
    rockGraphics.lineStyle(1.5, 0xcbd5e1, 0.4);
    rockGraphics.strokeCircle(25, 27, 10);
    rockGraphics.generateTexture('rock', 64, 64);

    // 6. Polished Bush (64x64)
    const bushGraphics = this.make.graphics();
    bushGraphics.fillStyle(0x0d381d, 1);
    bushGraphics.fillCircle(32, 36, 20);
    bushGraphics.fillStyle(0x14532d, 1);
    bushGraphics.fillCircle(32, 34, 18);
    bushGraphics.fillCircle(20, 36, 12);
    bushGraphics.fillCircle(44, 36, 12);
    bushGraphics.fillStyle(0x15803d, 1);
    bushGraphics.fillCircle(32, 30, 14);
    bushGraphics.fillCircle(24, 28, 9);
    bushGraphics.fillCircle(40, 28, 9);
    bushGraphics.fillStyle(0x22c55e, 0.8);
    bushGraphics.fillCircle(28, 22, 6);
    bushGraphics.fillCircle(36, 22, 6);
    bushGraphics.generateTexture('bush', 64, 64);

    // 7. Translucent Clouds (128x64)
    const cloudGraphics = this.make.graphics();
    cloudGraphics.fillStyle(0xffffff, 1);
    cloudGraphics.fillCircle(64, 32, 28);
    cloudGraphics.fillCircle(40, 38, 20);
    cloudGraphics.fillCircle(88, 38, 20);
    cloudGraphics.fillCircle(52, 22, 22);
    cloudGraphics.fillCircle(76, 22, 22);
    cloudGraphics.generateTexture('cloud', 128, 64);

    // 8. Large Ruined Fortress Silhouette - Center (384x256)
    // Connecting crumbled walls, flared base towers, gatehouse archway, tattered banner
    const centerGraphics = this.make.graphics();
    centerGraphics.fillStyle(0x080411, 1);

    // 8.1 Left Wall (x=0 to 100) - uneven crumbling top
    centerGraphics.beginPath();
    centerGraphics.moveTo(0, 256);
    centerGraphics.lineTo(0, 160);
    centerGraphics.lineTo(20, 160);
    centerGraphics.lineTo(20, 172); // crumbled notch
    centerGraphics.lineTo(40, 172);
    centerGraphics.lineTo(40, 155); // standing battlement
    centerGraphics.lineTo(60, 155);
    centerGraphics.lineTo(60, 165);
    centerGraphics.lineTo(85, 165);
    centerGraphics.lineTo(100, 180);
    centerGraphics.lineTo(100, 256);
    centerGraphics.closePath();
    centerGraphics.fillPath();

    // 8.2 Left Flank Tower (x=90 to 142) - wider at base, cracked top
    centerGraphics.beginPath();
    centerGraphics.moveTo(90, 256); // flared base left
    centerGraphics.lineTo(105, 80); // sloped tower wall
    centerGraphics.lineTo(105, 70);
    centerGraphics.lineTo(115, 70);
    centerGraphics.lineTo(115, 85); // cracked down
    centerGraphics.lineTo(125, 85);
    centerGraphics.lineTo(135, 95); // collapsed slope
    centerGraphics.lineTo(138, 95);
    centerGraphics.lineTo(142, 256); // flared base right
    centerGraphics.closePath();
    centerGraphics.fillPath();

    // 8.3 Gatehouse (x=142 to 242) - with arched gate cutout
    // Left Gate Tower (x=142 to 176)
    centerGraphics.beginPath();
    centerGraphics.moveTo(142, 256);
    centerGraphics.lineTo(148, 110);
    centerGraphics.lineTo(176, 110);
    centerGraphics.lineTo(176, 256);
    centerGraphics.closePath();
    centerGraphics.fillPath();

    // Right Gate Tower (x=208 to 242)
    centerGraphics.beginPath();
    centerGraphics.moveTo(208, 256);
    centerGraphics.lineTo(208, 110);
    centerGraphics.lineTo(236, 110);
    centerGraphics.lineTo(242, 256);
    centerGraphics.closePath();
    centerGraphics.fillPath();

    // Connecting Arch beam (x=176 to 208, y=110 to 135)
    centerGraphics.fillRect(176, 110, 32, 25);
    // Draw the arch curve at the top of the gateway
    centerGraphics.beginPath();
    centerGraphics.moveTo(176, 135);
    centerGraphics.lineTo(176, 150);
    centerGraphics.arc(192, 150, 16, Math.PI, 0, false); // Arched roof of the gate
    centerGraphics.lineTo(208, 135);
    centerGraphics.closePath();
    centerGraphics.fillPath();

    // 8.4 Right Flank Tower (x=236 to 296) - tallest, with tattered banner
    centerGraphics.beginPath();
    centerGraphics.moveTo(236, 256);
    centerGraphics.lineTo(246, 50); // sloped left wall
    // Battlements
    centerGraphics.lineTo(252, 50);
    centerGraphics.lineTo(252, 58);
    centerGraphics.lineTo(262, 58);
    centerGraphics.lineTo(262, 50);
    centerGraphics.lineTo(272, 50);
    centerGraphics.lineTo(272, 58);
    centerGraphics.lineTo(282, 58);
    centerGraphics.lineTo(282, 50);
    centerGraphics.lineTo(286, 50);
    centerGraphics.lineTo(296, 256); // sloped right wall
    centerGraphics.closePath();
    centerGraphics.fillPath();

    // Tattered Banner (hanging from right tower at x=266, y=58)
    centerGraphics.lineStyle(2, 0x080411, 1);
    centerGraphics.strokeLineShape(new Phaser.Geom.Line(266, 45, 266, 95));
    // Tattered Banner fabric path (hanging down, ripped at bottom)
    centerGraphics.beginPath();
    centerGraphics.moveTo(266, 60);
    centerGraphics.lineTo(280, 65);
    centerGraphics.lineTo(276, 85);
    centerGraphics.lineTo(266, 90); // torn tip
    centerGraphics.lineTo(258, 80);
    centerGraphics.closePath();
    centerGraphics.fillPath();

    // 8.5 Right Wall (x=290 to 384) - collapsed section leaving pile of rubble
    centerGraphics.beginPath();
    centerGraphics.moveTo(290, 256);
    centerGraphics.lineTo(290, 180);
    centerGraphics.lineTo(310, 180);
    centerGraphics.lineTo(320, 200); // crumbled wall notch
    centerGraphics.lineTo(340, 200);
    centerGraphics.lineTo(360, 256); // collapsed wall slope down to the ground
    centerGraphics.lineTo(384, 256);
    centerGraphics.closePath();
    centerGraphics.fillPath();

    // Rubble Pile at the base of collapsed right wall
    centerGraphics.fillEllipse(360, 246, 20, 10);
    centerGraphics.fillCircle(345, 250, 8);
    centerGraphics.fillCircle(375, 252, 6);

    // Add horizontal mortar line cuts to suggest stones
    centerGraphics.lineStyle(1.5, 0x05020a, 0.7);
    centerGraphics.strokeLineShape(new Phaser.Geom.Line(10, 200, 90, 200));
    centerGraphics.strokeLineShape(new Phaser.Geom.Line(150, 190, 174, 190));
    centerGraphics.strokeLineShape(new Phaser.Geom.Line(210, 190, 234, 190));
    centerGraphics.strokeLineShape(new Phaser.Geom.Line(300, 220, 340, 220));

    // Window slit cutouts (dark space)
    centerGraphics.fillStyle(0x05020a, 1);
    centerGraphics.fillRect(115, 110, 6, 16);
    centerGraphics.fillRect(258, 90, 6, 20);
    centerGraphics.fillRect(258, 140, 6, 20);

    centerGraphics.generateTexture('fortress-center', 384, 256);

    // 9. Castle Silhouette - Background distant ruins (512x256)
    const bgFortressGraphics = this.make.graphics();
    bgFortressGraphics.fillStyle(0x080411, 1);

    // Distant towers & walls
    // Tower 1 (Left, x=100, height y=90)
    bgFortressGraphics.beginPath();
    bgFortressGraphics.moveTo(85, 256);
    bgFortressGraphics.lineTo(95, 90);
    bgFortressGraphics.lineTo(115, 90);
    bgFortressGraphics.lineTo(125, 256);
    bgFortressGraphics.closePath();
    bgFortressGraphics.fillPath();

    // Tower 2 (Center-Right, x=280, height y=60)
    bgFortressGraphics.beginPath();
    bgFortressGraphics.moveTo(260, 256);
    bgFortressGraphics.lineTo(272, 60);
    bgFortressGraphics.lineTo(292, 60);
    bgFortressGraphics.lineTo(304, 256);
    bgFortressGraphics.closePath();
    bgFortressGraphics.fillPath();

    // Tower 3 (Right, x=420, height y=110)
    bgFortressGraphics.beginPath();
    bgFortressGraphics.moveTo(405, 256);
    bgFortressGraphics.lineTo(415, 110);
    bgFortressGraphics.lineTo(430, 110);
    bgFortressGraphics.lineTo(440, 256);
    bgFortressGraphics.closePath();
    bgFortressGraphics.fillPath();

    // Connecting walls (height y=160)
    bgFortressGraphics.fillRect(80, 160, 380, 96);
    bgFortressGraphics.generateTexture('fortress-bg', 512, 256);

    // 10. Castle Silhouette - Edge Left ruins (192x256)
    const edgeLeftGraphics = this.make.graphics();
    edgeLeftGraphics.fillStyle(0x080411, 1);
    // Crumbled watchtower on left edge
    edgeLeftGraphics.beginPath();
    edgeLeftGraphics.moveTo(0, 256);
    edgeLeftGraphics.lineTo(0, 70); // tall wall at edge
    edgeLeftGraphics.lineTo(20, 70);
    edgeLeftGraphics.lineTo(40, 110); // crumbled angle
    edgeLeftGraphics.lineTo(60, 110);
    edgeLeftGraphics.lineTo(80, 210); // crumbled wall
    edgeLeftGraphics.lineTo(120, 210);
    edgeLeftGraphics.lineTo(150, 256); // rubble pile
    edgeLeftGraphics.closePath();
    edgeLeftGraphics.fillPath();
    edgeLeftGraphics.generateTexture('ruins-edge-left', 192, 256);

    // 11. Castle Silhouette - Edge Right ruins (192x256)
    const edgeRightGraphics = this.make.graphics();
    edgeRightGraphics.fillStyle(0x080411, 1);
    // Crumbled wall on right edge
    edgeRightGraphics.beginPath();
    edgeRightGraphics.moveTo(192, 256);
    edgeRightGraphics.lineTo(192, 90);
    edgeRightGraphics.lineTo(160, 90);
    edgeRightGraphics.lineTo(140, 140); // crumbled wall slope
    edgeRightGraphics.lineTo(100, 140);
    edgeRightGraphics.lineTo(60, 256); // collapsed rubble slope
    edgeRightGraphics.closePath();
    edgeRightGraphics.fillPath();
    edgeRightGraphics.generateTexture('ruins-edge-right', 192, 256);

    // 12. Fantasy Button Plate (260x60)
    const plateGraphics = this.make.graphics();
    plateGraphics.fillStyle(0x000000, 0.45);
    plateGraphics.fillRoundedRect(4, 4, 252, 52, 8);
    plateGraphics.fillStyle(0x130f1e, 1);
    plateGraphics.fillRoundedRect(0, 0, 252, 52, 8);
    plateGraphics.lineStyle(2.5, 0xb45309, 1);
    plateGraphics.strokeRoundedRect(0, 0, 252, 52, 8);
    plateGraphics.lineStyle(1.5, 0xf59e0b, 0.4);
    plateGraphics.strokeRoundedRect(2, 2, 248, 48, 6);
    plateGraphics.fillStyle(0xd97706, 1);
    plateGraphics.fillCircle(8, 8, 3);
    plateGraphics.fillCircle(244, 8, 3);
    plateGraphics.fillCircle(8, 44, 3);
    plateGraphics.fillCircle(244, 44, 3);
    plateGraphics.fillStyle(0xfef08a, 0.8);
    plateGraphics.fillCircle(8, 8, 1);
    plateGraphics.fillCircle(244, 8, 1);
    plateGraphics.generateTexture('button-plate', 260, 60);

    // 13. Polished Knight Player Sprite 2x Larger (64x64) - Solid Black Backing for Outline
    const playerGraphics = this.make.graphics();
    // SOLID BLACK BACKING (Outline Silhouette)
    playerGraphics.fillStyle(0x000000, 1);
    playerGraphics.fillRect(18, 32, 28, 29); // Cape shadow
    playerGraphics.fillCircle(32, 42, 19); // Chestplate shadow
    playerGraphics.fillCircle(32, 20, 15); // Helmet shadow
    playerGraphics.fillRect(27, 0, 10, 12); // Plume shadow

    // Crimson Cape/Cloak
    playerGraphics.fillStyle(0x991b1b, 1);
    playerGraphics.fillRect(20, 34, 24, 26);
    playerGraphics.fillStyle(0xdc2626, 1);
    playerGraphics.fillRect(22, 34, 4, 26);
    playerGraphics.fillRect(38, 34, 4, 26);

    // Steel Shoulder Plates / Body Armor
    playerGraphics.fillStyle(0x334155, 1);
    playerGraphics.fillCircle(32, 42, 16);
    playerGraphics.fillStyle(0xb45309, 1); // Gold Chest Emblem
    playerGraphics.fillRect(29, 32, 6, 16);
    playerGraphics.fillRect(23, 37, 18, 6);

    // Helmet & Plume
    playerGraphics.fillStyle(0xb91c1c, 1); // Red knight plume
    playerGraphics.fillRect(29, 2, 6, 10);
    playerGraphics.fillStyle(0xef4444, 1);
    playerGraphics.fillRect(31, 2, 2, 8);

    playerGraphics.fillStyle(0x475569, 1); // Steel helmet
    playerGraphics.fillCircle(32, 20, 12);

    // Helmet Visor
    playerGraphics.fillStyle(0x0f172a, 1);
    playerGraphics.fillRoundedRect(20, 14, 24, 8, 3);
    playerGraphics.fillStyle(0x22d3ee, 1);
    playerGraphics.fillRect(23, 17, 18, 2);
    playerGraphics.generateTexture('player', 64, 64);

    // 14. High-Quality Cratered Moon Texture (128x128)
    const moonGraphics = this.make.graphics();
    moonGraphics.fillStyle(0xfffbeb, 1);
    moonGraphics.fillCircle(64, 64, 50);
    // Craters
    moonGraphics.fillStyle(0xe2d8b8, 0.75);
    moonGraphics.fillCircle(45, 52, 9);
    moonGraphics.lineStyle(1.5, 0xc2b58d, 0.8);
    moonGraphics.strokeCircle(45, 52, 9);
    moonGraphics.fillStyle(0xe2d8b8, 0.75);
    moonGraphics.fillCircle(75, 42, 13);
    moonGraphics.strokeCircle(75, 42, 13);
    moonGraphics.fillStyle(0xe2d8b8, 0.7);
    moonGraphics.fillCircle(55, 82, 7);
    moonGraphics.strokeCircle(55, 82, 7);
    moonGraphics.fillStyle(0xe2d8b8, 0.5);
    moonGraphics.fillCircle(78, 76, 5);
    moonGraphics.fillCircle(38, 74, 4);
    moonGraphics.fillCircle(90, 58, 4);
    moonGraphics.generateTexture('moon', 128, 128);

    // 15. Green Leaf Particle (8x8)
    const leafGraphics = this.make.graphics();
    leafGraphics.fillStyle(0x047857, 0.85);
    leafGraphics.fillTriangle(4, 0, 1, 6, 7, 6);
    leafGraphics.fillStyle(0x10b981, 0.9);
    leafGraphics.fillTriangle(4, 1, 2, 5, 6, 5);
    leafGraphics.generateTexture('leaf', 8, 8);

    // 16. World Landmark: Ruined Shrine (128x128) - With black backing outlines
    const shrineGraphics = this.make.graphics();
    shrineGraphics.fillStyle(0x000000, 1);
    shrineGraphics.fillRoundedRect(6, 90, 116, 28, 6);
    shrineGraphics.fillRect(22, 78, 84, 14);
    shrineGraphics.fillRect(16, 22, 20, 60);
    shrineGraphics.fillRect(92, 10, 20, 72);
    shrineGraphics.fillRect(52, 66, 24, 26);
    shrineGraphics.fillCircle(64, 52, 14);

    // Platform
    shrineGraphics.fillStyle(0x1e293b, 1);
    shrineGraphics.fillRoundedRect(8, 92, 112, 24, 4);
    shrineGraphics.fillStyle(0x334155, 1);
    shrineGraphics.fillRoundedRect(8, 92, 112, 22, 4);

    // Steps
    shrineGraphics.fillStyle(0x475569, 1);
    shrineGraphics.fillRect(24, 80, 80, 12);

    // Left broken column
    shrineGraphics.fillStyle(0x334155, 1);
    shrineGraphics.fillRect(18, 24, 16, 56);
    shrineGraphics.fillStyle(0x475569, 1);
    shrineGraphics.fillRect(18, 24, 16, 56);
    shrineGraphics.fillStyle(0x121813, 1); // Grass color
    shrineGraphics.fillTriangle(18, 24, 18, 36, 26, 24);
    shrineGraphics.fillTriangle(34, 24, 34, 32, 28, 24);

    // Right column
    shrineGraphics.fillStyle(0x475569, 1);
    shrineGraphics.fillRect(94, 12, 16, 68);
    shrineGraphics.fillStyle(0x121813, 1);
    shrineGraphics.fillTriangle(94, 12, 94, 20, 102, 12);

    // Pedestal
    shrineGraphics.fillStyle(0x334155, 1);
    shrineGraphics.fillRect(54, 68, 20, 24);

    // Magic crystal
    shrineGraphics.fillStyle(0x22d3ee, 0.45);
    shrineGraphics.fillCircle(64, 52, 12);
    shrineGraphics.fillStyle(0x22d3ee, 1);
    shrineGraphics.fillTriangle(64, 44, 58, 54, 70, 54);
    shrineGraphics.fillTriangle(64, 60, 58, 50, 70, 50);

    // Vines
    shrineGraphics.lineStyle(2.5, 0x166534, 0.85);
    shrineGraphics.beginPath();
    shrineGraphics.moveTo(18, 76);
    shrineGraphics.lineTo(26, 60);
    shrineGraphics.lineTo(20, 48);
    shrineGraphics.lineTo(34, 36);
    shrineGraphics.strokePath();

    shrineGraphics.generateTexture('shrine', 128, 128);

    console.log('BootScene: Textures generated. Launching MainMenuScene...');
    this.scene.start('MainMenuScene');
  }
}
