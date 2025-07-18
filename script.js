const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

const { "mars_hills.png": hillsImg,
  "rover.png": roverImg,
  "ice.png": iceImg,
  "dust.png": dustImg,
  "rock.png": rockImg } = window.assets;

// Parallax offset
let hillOffset = 0;

// Rover as sprite
const rover = { x: 40, y: H - 75, w: 64, h: 48, speed: 7 };

// Entities
let iceChunks = [], dusts = [];
let score = 0, gameOver = false, frame = 0, keys = {};

// NEW: rock array
let rocks = [];
function spawnRock() {
  rocks.push({
    x: Math.random() * (W - 28),
    y: -28
  });
}

// Input
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// ===== Draw Mars background =====
function drawBackground() {
  // sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, ("#3a0f1d"));     // top: dark maroon
  grad.addColorStop(1, ("#6b1e2e"));     // bottom: lighter
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // hills (parallax)
  hillOffset = (hillOffset - 0.3) % W;
  ctx.drawImage(hillsImg, hillOffset, H - 120, W, 120);
  ctx.drawImage(hillsImg, hillOffset + W, H - 120, W, 120);
}

// ===== Spawn & Draw =====
function spawnIce() {
  iceChunks.push({ x: Math.random() * (W - 16), y: -16 });
}
function spawnDust() {
  dusts.push({ x: Math.random() * (W - 32), y: -32 });
}

// ===== Main Loop =====
function gameLoop() {
  if (gameOver) return;
  requestAnimationFrame(gameLoop);

  // draw background
  drawBackground();

  // spawn
  if (frame % 90 === 0) spawnIce();
  if (frame % 150 === 0) spawnDust();
  if (frame % 200 === 0) spawnRock();  // every ~3.3 seconds
  frame++;

  // move rover
  if (keys["ArrowLeft"] && rover.x > 0) rover.x -= rover.speed;
  if (keys["ArrowRight"] && rover.x < W - rover.w) rover.x += rover.speed;

  // draw rover
  ctx.drawImage(roverImg, rover.x, rover.y, rover.w, rover.h);

  // ice
  iceChunks.forEach((i, idx) => {
    i.y += 2 + frame * 0.0005; // speed up very gradually
    ctx.drawImage(iceImg, i.x, i.y, 16, 16);
    if (isColliding(i, rover, 16, 16)) {
      iceChunks.splice(idx, 1);
      score += 50;
      document.getElementById("score").textContent = `Water Points: ${score}`;
    }
  });

  // rocks
  rocks.forEach((r, idx) => {
    r.y += 1.8 + frame * 0.003;   // speed similar to dust
    ctx.drawImage(rockImg, r.x, r.y, 28, 24);
    if (isColliding(r, rover, 28, 24)) endGame();
  });

  // dust
  dusts.forEach((d, idx) => {
    d.y += 1.5 + frame * 0.003; // speed up very gradually
    ctx.drawImage(dustImg, d.x, d.y, 32, 32);
    if (isColliding(d, rover, 32, 32)) endGame();
  });
}

function isColliding(a, b, aw, ah) {
  return a.x < b.x + b.w &&
    a.x + aw > b.x &&
    a.y < b.y + b.h &&
    a.y + ah > b.y;
}
if (score >= 300) rover.speed = 5;
if (frame % 1000 === 0) spawnRate = 0.2;
function endGame() {
  gameOver = true;
  document.getElementById("status").textContent =
    `Mission failed! Final score: ${score}`;
}

// ==== Start ====
roverImg.onload = () => requestAnimationFrame(gameLoop);
