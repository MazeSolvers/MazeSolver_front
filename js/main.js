import { Game } from './game.js';

document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("gameContainer");
    const game = new Game(gameContainer);
    game.init();
    game.animate();
});
