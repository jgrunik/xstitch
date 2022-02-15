import { graphics } from './pixi.js'
import { stitchChart, colorLookup } from './index.js';
import { width, height } from './settings.js';
import { x, y } from './pan.js';
import { zoom } from './zoom.js';
import { slice2D } from "./utilities.js";

export function startDrawLoop() { window.requestAnimationFrame(drawLoop); }

let willRedraw = true;
export function queueRedraw() { willRedraw = true; }

function drawLoop() {
  if (willRedraw) {
    draw();
    willRedraw = false;
  }

  // continues the draw loop indefinitely
  window.requestAnimationFrame(drawLoop);
}

function draw() {
  graphics.clear()
  const subsection = slice2D(stitchChart, x, y, width / zoom, height / zoom);
  drawStitchChart(subsection, zoom);
}

function drawStitchChart(stitchChart, scale) {
  for (const rowIndex in stitchChart)
    for (const columnIndex in stitchChart[rowIndex]) {
      const color = colorLookup[stitchChart[rowIndex][columnIndex]];
      drawSquare(color, columnIndex * scale, rowIndex * scale, scale, scale);
    }
}

function drawSquare(color, x, y, width, height) {
  graphics.beginFill(color);
  graphics.drawRect(x, y, width, height);
  graphics.endFill();
}