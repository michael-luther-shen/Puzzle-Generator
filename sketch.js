// Puzzle Generator!

// Setup
let img;
let pieceSize = 100; // size of each square piece
let snapDist = 20;   // snapping distance

let pieces = [];
let boardCols, boardRows;
let boardX, boardY;
let draggingPiece = null;
let offsetX, offsetY;

function setup() {
  createCanvas(900, 600);
  textAlign(CENTER, CENTER);
  textSize(20);

  // ask for image URL
  let url = prompt("Paste an image URL:");
  if (url) {
    loadImage(url, (loadedImg) => {
      img = loadedImg;
      img.resize(400, 400); // fixed board size
      makePuzzle(img);
      redraw();
    }, () => {
      alert("Failed to load image. Reload and try a different URL.");
    });
  }

  noLoop();
}

function draw() {
  background(220);

  if (!img) {
    text("Waiting for image...", width/2, height/2);
    return;
  }

  // draw empty board grid in center
  stroke(0);
  noFill();
  for (let y = 0; y < boardRows; y++) {
    for (let x = 0; x < boardCols; x++) {
      rect(boardX + x*pieceSize, boardY + y*pieceSize, pieceSize, pieceSize);
    }
  }

  // draw pieces
  for (let p of pieces) {
    // draw that piece from the source image
    image(img,
          p.x, p.y, p.size, p.size,   // destination
          p.sx, p.sy, p.size, p.size // source
    );
    stroke(0);
    noFill();
    rect(p.x, p.y, p.size, p.size);
  }
}

// Build puzzle pieces
function makePuzzle(image) {
  pieces = [];
  boardCols = floor(image.width / pieceSize);
  boardRows = floor(image.height / pieceSize);
  boardX = width/2 - image.width/2;
  boardY = height/2 - image.height/2;

  for (let y = 0; y < boardRows; y++) {
    for (let x = 0; x < boardCols; x++) {
      let targetX = boardX + x*pieceSize;
      let targetY = boardY + y*pieceSize;

      // put piece randomly on left or right
      let side = random() < 0.5 ? "left" : "right";
      let startX = side === "left" ? random(20, boardX - pieceSize - 20) 
                                   : random(boardX + image.width + 20, width - pieceSize - 20);
      let startY = random(20, height - pieceSize - 20);

      pieces.push({
        sx: x * pieceSize, // source x in original image
        sy: y * pieceSize, // source y
        tx: targetX,       // target board x
        ty: targetY,       // target board y
        x: startX,         // current drawn x
        y: startY,         // current drawn y
        size: pieceSize,
        placed: false
      });
    }
  }
}

// ---------------------------
// Dragging
// ---------------------------
function mousePressed() {
  if (!img) return;
  let p = getPieceAt(mouseX, mouseY);
  if (p && !p.placed) {
    draggingPiece = p;
    offsetX = mouseX - p.x;
    offsetY = mouseY - p.y;
    // bring to front
    pieces = pieces.filter(pc => pc !== p);
    pieces.push(p);
  }
}

function mouseDragged() {
  if (draggingPiece) {
    draggingPiece.x = mouseX - offsetX;
    draggingPiece.y = mouseY - offsetY;
    redraw();
  }
}

function mouseReleased() {
  if (draggingPiece) {
    if (dist(draggingPiece.x, draggingPiece.y, draggingPiece.tx, draggingPiece.ty) < snapDist) {
      draggingPiece.x = draggingPiece.tx;
      draggingPiece.y = draggingPiece.ty;
      draggingPiece.placed = true;
    }
    draggingPiece = null;
    redraw();
  }
}

function getPieceAt(x, y) {
  for (let i = pieces.length - 1; i >= 0; i--) {
    let p = pieces[i];
    if (x > p.x && x < p.x + p.size && y > p.y && y < p.y + p.size) {
      return p;
    }
  }
  return null;
}
