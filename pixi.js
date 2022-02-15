import { width, height } from './settings.js'

export const app = new PIXI.Application({ width, height });
document.getElementById("canvas_placeholder").replaceWith(app.view);

export const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);