import Phaser from 'phaser';
import { Game } from './scenes/game';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: Game,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
};

const game = new Phaser.Game(config);
