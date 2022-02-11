const width = 500, height = 500;

// Initialise PIXI
let app = new PIXI.Application({ width, height });
document.getElementById("canvas_placeholder").replaceWith(app.view);

const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);


let stitchChart = []; // 2d array of colour indices

// Handle Color
const numberOfColors = 73;
let ColorLookup = generateColorLookup(randomHex);

function generateColorLookup(colorTheme) {
  return Array.from({ length: numberOfColors }).map(colorTheme);
}

function randomHex() { return Math.floor(0x1000000 * Math.random()); }
function spectrum(e, i, { length }) { return 0xFFFFFF / length * i; }

const colorsRandomButton = document.getElementById("colors_random");
const colorsSpectrumButton = document.getElementById("colors_spectrum");

colorsRandomButton.addEventListener('click', () => setColorTheme(randomHex));
colorsSpectrumButton.addEventListener('click', () => setColorTheme(spectrum));

function setColorTheme(theme) {
  ColorLookup = generateColorLookup(theme);
  dispatchEvent(new Event("ColorLookup::change"));
}

// Handle Panning
let x = 0, y = 0;

const panLeftButton = document.getElementById("pan_left");
const panRightButton = document.getElementById("pan_right");
const panUpButton = document.getElementById("pan_up");
const panDownButton = document.getElementById("pan_down");

panLeftButton.addEventListener('click', panLeft);
panRightButton.addEventListener('click', panRight);
panUpButton.addEventListener('click', panUp);
panDownButton.addEventListener('click', panDown);

function panLeft() {
  x = Math.max(x - width / zoom, 0);
  dispatchEvent(new Event("pan::change"));
}

function panRight() {
  x = Math.min(x + width / zoom, width - width / zoom);
  dispatchEvent(new Event("pan::change"));
}

function panUp() {
  y = Math.max(y - height / zoom, 0);
  dispatchEvent(new Event("pan::change"));
}

function panDown() {
  y = Math.min(y + height / zoom, height - height / zoom);
  dispatchEvent(new Event("pan::change"));
}

function pan(xDist = 0, yDist = 0) {
  x = Math.min(Math.max(x - xDist, 0), width - width / zoom);
  y = Math.min(Math.max(y - yDist, 0), height - height / zoom);
  dispatchEvent(new Event("pan::change"));
}

// mouse drag to pan 
function panDrag({ movementX, movementY }) {
  pan(movementX / zoom, movementY / zoom);
}

app.view.addEventListener("mousedown", () => {
  document.body.addEventListener("mousemove", panDrag);
});

// mousemove event caters for release out of window
document.body.addEventListener("mousemove", ({ buttons }) => {
  if (buttons != 1) // left mouse button
    document.body.removeEventListener("mousemove", panDrag);
});


// Handle Zooming
const ZoomLevels = [1, 2, 4, 5, 10, 20, 25, 50, 100, 125, 250, 500]; // factors of 500
let zoomIndex = 0;
let zoom = ZoomLevels[zoomIndex];

const zoomInButton = document.getElementById("zoom_in");
const zoomOutButton = document.getElementById("zoom_out");
const zoomText = document.getElementById("zoom_text");
dispatchEvent(new Event("zoomIndex::change"));

zoomInButton.addEventListener('click', zoomIn)
zoomOutButton.addEventListener('click', zoomOut)

function zoomIn() {
  zoomIndex = Math.min(++zoomIndex, ZoomLevels.length - 1);
  dispatchEvent(new Event("zoomIndex::change"));
}

function zoomOut() {
  zoomIndex = Math.max(--zoomIndex, 0);
  dispatchEvent(new Event("zoomIndex::change"));
}

addEventListener('zoomIndex::change', updateZoom)

function updateZoom() {
  zoom = ZoomLevels[zoomIndex];
  dispatchEvent(new Event("zoom::change"));
}

addEventListener('zoomIndex::change', updateZoomText)

function updateZoomText() {
  zoomText.innerText = 'x' + ZoomLevels[zoomIndex];
}

// fix for zooming out of bounds
addEventListener('zoom::change', () => pan())


// Handle File Input
const fileInput = document.getElementById("csv");

fileInput.addEventListener('change', readFile);

function readFile() {
  const reader = new FileReader();

  reader.onload = () => {
    // 2D array of colour indices from csv string
    stitchChart = reader.result.split("\n").map(row => row.split(","))
    dispatchEvent(new Event('stitchChart::change'))
  }

  reader.readAsBinaryString(fileInput.files[0]);
};

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  })
}


// Handle Drawing
addEventListener('stitchChart::change', queueRedraw);
addEventListener("pan::change", queueRedraw);
addEventListener('zoom::change', queueRedraw);
addEventListener('ColorLookup::change', queueRedraw)

let willRedraw = false;
function queueRedraw() { willRedraw = true; }

window.requestAnimationFrame(drawLoop);
function drawLoop() {
  if (willRedraw) {
    graphics.clear()
    const subsection = slice2D(stitchChart, x, y, width / zoom, height / zoom);
    drawStitchChart(subsection, zoom);
    willRedraw = false;
  }

  window.requestAnimationFrame(drawLoop);
}

function drawStitchChart(stitchChart, scale) {
  for (const rowIndex in stitchChart)
    for (const columnIndex in stitchChart[rowIndex]) {
      const color = ColorLookup[stitchChart[rowIndex][columnIndex]];
      drawSquare(color, columnIndex * scale, rowIndex * scale, scale, scale);
    }
}

function drawSquare(color, x, y, width, height) {
  graphics.beginFill(color);
  graphics.drawRect(x, y, width, height);
  graphics.endFill();
}

// returns a subsection of a 2d array
function slice2D(array2D, x, y, width, height) {
  return array2D.slice(y, y + height).map(row => row.slice(x, x + width));
}