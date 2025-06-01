import { Game as MainGame } from './scenes/Game';
import { AUTO, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        MainGame,
    ],
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            // debug: true,
            roundPixels: true
        }
    }
};

const StartGame = (parent) => {
    console.log('Starting game');
    return new Game({ ...config, parent });
}

export default StartGame;

