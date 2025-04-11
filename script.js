const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

let isRunning = false;
let gameOver = false;

context.scale(20, 20);

const arena = createMatrix(12, 20);
const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0
};

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  if (type === 'T') {
    return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
  } else if (type === 'O') {
    return [[2, 2], [2, 2]];
  } else if (type === 'L') {
    return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
  } else if (type === 'J') {
    return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
  } else if (type === 'I') {
    return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
  } else if (type === 'S') {
    return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
  } else if (type === 'Z') {
    return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
  }
}

function drawGrid() {
    const size = 20; 
    context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  
    for (let x = 0; x <= canvas.width; x += size) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }
  
    for (let y = 0; y <= canvas.height; y += size) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = colors[value];
          context.fillRect(x + offset.x, y + offset.y, 1, 1);
          context.strokeStyle = 'black';
          context.lineWidth = 0.1;
          context.strokeRect(x + offset.x, y + offset.y, 1, 1)
        }
      });
    });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] =
        [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);
    if (collide(arena, player)) {
      gameOver = true;
      isRunning = false;
      showGameOver();
    }
  }

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function arenaSweep() {
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += 10;
  }
}

function updateScore() {
  document.getElementById('score').innerText = player.score;
}

function showGameOver() {
    document.getElementById('gameOverScreen').style.display = 'block';
}  

let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;

function update(time = 0) {
    if (!isRunning || gameOver) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      playerDrop();
    }
    draw();
    requestAnimationFrame(update);
  }

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  } else if (event.key === 'ArrowUp') {
    playerRotate(1);
  }
});

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

playerReset();
updateScore();

document.getElementById('startBtn').addEventListener('click', () => {
  if (!isRunning) {
    isRunning = true;
    update();
    document.getElementById('startBtn').style.visibility = 'hidden';
  }

  document.getElementById('restartBtn').addEventListener('click', () => {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    gameOver = false;
    isRunning = true;
    document.getElementById('gameOverScreen').style.display = 'none';
    update();
  });

});
