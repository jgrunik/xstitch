// Initialise PIXI
let app = new PIXI.Application({ width: 500, height: 500 });
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


// Handle Zoom Buttons
const ZoomLevels = [1, 2, 4, 5, 10, 20, 25, 50, 100, 125, 250, 500]; // factors of 500
let zoomIndex = 6;

const zoomInButton = document.getElementById("zoom_in")
const zoomOutButton = document.getElementById("zoom_out")
const zoomText = document.getElementById("zoom_text")

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

addEventListener('zoomIndex::change', updateZoomText)

function updateZoomText() {
  zoomText.innerText = 'x' + ZoomLevels[zoomIndex]
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
addEventListener('zoomIndex::change', draw)

function draw() {
  graphics.clear()
  const zoom = ZoomLevels[zoomIndex];
  drawSubsection(stitchChart, 0, 0, 500 / zoom, 500 / zoom, zoom);
}

function drawSubsection(stitchChart, x, y, width, height, scale) {
  const subsection = slice2D(stitchChart, x, y, width, height);
  drawStitchChart(subsection, scale);
}

function drawStitchChart(stitchChart, scale) {
  for (let rowIndex in stitchChart)
    for (let columnIndex in stitchChart[rowIndex]) {
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
  return array2D.slice(x, x + width).map(row => row.slice(y, y + height));
}