<!DOCTYPE html>
<html>
<head>
<title>Survivalist Mini Game</title>
<style>
    body { background:#111; margin:0; overflow:hidden; }
    canvas { background:#222; display:block; margin:auto; }
    #ui {
        position:absolute; top:10px; left:10px; color:white;
        font-family:Arial; font-size:16px;
        background:rgba(0,0,0,0.4); padding:10px; border-radius:6px;
    }
</style>
</head>
<body>

<canvas id="game" width="900" height="600"></canvas>
<div id="ui">
    <div>HP: <span id="hp">100</span></div>
    <div>Materials: <span id="materials">0</span></div>
    <div>Weapon: <span id="weapon">Stick (1 dmg)</span></div>
    <button id="craftBtn">Craft Better Weapon (Cost: 5 materials)</button>
</div>

<script>
// -------------------------
// Canvas Setup
// -------------------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// -------------------------
// Player
// -------------------------
const player = {
    x: canvas.width/2,
    y: canvas.height/2,
    size: 20,
    speed: 3,
    hp: 100,
    damage: 1,
    weaponLevel: 1
};

// Input
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// -------------------------
// Creatures (Enemies)
// -------------------------
let enemies = [];
let wave = 1;
let spawnTimer = 0;

// -------------------------
// Materials
// -------------------------
let materials = 0;

// -------------------------
// Alien Drop Ships
// -------------------------
let aliens = [];
let alienSpawnTimer = 0;

// -------------------------
// Helper Functions
// -------------------------
function spawnEnemy() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = 0; y = Math.random() * canvas.height; }
    else if (edge === 1) { x = canvas.width; y = Math.random() * canvas.height; }
    else if (edge === 2) { x = Math.random() * canvas.width; y = 0; }
    else { x = Math.random() * canvas.width; y = canvas.height; }

    enemies.push({
        x, y,
        size: 15,
        speed: 1 + wave * 0.1,
        hp: 5 + wave
    });
}

function spawnAlien() {
    aliens.push({
        x: -100,
        y: Math.random() * 200,
        speed: 2,
    });
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

// -------------------------
// Crafting
// -------------------------
document.getElementById("craftBtn").onclick = () => {
    if (materials >= 5) {
        materials -= 5;
        player.weaponLevel++;
        player.damage += 1;
        updateUI();
    }
};

// -------------------------
// UI Updates
// -------------------------
function updateUI() {
    document.getElementById("hp").innerText = player.hp;
    document.getElementById("materials").innerText = materials;
    document.getElementById("weapon").innerText =
        `Weapon Lv ${player.weaponLevel} (${player.damage} dmg)`;
}

// -------------------------
// Game Loop
// -------------------------
function update() {
    // Move Player
    if (keys["w"] || keys["ArrowUp"]) player.y -= player.speed;
    if (keys["s"] || keys["ArrowDown"]) player.y += player.speed;
    if (keys["a"] || keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["d"] || keys["ArrowRight"]) player.x += player.speed;

    // Clamp to screen
    player.x = Math.max(0, Math.min(canvas.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height, player.y));

    // Spawn enemies
    spawnTimer++;
    if (spawnTimer > 60) {
        spawnTimer = 0;
        spawnEnemy();
    }

    // Update enemies
    enemies.forEach((e, index) => {
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(angle) * e.speed;
        e.y += Math.sin(angle) * e.speed;

        // Collision with player
        if (distance(e, player) < e.size + player.size) {
            player.hp -= 0.1;
            updateUI();
            if (player.hp <= 0) {
                alert("You died!");
                document.location.reload();
            }
        }
    });

    // Player auto-attack (simple radius)
    enemies.forEach((e, index) => {
        if (distance(e, player) < 80) {
            e.hp -= player.damage * 0.1;
            if (e.hp <= 0) {
                enemies.splice(index, 1);
                materials += Math.random() < 0.8 ? 1 : 2;
                updateUI();
            }
        }
    });

    // Spawn aliens
    alienSpawnTimer++;
    if (alienSpawnTimer > 600) {
        alienSpawnTimer = 0;
        spawnAlien();
    }

    // Move aliens
    aliens.forEach((a, index) => {
        a.x += a.speed;

        // Drop materials randomly
        if (Math.random() < 0.005) {
            materials++;
            updateUI();
        }

        // Remove when off screen
        if (a.x > canvas.width + 200) aliens.splice(index, 1);
    });
}

// -------------------------
// Render Loop
// -------------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw enemies
    ctx.fillStyle = "red";
    enemies.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw aliens
    ctx.fillStyle = "lime";
    aliens.forEach(a => {
        ctx.fillRect(a.x, a.y, 50, 20);
    });
}

// -------------------------
// Main Loop
// -------------------------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

updateUI();
loop();
</script>

</body>
</html>
