import Phaser from 'phaser';
import { GAME_CONFIG } from './config';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { WorldScene } from './scenes/WorldScene';

// Merge configuration with our scene registration order
const config: Phaser.Types.Core.GameConfig = {
  ...GAME_CONFIG,
  scene: [BootScene, MainMenuScene, WorldScene],
};

// Start the game instance once assets and libraries are loaded
window.addEventListener('load', () => {
  console.log('Starting Kingdoms of Ruin Phaser Client...');
  new Phaser.Game(config);
});
