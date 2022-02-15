import jupiterData from "./jupiter-data.js";
import { app } from './pixi.js'
import { panLeft, panRight, panUp, panDown, panDrag } from "./pan.js";
import { zoom, zoomIn, zoomOut } from "./zoom.js"
import { readFileAsync } from './file.js'
import { queueRedraw, startDrawLoop } from './draw.js'


// Handle preloaded data
export let stitchChart = jupiterData.stitchChart;
export let colorLookup = jupiterData.LUT.map(({ color }) => color);


// Handle Panning - Buttons 
[
  ["pan_left", panLeft],
  ["pan_right", panRight],
  ["pan_up", panUp],
  ["pan_down", panDown],
].forEach(([id, callbackFn]) => addButtonEvent(id, callbackFn))

function addButtonEvent(id, callbackFn) {
  document.getElementById(id).addEventListener('click', callbackFn)
}

// Handle Panning - Mouse Drag
app.view.addEventListener("mousedown", () => {
  document.body.addEventListener("mousemove", panDrag);
});

// mousemove event caters for release out of window
document.body.addEventListener("mousemove", ({ buttons }) => {
  if (buttons != 1) // left mouse button
    document.body.removeEventListener("mousemove", panDrag);
});


// Handle Zooming
const zoomInButton = document.getElementById("zoom_in");
const zoomOutButton = document.getElementById("zoom_out");
const zoomText = document.getElementById("zoom_text");

zoomInButton.addEventListener('click', zoomIn)
zoomOutButton.addEventListener('click', zoomOut)

addEventListener('zoom::change', updateZoomText)
function updateZoomText() { zoomText.innerText = 'x' + zoom; }


// Handle File Input
const fileInput = document.getElementById("csv");

fileInput.addEventListener('change', loadStitchChart);

async function loadStitchChart() {
  const result = await readFileAsync(fileInput.files[0]);
  stitchChart = result.split("\n").map(row => row.split(","));
  dispatchEvent(new Event('stitchChart::change'));
}


// Handle Drawing
startDrawLoop();

addEventListener('stitchChart::change', queueRedraw);
addEventListener("pan::change", queueRedraw);
addEventListener('zoom::change', queueRedraw);