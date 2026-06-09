import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    console.log('BootScene: Creating high-quality polished textures...');

    // 1. Earthy Soil Floor Tile (64x64) - Seamless, subtle color variations, no grid lines
    const grassGraphics = this.make.graphics();
    // Base Soil Color: Rich dark earthy brown
    grassGraphics.fillStyle(0x3a291e, 1);
    grassGraphics.fillRect(0, 0, 64, 64);
    
    // Soft subtle brown color variations for soil texture (low contrast so it repeats seamlessly)
    grassGraphics.fillStyle(0x2f2118, 0.35); // Darker soil patch
    grassGraphics.fillCircle(18, 18, 14);
    grassGraphics.fillStyle(0x443023, 0.25); // Lighter soil patch
    grassGraphics.fillCircle(46, 46, 16);
    
    // Very subtle soil specks (low contrast)
    grassGraphics.fillStyle(0x2f2118, 0.4);
    grassGraphics.fillRect(12, 14, 2, 2);
    grassGraphics.fillRect(40, 42, 2, 2);
    grassGraphics.fillRect(24, 30, 2, 2);
    grassGraphics.generateTexture('grass', 64, 64);

    // 1b. Moss Clump Texture (64x64) - Drawn as a separate transparent sprite to overlay randomly
    const mossGraphics = this.make.graphics();
    mossGraphics.fillStyle(0x2d3a22, 0.8); // Deep mossy green base
    mossGraphics.fillCircle(32, 32, 16);
    mossGraphics.fillCircle(24, 28, 11);
    mossGraphics.fillCircle(40, 36, 13);
    mossGraphics.fillCircle(30, 42, 9);
    
    mossGraphics.fillStyle(0x3e512f, 0.85); // Mid mossy green
    mossGraphics.fillCircle(32, 32, 11);
    mossGraphics.fillCircle(25, 29, 7);
    mossGraphics.fillCircle(38, 35, 8);
    
    mossGraphics.fillStyle(0x526b3e, 0.9); // Lighter moss highlight
    mossGraphics.fillCircle(32, 32, 5);
    mossGraphics.fillCircle(26, 29, 3);
    mossGraphics.fillCircle(37, 34, 4);
    
    // Add small specks of moss around the main clump
    mossGraphics.fillStyle(0x2d3a22, 0.6);
    mossGraphics.fillCircle(14, 22, 3);
    mossGraphics.fillCircle(46, 46, 3);
    mossGraphics.fillStyle(0x3e512f, 0.7);
    mossGraphics.fillCircle(15, 21, 1.5);
    mossGraphics.fillCircle(47, 45, 1.5);
    mossGraphics.generateTexture('moss', 64, 64);

    // 1c. Small Moss Clump Texture (32x32)
    const mossSmallGraphics = this.make.graphics();
    mossSmallGraphics.fillStyle(0x2d3a22, 0.8);
    mossSmallGraphics.fillCircle(16, 16, 8);
    mossSmallGraphics.fillCircle(12, 12, 6);
    mossSmallGraphics.fillCircle(20, 18, 5);
    
    mossSmallGraphics.fillStyle(0x3e512f, 0.85);
    mossSmallGraphics.fillCircle(16, 16, 5);
    mossSmallGraphics.fillCircle(13, 13, 3);
    
    mossSmallGraphics.fillStyle(0x526b3e, 0.9);
    mossSmallGraphics.fillCircle(16, 16, 2);
    mossSmallGraphics.generateTexture('moss-small', 32, 32);

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

    // 4. Polished Tree (64x64) - Stylized Chiseled Pine/Spruce Tree
    const treeGraphics = this.make.graphics();

    const drawTreePoly = (points: number[], color: number) => {
      treeGraphics.fillStyle(color, 1);
      treeGraphics.beginPath();
      treeGraphics.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) {
        treeGraphics.lineTo(points[i], points[i+1]);
      }
      treeGraphics.closePath();
      treeGraphics.fillPath();
    };

    // 4.1 Root Shadow
    treeGraphics.fillStyle(0x190e0a, 0.4);
    treeGraphics.fillEllipse(32, 62, 16, 4);

    // 4.2 Trunk (Simple vertical tapered shape)
    drawTreePoly([28, 64, 30, 42, 34, 42, 36, 64], 0x2d1910); // Main trunk
    drawTreePoly([32, 64, 34, 42, 36, 64], 0x190e0a); // Trunk shadow right side
    drawTreePoly([28, 64, 30, 42, 32, 64], 0x5c3c2e); // Trunk highlight left side

    // 4.3 Pine Foliage Layers (3 overlapping triangular layers, split-shaded)
    const colLight = 0x059669;  // Mid-light emerald green
    const colDark = 0x047857;   // Mid-dark forest green
    const colHigh = 0x34d399;   // Bright mint green for left edge highlight
    const colShadow = 0x022c22; // Deep dark shadow for bottom edge

    // Layer 1 (Bottom, largest)
    drawTreePoly([32, 34, 10, 52, 32, 46], colLight); // Left half
    drawTreePoly([32, 34, 32, 46, 54, 52], colDark);  // Right half
    treeGraphics.lineStyle(1.5, colHigh, 0.85);
    treeGraphics.strokeLineShape(new Phaser.Geom.Line(10, 52, 32, 34)); // Left edge highlight
    treeGraphics.lineStyle(1.5, colShadow, 0.9);
    treeGraphics.strokeLineShape(new Phaser.Geom.Line(10, 52, 32, 46)); // Bottom-left shadow
    treeGraphics.strokeLineShape(new Phaser.Geom.Line(54, 52, 32, 46)); // Bottom-right shadow

    // Layer 2 (Middle)
    drawTreePoly([32, 22, 14, 38, 32, 32], colLight); // Left half
    drawTreePoly([32, 22, 32, 32, 50, 38], colDark);  // Right half
    treeGraphics.lineStyle(1.5, colHigh, 0.85);
    treeGraphics.strokeLineShape(new Phaser.Geom.Line(14, 38, 32, 22)); // Left edge highlight
    treeGraphics.lineStyle(1.5, colShadow, 0.9);
    treeGraphics.strokeLineShape(new Phaser.Geom.Line(14, 38, 32, 32)); // Bottom-left shadow
    treeGraphics.strokeLineShape(new Phaser.Geom.Line(50, 38, 32, 32)); // Bottom-right shadow

    // Layer 3 (Top, smallest)
    drawTreePoly([32, 8, 18, 24, 32, 18], colLight); // Left half
    drawTreePoly([32, 8, 32, 18, 46, 24], colDark);  // Right half
    treeGraphics.lineStyle(1.5, colHigh, 0.85);
    treeGraphics.strokeLineShape(new Phaser.Geom.Line(18, 24, 32, 8));  // Left edge highlight
    treeGraphics.lineStyle(1.5, colShadow, 0.9);
    treeGraphics.strokeLineShape(new Phaser.Geom.Line(18, 24, 32, 18)); // Bottom-left shadow
    treeGraphics.strokeLineShape(new Phaser.Geom.Line(46, 24, 32, 18)); // Bottom-right shadow

    treeGraphics.generateTexture('tree', 64, 64);

    // 5. Polished Rock with Chiseled Facets (64x64) - CoC-style faceted boulder
    const rockGraphics = this.make.graphics();

    // Helper function to draw a polygon
    const drawPoly = (points: number[], color: number) => {
      rockGraphics.fillStyle(color, 1);
      rockGraphics.beginPath();
      rockGraphics.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) {
        rockGraphics.lineTo(points[i], points[i+1]);
      }
      rockGraphics.closePath();
      rockGraphics.fillPath();
    };

    // 5.1 Bold dark backing (gives a crisp outline like Clash of Clans)
    rockGraphics.fillStyle(0x0a0f18, 1);
    rockGraphics.beginPath();
    rockGraphics.moveTo(10, 48);
    rockGraphics.lineTo(8, 30);
    rockGraphics.lineTo(20, 14);
    rockGraphics.lineTo(44, 12);
    rockGraphics.lineTo(56, 24);
    rockGraphics.lineTo(56, 46);
    rockGraphics.lineTo(38, 54);
    rockGraphics.lineTo(20, 54);
    rockGraphics.closePath();
    rockGraphics.fillPath();

    // 5.2 Draw the facets (shards of the chiseled stone)
    // Facet 1: Top highlight face
    drawPoly([21, 16, 34, 15, 28, 26, 18, 24], 0x94a3b8);
    
    // Facet 2: Top-Right highlight/midtone
    drawPoly([34, 15, 43, 14, 48, 24, 28, 26], 0x64748b);
    
    // Facet 3: Far-Right shadow
    drawPoly([43, 14, 54, 25, 44, 38, 48, 24], 0x334155);
    
    // Facet 4: Left highlight/midtone
    drawPoly([10, 31, 18, 24, 28, 26, 22, 38, 12, 44], 0x475569);
    
    // Facet 5: Center face/ledge
    drawPoly([28, 26, 48, 24, 44, 38, 22, 38], 0x64748b);
    
    // Facet 6: Bottom-Left shadow
    drawPoly([12, 44, 22, 38, 30, 48, 21, 52], 0x1e293b);
    
    // Facet 7: Bottom-Right deep shadow
    drawPoly([22, 38, 44, 38, 54, 45, 37, 52, 30, 48], 0x0f172a);

    // 5.3 Edge Highlights (adds crisp 3D depth to the ridges)
    rockGraphics.lineStyle(1.5, 0xe2e8f0, 0.7);
    rockGraphics.beginPath();
    rockGraphics.moveTo(21, 16);
    rockGraphics.lineTo(34, 15);
    rockGraphics.lineTo(43, 14);
    rockGraphics.strokePath();

    rockGraphics.beginPath();
    rockGraphics.moveTo(18, 24);
    rockGraphics.lineTo(28, 26);
    rockGraphics.lineTo(48, 24);
    rockGraphics.strokePath();

    rockGraphics.beginPath();
    rockGraphics.moveTo(10, 31);
    rockGraphics.lineTo(18, 24);
    rockGraphics.strokePath();

    rockGraphics.beginPath();
    rockGraphics.moveTo(28, 26);
    rockGraphics.lineTo(22, 38);
    rockGraphics.strokePath();

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

    // 7. Realistic Volumetric Clouds (256x128 soft organic structure)
    const cloudGraphics = this.make.graphics();
    const cloudNodes = [
      { cx: 128, cy: 70, r: 50, a: 0.05 },
      { cx: 88, cy: 74, r: 38, a: 0.045 },
      { cx: 168, cy: 74, r: 38, a: 0.045 },
      { cx: 128, cy: 48, r: 40, a: 0.05 },
      { cx: 52, cy: 78, r: 26, a: 0.04 },
      { cx: 204, cy: 78, r: 26, a: 0.04 },
      { cx: 104, cy: 52, r: 34, a: 0.045 },
      { cx: 152, cy: 52, r: 34, a: 0.045 },
    ];

    cloudNodes.forEach(node => {
      for (let r = node.r; r > 0; r -= 1.5) {
        const ratio = r / node.r;
        const alpha = node.a * Math.pow(1 - ratio, 1.6); // smooth gaussian-like falloff
        cloudGraphics.fillStyle(0xffffff, alpha);
        cloudGraphics.fillCircle(node.cx, node.cy, r);
      }
    });

    cloudGraphics.generateTexture('cloud', 256, 128);

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
    playerGraphics.fillRect(18, 32, 28, 20); // Cape shadow
    // Tapered chest outline
    playerGraphics.beginPath();
    playerGraphics.moveTo(23, 27);
    playerGraphics.lineTo(41, 27);
    playerGraphics.lineTo(47, 33);
    playerGraphics.lineTo(43, 51);
    playerGraphics.lineTo(21, 51);
    playerGraphics.lineTo(17, 33);
    playerGraphics.closePath();
    playerGraphics.fillPath();

    playerGraphics.fillCircle(32, 17, 14); // Helmet shadow
    playerGraphics.fillRect(29, 0, 6, 12); // Plume shadow
    playerGraphics.fillCircle(16, 32, 7.5); // Left shoulder shadow
    playerGraphics.fillCircle(48, 32, 7.5); // Right shoulder shadow
    playerGraphics.fillRoundedRect(20, 50, 10, 12, 3); // Left leg shadow
    playerGraphics.fillRoundedRect(34, 50, 10, 12, 3); // Right leg shadow

    // Crimson Cape/Cloak
    playerGraphics.fillStyle(0x991b1b, 1);
    playerGraphics.fillRect(18, 32, 28, 20);
    playerGraphics.fillStyle(0xdc2626, 1);
    playerGraphics.fillRect(20, 32, 3, 20);
    playerGraphics.fillRect(41, 32, 3, 20);

    // Steel Legs (greaves)
    playerGraphics.fillStyle(0x334155, 1); // Dark steel legs
    playerGraphics.fillRect(21, 51, 8, 10);
    playerGraphics.fillRect(35, 51, 8, 10);
    playerGraphics.fillStyle(0x475569, 1); // Lighter steel highlights
    playerGraphics.fillRect(22, 51, 6, 8);
    playerGraphics.fillRect(36, 51, 6, 8);
    playerGraphics.lineStyle(1, 0x1e293b, 1);
    playerGraphics.strokeRect(21, 51, 8, 10);
    playerGraphics.strokeRect(35, 51, 8, 10);

    // Torso / Tapered Chestplate
    playerGraphics.fillStyle(0x334155, 1); // Steel torso base
    playerGraphics.beginPath();
    playerGraphics.moveTo(24, 28);
    playerGraphics.lineTo(40, 28);
    playerGraphics.lineTo(46, 34);
    playerGraphics.lineTo(42, 50);
    playerGraphics.lineTo(22, 50);
    playerGraphics.lineTo(18, 34);
    playerGraphics.closePath();
    playerGraphics.fillPath();

    playerGraphics.fillStyle(0x475569, 1); // Chestplate highlight
    playerGraphics.beginPath();
    playerGraphics.moveTo(25, 29);
    playerGraphics.lineTo(39, 29);
    playerGraphics.lineTo(44, 34);
    playerGraphics.lineTo(41, 49);
    playerGraphics.lineTo(23, 49);
    playerGraphics.lineTo(20, 34);
    playerGraphics.closePath();
    playerGraphics.fillPath();

    playerGraphics.fillStyle(0x64748b, 1); // Shiny middle plate
    playerGraphics.beginPath();
    playerGraphics.moveTo(27, 30);
    playerGraphics.lineTo(37, 30);
    playerGraphics.lineTo(40, 34);
    playerGraphics.lineTo(38, 48);
    playerGraphics.lineTo(26, 48);
    playerGraphics.lineTo(24, 34);
    playerGraphics.closePath();
    playerGraphics.fillPath();

    playerGraphics.fillStyle(0x94a3b8, 1); // Central vertical shiny ridge
    playerGraphics.fillRect(30, 28, 4, 22);

    // Shoulder Pauldrons
    // Left shoulder plate
    playerGraphics.fillStyle(0x475569, 1);
    playerGraphics.fillCircle(16, 32, 5.5);
    playerGraphics.fillStyle(0x64748b, 1);
    playerGraphics.fillCircle(16, 32, 4.5);
    playerGraphics.fillStyle(0x94a3b8, 1);
    playerGraphics.fillCircle(15, 31, 2);

    // Right shoulder plate
    playerGraphics.fillStyle(0x475569, 1);
    playerGraphics.fillCircle(48, 32, 5.5);
    playerGraphics.fillStyle(0x64748b, 1);
    playerGraphics.fillCircle(48, 32, 4.5);
    playerGraphics.fillStyle(0x94a3b8, 1);
    playerGraphics.fillCircle(47, 31, 2);

    // Gold Shield/Crest Emblem in center (medieval coat of arms)
    playerGraphics.fillStyle(0xd97706, 1); // Dark gold border
    playerGraphics.beginPath();
    playerGraphics.moveTo(27, 35);
    playerGraphics.lineTo(37, 35);
    playerGraphics.lineTo(37, 41);
    playerGraphics.lineTo(32, 46); // Shield point
    playerGraphics.lineTo(27, 41);
    playerGraphics.closePath();
    playerGraphics.fillPath();

    playerGraphics.fillStyle(0xf59e0b, 1); // Light gold inside
    playerGraphics.beginPath();
    playerGraphics.moveTo(29, 37);
    playerGraphics.lineTo(35, 37);
    playerGraphics.lineTo(35, 40);
    playerGraphics.lineTo(32, 43);
    playerGraphics.lineTo(29, 40);
    playerGraphics.closePath();
    playerGraphics.fillPath();

    // Helmet & Plume
    playerGraphics.fillStyle(0xb91c1c, 1); // Red knight plume
    playerGraphics.fillRect(29, 0, 6, 10);
    playerGraphics.fillStyle(0xef4444, 1);
    playerGraphics.fillRect(31, 0, 2, 8);

    playerGraphics.fillStyle(0x475569, 1); // Steel helmet
    playerGraphics.fillCircle(32, 17, 11);
    playerGraphics.fillStyle(0x64748b, 1);
    playerGraphics.fillCircle(32, 17, 9);

    // Helmet Visor (glowing blue visor slit)
    playerGraphics.fillStyle(0x1e293b, 1); // Dark visor plate
    playerGraphics.fillRoundedRect(20, 12, 24, 10, 3);
    playerGraphics.fillStyle(0x0f172a, 1); // Dark visor slit
    playerGraphics.fillRect(22, 15, 20, 4);
    playerGraphics.fillStyle(0x22d3ee, 1); // Glowing cyan energy eye-slit
    playerGraphics.fillRect(24, 16, 16, 2);
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
    shrineGraphics.fillStyle(0x3a291e, 1); // Grass/Soil color
    shrineGraphics.fillTriangle(18, 24, 18, 36, 26, 24);
    shrineGraphics.fillTriangle(34, 24, 34, 32, 28, 24);

    // Right column
    shrineGraphics.fillStyle(0x475569, 1);
    shrineGraphics.fillRect(94, 12, 16, 68);
    shrineGraphics.fillStyle(0x3a291e, 1);
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

    // 17. Wood Log Item Icon (64x64)
    const woodIconGraphics = this.make.graphics();
    woodIconGraphics.fillStyle(0x0f0a05, 1); // Outline
    woodIconGraphics.fillRect(14, 22, 36, 20);
    woodIconGraphics.fillEllipse(14, 32, 8, 18);
    woodIconGraphics.fillEllipse(50, 32, 8, 18);
    woodIconGraphics.fillStyle(0x78350f, 1); // Bark
    woodIconGraphics.fillRect(16, 24, 32, 16);
    woodIconGraphics.fillStyle(0xd97706, 1); // End face right
    woodIconGraphics.fillEllipse(48, 32, 6, 16);
    woodIconGraphics.fillStyle(0xfef08a, 1); // End face left
    woodIconGraphics.fillEllipse(16, 32, 6, 16);
    woodIconGraphics.generateTexture('item-wood', 64, 64);

    // 18. Closed Chest (64x64)
    const chestClosed = this.make.graphics();
    chestClosed.fillStyle(0x0a0705, 1); // Outline
    chestClosed.fillRect(10, 20, 44, 36);
    chestClosed.fillStyle(0x78350f, 1); // Base wood
    chestClosed.fillRect(12, 22, 40, 32);
    chestClosed.fillStyle(0x475569, 1); // Steel bands
    chestClosed.fillRect(18, 22, 6, 32);
    chestClosed.fillRect(40, 22, 6, 32);
    chestClosed.fillStyle(0xd97706, 1); // Golden lock
    chestClosed.fillRect(28, 32, 8, 8);
    chestClosed.fillStyle(0x0f0c1b, 1); // Keyhole
    chestClosed.fillRect(31, 35, 2, 4);
    chestClosed.generateTexture('chest-closed', 64, 64);

    // 19. Open Chest (64x64)
    const chestOpen = this.make.graphics();
    chestOpen.fillStyle(0x0a0705, 1); // Outline
    chestOpen.fillRect(10, 10, 44, 46);
    chestOpen.fillStyle(0x78350f, 1); // Base wood
    chestOpen.fillRect(12, 34, 40, 20); // Lower body
    chestOpen.fillRect(12, 12, 40, 16); // Lifted lid
    chestOpen.fillStyle(0x0f0c1b, 1); // Inside dark slot
    chestOpen.fillRect(14, 28, 36, 6);
    chestOpen.fillStyle(0x475569, 1); // Steel bands lower
    chestOpen.fillRect(18, 34, 6, 20);
    chestOpen.fillRect(40, 34, 6, 20);
    chestOpen.fillStyle(0x4b5563, 1); // Steel bands upper lid
    chestOpen.fillRect(18, 12, 6, 16);
    chestOpen.fillRect(40, 12, 6, 16);
    chestOpen.fillStyle(0xd97706, 1); // Golden lock latch hanging down
    chestOpen.fillRect(28, 26, 8, 6);
    chestOpen.generateTexture('chest-open', 64, 64);

    // 20. Campfire Base Logs (64x64)
    const campfireBase = this.make.graphics();
    campfireBase.fillStyle(0x475569, 0.6); // Ash ring
    campfireBase.fillCircle(32, 40, 22);
    campfireBase.fillStyle(0x0a0705, 1); // Outline for logs
    campfireBase.fillRect(16, 32, 32, 10);
    campfireBase.fillRect(26, 22, 10, 32);
    campfireBase.fillStyle(0x78350f, 1); // Cross log 1
    campfireBase.fillRect(18, 34, 28, 6);
    campfireBase.fillStyle(0x5c240b, 1); // Cross log 2
    campfireBase.fillRect(28, 24, 6, 28);
    campfireBase.generateTexture('campfire-base', 64, 64);

    // 21. Fire Particle (32x32 soft glow)
    const fireParticle = this.make.graphics();
    fireParticle.fillStyle(0xffffff, 1.0);
    fireParticle.fillCircle(16, 16, 4);
    fireParticle.fillStyle(0xffffff, 0.5);
    fireParticle.fillCircle(16, 16, 8);
    fireParticle.fillStyle(0xffffff, 0.2);
    fireParticle.fillCircle(16, 16, 16);
    fireParticle.generateTexture('fire-particle', 32, 32);

    // 22. Smoke Particle (32x32 soft cloud puff)
    const smokeParticle = this.make.graphics();
    smokeParticle.fillStyle(0xffffff, 0.5);
    smokeParticle.fillCircle(16, 16, 6);
    smokeParticle.fillStyle(0xffffff, 0.25);
    smokeParticle.fillCircle(16, 16, 12);
    smokeParticle.fillStyle(0xffffff, 0.1);
    smokeParticle.fillCircle(16, 16, 16);
    smokeParticle.generateTexture('smoke-particle', 32, 32);

    // 23. Spark Particle (8x8 sharp dot)
    const sparkParticle = this.make.graphics();
    sparkParticle.fillStyle(0xffffff, 1.0);
    sparkParticle.fillCircle(4, 4, 1.5);
    sparkParticle.fillStyle(0xffffff, 0.4);
    sparkParticle.fillCircle(4, 4, 3);
    sparkParticle.generateTexture('spark-particle', 8, 8);

    // 24. Campfire Glow (160x160 soft radial light gradient)
    const campfireGlow = this.make.graphics();
    const glowRadius = 80;
    for (let r = glowRadius; r > 0; r -= 2) {
      const ratio = r / glowRadius;
      const alpha = 0.22 * (1 - ratio); // Linear falloff for wider, softer glow
      campfireGlow.fillStyle(0xd97706, alpha);
      campfireGlow.fillCircle(80, 80, r);
    }
    campfireGlow.generateTexture('campfire-glow', 160, 160);

    // 25. Item: Rusty Sword (64x64)
    const rustySword = this.make.graphics();
    rustySword.fillStyle(0x451a03, 1); // Brown handle
    rustySword.fillRect(30, 42, 4, 14);
    rustySword.fillStyle(0xd97706, 1); // Golden guard
    rustySword.fillRect(22, 40, 20, 4);
    rustySword.fillStyle(0xbababa, 1); // Steel blade
    rustySword.beginPath();
    rustySword.moveTo(29, 40);
    rustySword.lineTo(29, 10);
    rustySword.lineTo(32, 6); // Point
    rustySword.lineTo(35, 10);
    rustySword.lineTo(35, 40);
    rustySword.closePath();
    rustySword.fillPath();
    rustySword.fillStyle(0x92400e, 0.7); // Rust
    rustySword.fillRect(30, 16, 3, 4);
    rustySword.fillRect(31, 30, 3, 5);
    rustySword.generateTexture('item-rusty-sword', 64, 64);

    // 26. Item: Traveler Hood (64x64)
    const travelerHood = this.make.graphics();
    travelerHood.fillStyle(0x312e81, 1); // Dark indigo hood
    travelerHood.beginPath();
    travelerHood.moveTo(32, 12);
    travelerHood.lineTo(16, 30);
    travelerHood.lineTo(14, 52);
    travelerHood.lineTo(50, 52);
    travelerHood.lineTo(48, 30);
    travelerHood.closePath();
    travelerHood.fillPath();
    travelerHood.fillStyle(0x0f0c1b, 1); // Face shadow opening
    travelerHood.fillEllipse(32, 34, 12, 16);
    travelerHood.lineStyle(1.5, 0x4f46e5, 0.8); // Folds
    travelerHood.beginPath();
    travelerHood.moveTo(32, 12);
    travelerHood.lineTo(24, 28);
    travelerHood.lineTo(18, 48);
    travelerHood.strokePath();
    travelerHood.generateTexture('item-traveler-hood', 64, 64);

    // 27. Item: Worn Leather Armor (64x64)
    const wornLeather = this.make.graphics();
    wornLeather.fillStyle(0x5c240b, 1); // Dark brown leather vest
    wornLeather.fillRoundedRect(16, 16, 32, 36, 4);
    wornLeather.fillStyle(0x451a03, 1); // Shoulder straps
    wornLeather.fillRect(16, 16, 8, 14);
    wornLeather.fillRect(40, 16, 8, 14);
    wornLeather.fillStyle(0x0f0c1b, 1); // Neck opening
    wornLeather.fillEllipse(32, 16, 8, 6);
    wornLeather.fillStyle(0x94a3b8, 1); // Rivets
    wornLeather.fillCircle(20, 24, 2);
    wornLeather.fillCircle(44, 24, 2);
    wornLeather.fillCircle(20, 36, 2);
    wornLeather.fillCircle(44, 36, 2);
    wornLeather.lineStyle(1.5, 0xb45309, 0.8); // Scuffs
    wornLeather.beginPath();
    wornLeather.moveTo(24, 30);
    wornLeather.lineTo(30, 34);
    wornLeather.moveTo(38, 40);
    wornLeather.lineTo(42, 42);
    wornLeather.strokePath();
    wornLeather.generateTexture('item-worn-leather-armor', 64, 64);

    // 28. Item: Old Boots (64x64)
    const oldBoots = this.make.graphics();
    oldBoots.fillStyle(0x2d1202, 1); // Dark scuffed brown
    oldBoots.fillRoundedRect(18, 22, 10, 26, 2);
    oldBoots.fillRect(18, 40, 16, 8); // Sole
    oldBoots.fillRoundedRect(36, 22, 10, 26, 2);
    oldBoots.fillRect(30, 40, 16, 8); // Sole
    oldBoots.lineStyle(1, 0x78350f, 0.9); // Laces
    oldBoots.beginPath();
    oldBoots.moveTo(18, 28);
    oldBoots.lineTo(28, 28);
    oldBoots.moveTo(18, 34);
    oldBoots.lineTo(28, 34);
    oldBoots.moveTo(36, 28);
    oldBoots.lineTo(46, 28);
    oldBoots.moveTo(36, 34);
    oldBoots.lineTo(46, 34);
    oldBoots.strokePath();
    oldBoots.generateTexture('item-old-boots', 64, 64);

    // 29. Item: Leather Armor (64x64)
    const leatherArmor = this.make.graphics();
    leatherArmor.fillStyle(0x78350f, 1); // Clean medium brown vest
    leatherArmor.fillRoundedRect(16, 16, 32, 36, 4);
    leatherArmor.fillStyle(0x5c240b, 1); // Straps
    leatherArmor.fillRect(16, 16, 8, 14);
    leatherArmor.fillRect(40, 16, 8, 14);
    leatherArmor.fillStyle(0x0f0c1b, 1); // Neck
    leatherArmor.fillEllipse(32, 16, 8, 6);
    leatherArmor.fillStyle(0xf59e0b, 1); // Buckles
    leatherArmor.fillCircle(20, 24, 2);
    leatherArmor.fillCircle(44, 24, 2);
    leatherArmor.generateTexture('item-leather-armor', 64, 64);

    // 30. Backpack Icon (48x48)
    const invIconGraphics = this.make.graphics();
    invIconGraphics.fillStyle(0x0a0705, 1); // Solid outline
    invIconGraphics.fillRoundedRect(6, 6, 36, 36, 6);
    invIconGraphics.fillStyle(0x78350f, 1); // Main bag body
    invIconGraphics.fillRoundedRect(8, 10, 32, 30, 4);
    invIconGraphics.fillStyle(0x451a03, 1); // Top flap
    invIconGraphics.fillRoundedRect(10, 8, 28, 16, 4);
    invIconGraphics.fillStyle(0x1e1b4b, 1); // Straps
    invIconGraphics.fillRect(16, 14, 4, 24);
    invIconGraphics.fillRect(28, 14, 4, 24);
    invIconGraphics.fillStyle(0xd97706, 1); // Buckles
    invIconGraphics.fillRect(15, 26, 6, 5);
    invIconGraphics.fillRect(27, 26, 6, 5);
    invIconGraphics.fillStyle(0xf59e0b, 1);
    invIconGraphics.fillRect(16, 27, 4, 3);
    invIconGraphics.generateTexture('icon-inventory', 48, 48);

    // 31. Character Profile Icon (48x48)
    const charIconGraphics = this.make.graphics();
    charIconGraphics.fillStyle(0x000000, 1); // Outline
    charIconGraphics.fillCircle(24, 26, 15);
    charIconGraphics.fillRect(20, 4, 8, 10);
    charIconGraphics.fillStyle(0xb91c1c, 1); // Plume
    charIconGraphics.fillRect(21, 5, 6, 10);
    charIconGraphics.fillStyle(0xef4444, 1);
    charIconGraphics.fillRect(23, 5, 2, 8);
    charIconGraphics.fillStyle(0x475569, 1); // Helmet
    charIconGraphics.fillCircle(24, 26, 12);
    charIconGraphics.fillStyle(0x64748b, 1);
    charIconGraphics.fillCircle(24, 26, 10);
    charIconGraphics.fillStyle(0x94a3b8, 1); // Shine
    charIconGraphics.fillCircle(22, 24, 5);
    charIconGraphics.fillStyle(0x0f172a, 1); // Visor Slit
    charIconGraphics.fillRoundedRect(14, 22, 20, 8, 3);
    charIconGraphics.fillStyle(0x22d3ee, 1); // Glowing energy
    charIconGraphics.fillRect(16, 25, 16, 2);
    charIconGraphics.generateTexture('icon-character', 48, 48);

    // ==========================================
    // CHARACTER-FIT OVERLAY GRAPHICS (64x64)
    // ==========================================

    // 1. Helmet Overlay: Traveler Hood (Indigo cowl framing the head at y = 15, covering the plume and showing glowing eyes in shadow)
    const travelerHoodChar = this.make.graphics();
    
    // Outline (Silhouettes)
    travelerHoodChar.fillStyle(0x000000, 1);
    travelerHoodChar.fillCircle(32, 15, 15); // Rounded top outline covering plume
    travelerHoodChar.fillRoundedRect(17, 19, 30, 12, 4); // Soft shoulder drape outline

    // Hood fabric base
    travelerHoodChar.fillStyle(0x312e81, 1); // Dark indigo hood base
    travelerHoodChar.fillCircle(32, 15, 13); // Rounded top head
    travelerHoodChar.fillRoundedRect(19, 20, 26, 10, 3); // Soft shoulder drape

    // Folds & Highlights
    travelerHoodChar.fillStyle(0x4338ca, 1); // Lighter folds
    travelerHoodChar.fillRect(19, 21, 3, 8);
    travelerHoodChar.fillRect(42, 21, 3, 8);

    // Dark face opening shadow
    travelerHoodChar.fillStyle(0x0f0c1b, 1);
    travelerHoodChar.fillRoundedRect(21, 9, 22, 11, 3);

    // Glowing cyan visor energy slit (only eyes visible in dark cowl)
    travelerHoodChar.fillStyle(0x22d3ee, 1);
    travelerHoodChar.fillRect(24, 14, 16, 2);
    travelerHoodChar.generateTexture('char-helmet-traveler_hood', 64, 64);

    // 2. Chest Overlay: Worn Leather Armor (Stylized leather harness straps & belt wrapping the tapered torso)
    const wornLeatherChar = this.make.graphics();
    wornLeatherChar.fillStyle(0x000000, 1); // Outline for straps
    wornLeatherChar.fillRect(21, 28, 7, 22); // Left strap outline
    wornLeatherChar.fillRect(36, 28, 7, 22); // Right strap outline
    wornLeatherChar.fillRect(19, 42, 26, 7);  // Waist belt outline

    wornLeatherChar.fillStyle(0x5c240b, 1); // Dark brown leather straps
    wornLeatherChar.fillRect(22, 28, 5, 22);
    wornLeatherChar.fillRect(37, 28, 5, 22);
    wornLeatherChar.fillRect(20, 43, 24, 5);  // Waist belt

    wornLeatherChar.fillStyle(0xd97706, 1); // Bronze buckles/rivets at intersections
    wornLeatherChar.fillRect(21, 42, 7, 7);
    wornLeatherChar.fillRect(36, 42, 7, 7);
    wornLeatherChar.fillStyle(0xf59e0b, 1);
    wornLeatherChar.fillRect(23, 44, 3, 3);
    wornLeatherChar.fillRect(38, 44, 3, 3);
    wornLeatherChar.generateTexture('char-chest-worn_leather_armor', 64, 64);

    // 3. Chest Overlay: Leather Armor (Clean tan leather harness straps & belt wrapping the tapered torso)
    const leatherArmorChar = this.make.graphics();
    leatherArmorChar.fillStyle(0x000000, 1); // Outline
    leatherArmorChar.fillRect(21, 28, 7, 22);
    leatherArmorChar.fillRect(36, 28, 7, 22);
    leatherArmorChar.fillRect(19, 42, 26, 7);

    leatherArmorChar.fillStyle(0x78350f, 1); // Tan leather straps
    leatherArmorChar.fillRect(22, 28, 5, 22);
    leatherArmorChar.fillRect(37, 28, 5, 22);
    leatherArmorChar.fillRect(20, 43, 24, 5);

    leatherArmorChar.fillStyle(0xf59e0b, 1); // Gold buckles
    leatherArmorChar.fillRect(21, 42, 7, 7);
    leatherArmorChar.fillRect(36, 42, 7, 7);
    leatherArmorChar.generateTexture('char-chest-leather_armor', 64, 64);

    // 4. Boots Overlay: Old Boots (Fitted onto the greaves at the bottom)
    const oldBootsChar = this.make.graphics();
    oldBootsChar.fillStyle(0x000000, 1); // Outline
    oldBootsChar.fillRoundedRect(20, 54, 10, 8, 2);
    oldBootsChar.fillRoundedRect(34, 54, 10, 8, 2);

    oldBootsChar.fillStyle(0x2d1202, 1); // Dark brown boots wrapping the steel greaves
    oldBootsChar.fillRoundedRect(21, 55, 8, 6, 1);
    oldBootsChar.fillRoundedRect(35, 55, 8, 6, 1);

    oldBootsChar.fillStyle(0x1c0a00, 1); // Sole base
    oldBootsChar.fillRect(20, 60, 10, 2);
    oldBootsChar.fillRect(34, 60, 10, 2);
    oldBootsChar.generateTexture('char-boots-old_boots', 64, 64);

    console.log('BootScene: Textures generated. Launching MainMenuScene...');
    this.scene.start('MainMenuScene');
  }
}
