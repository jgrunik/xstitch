const width = 500
const height = 500;

// Initialise PIXI
let app = new PIXI.Application({ width, height });
document.getElementById("canvas_placeholder").replaceWith(app.view);

const graphics = new PIXI.Graphics();
app.stage.addChild(graphics)


// 2D array of colour indices
let stitchChart = [];
// make 80 random hex values for color lookup
const ColorLookup = Array.from({ length: 80 }, randomHex)


function randomHex() {
  return Math.floor(Math.random() * 0x1000000)
}


// Handle Pan Buttons
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
  dispatchEvent(new Event("x::change"));
}

function panRight() {
  x = Math.min(x + width / zoom, width - width / zoom);
  dispatchEvent(new Event("x::change"));
}

function panUp() {
  y = Math.max(y - height / zoom, 0);
  dispatchEvent(new Event("y::change"));
}

function panDown() {
  y = Math.min(y + height / zoom, height - width / zoom);
  dispatchEvent(new Event("y::change"));
}

addEventListener('zoom::change', fixPan)

function fixPan() {
  x = Math.min(x, width - width / zoom);
  y = Math.min(y, height - height / zoom);
}


// Handle Zoom Buttons
const ZoomLevels = [1, 2, 4, 5, 10, 20, 25, 50, 100, 125, 250, 500]; // factors of 500
let zoomIndex = 6;
let zoom = ZoomLevels[zoomIndex];

const zoomInButton = document.getElementById("zoom_in");
const zoomOutButton = document.getElementById("zoom_out");
const zoomText = document.getElementById("zoom_text");
updateZoomText();

zoomInButton.addEventListener('click', zoomIn)
zoomOutButton.addEventListener('click', zoomOut)
dispatchEvent(new Event("zoomIndex::change"));

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

addEventListener('zoom::change', updateZoomText)

function updateZoomText() {
  zoomText.innerText = 'x' + ZoomLevels[zoomIndex];
}


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


// Handle Drawing
addEventListener('stitchChart::change', draw)
addEventListener("x::change", draw);
addEventListener("y::change", draw);
addEventListener('zoomIndex::change', draw)

function draw() {
  graphics.clear()
  drawSubsection(stitchChart, x, y, width / zoom, height / zoom, zoom);
}

function drawSubsection(stitchChart, x, y, width, height, scale) {
  const subsection = slice2D(stitchChart, x, y, width, height);
  drawStitchChart(subsection, scale);
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