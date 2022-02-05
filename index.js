const fileInput = document.getElementById("csv");

let stitchChart;
let pixiApp = startPixi()

readFile = function () {
  var reader = new FileReader();
  reader.onload = function () {
    processImageData(reader.result);
  };
  // start reading the file. When it is done, calls the onload event defined above.
  reader.readAsBinaryString(fileInput.files[0]);
};

fileInput.addEventListener('change', readFile);


function processImageData(data) {

  //making 2D array of colour indices from csv string
  stitchChart = data.split("\n").map(row => row.split(","))

  const graphics = new PIXI.Graphics();
  graphics.beginFill(0xDE3249);
  graphics.drawRect(50, 50, 100, 100);
  graphics.endFill();
  pixiApp.stage.addChild(graphics)
}

function startPixi() {
  let app = new PIXI.Application({ width: 500, height: 500 });
  document.body.appendChild(app.view);
  return app;
}

// make 80 random hex values for color lookup 