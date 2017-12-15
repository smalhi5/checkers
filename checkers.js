var state = {
  action: 'idle',
  over: false,
  turn: 'b',
  board: [
    [null,'w',null, 'w', null, 'w',  null, 'w',  null, 'w'],
    ['w',null,'w',null,'w',null,'w',null,'w',null],
    [null,'w',null,'w',null,'w',null,'w',null,'w'],
    ['w',null,'w',null,'w',null,'w',null,'w',null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null,'b',null,'b',null,'b',null,'b',null,'b'],
    ['b',null,'b',null,'b',null,'b',null,'b',null],
    [null,'b',null,'b',null,'b',null,'b',null,'b'],
    ['b',null,'b',null,'b',null,'b',null,'b',null]
  ],
  captures: {w: 0, b: 0}
}

var ctx;

function getLegalMoves(piece, x, y) {
  var moves = [];
  switch(piece) {
    case 'b':
      checkSlide(moves, x-1, y-1);
      checkSlide(moves, x+1, y-1);
      checkJump(moves, {captures:[],landings:[], x:x, y:y}, piece, x, y);
      break;
    case 'w':  
      checkSlide(moves, x-1, y+1);
      checkSlide(moves, x+1, y+1);
      checkJump(moves, {captures:[],landings:[], x:x, y:y}, piece, x, y);
      break;
    case 'bk': 
    case 'wk': 
      checkSlide(moves, x-1, y+1);
      checkSlide(moves, x+1, y+1);
      checkSlide(moves, x-1, y-1);
      checkSlide(moves, x+1, y-1);
      checkJump(moves, {captures:[],landings:[], x:x, y:y}, piece, x, y);
      break;
  }
  return moves;
}

function checkSlide(moves, x, y) {
  if(x < 0 || x > 9 || y < 0 || y > 9) return;
  if(state.board[y][x]) return;
  moves.push({type: 'slide', x: x, y: y});
}

function copyJumps(jumps) {
  var newJumps = {
    x: jumps.x,
    y: jumps.y,
    landings: jumps.landings.slice(),
    captures: jumps.captures.slice()
  }
  return newJumps;
}

function checkJump(moves, jumps, piece, x, y) {
  switch(piece) {
    case 'b': 
      checkLanding(moves, copyJumps(jumps), piece, x-1, y-1, x-2, y-2);
      checkLanding(moves, copyJumps(jumps), piece, x+1, y-1, x+2, y-2);
      break;
    case 'w': 
      checkLanding(moves, copyJumps(jumps), piece, x-1, y+1, x-2, y+2);
      checkLanding(moves, copyJumps(jumps), piece, x+1, y+1, x+2, y+2);
      break;
    case 'bk': 
    case 'wk': 
      checkLanding(moves, copyJumps(jumps), piece, x-1, y+1, x-2, y+2);
      checkLanding(moves, copyJumps(jumps), piece, x+1, y+1, x+2, y+2);
      checkLanding(moves, copyJumps(jumps), piece, x-1, y-1, x-2, y-2);
      checkLanding(moves, copyJumps(jumps), piece, x+1, y-1, x+2, y-2);
      break;
  }
}

function checkLanding(moves, jumps, piece, cx, cy, lx, ly) {
  if(lx == jumps.x && ly == jumps.y) return;
  if(lx < 0 || lx > 9 || ly < 0 || ly > 9) return;
  if(state.board[ly][lx]) return;
  if(state.turn === 'b' && !(state.board[cy][cx] === 'w' || state.board[cy][cx] === 'wk')) return;
  if(state.turn === 'w' && !(state.board[cy][cx] === 'b' || state.board[cy][cx] === 'bk')) return;
  if(0 < jumps.landings.indexOf(function(landing){return landing.x == lx && landing.y == ly;})) return;
  jumps.captures.push({x: cx, y: cy});
  jumps.landings.push({x: lx, y: ly});
  moves.push({
    type: 'jump',
    captures: jumps.captures.slice(),
    landings: jumps.landings.slice()
  });
  checkJump(moves, jumps, piece, lx, ly);
}

function applyMove(x, y, move) {
  if(move.type === "slide") {
    state.board[move.y][move.x] = state.board[y][x];
    state.board[y][x] = null;
  } else {
    move.captures.forEach(function(square){
      var piece = state.board[square.y][square.x];
      state.captures[piece.substring(0,1)]++;
      state.board[square.y][square.x] = null;
    });
    var index = move.landings.length - 1;
    state.board[move.landings[index].y][move.landings[index].x] = state.board[y][x];
    state.board[y][x] = null;
  }
}

function checkForVictory() {
  if(state.captures.w == 20) {
    state.over = true;
    return 'black wins';
  }
  if(state.captures.b == 20) {
    state.over = true;
    return 'white wins';
  }
  return null;
}

function nextTurn() {
  if(state.turn === 'b') state.turn = 'w';
  else state.turn = 'b';
}

function renderChecker(piece, x, y) {
  ctx.beginPath();
  if(state.board[y][x].charAt(0) === 'w') {
    ctx.fillStyle = '#fff';
  } else {
    ctx.fillStyle = '#000';
  }
  ctx.arc(x*100+50, y*100+50, 40, 0, Math.PI * 2);
  ctx.fill();
}

function renderSquare(x,y) {
  if((x + y) % 2 == 1) {
    ctx.fillStyle = '#888';
    ctx.fillRect(x*100, y*100, 100, 100);
    if(state.board[y][x]) {
      renderChecker(state.board[y][x], x, y);
    }
  }
}

function renderBoard() {
  if(!ctx) return;
  for(var y = 0; y < 10; y++) {
    for(var x = 0; x < 10; x++) {
      renderSquare(x, y);
    }
  }
}

function boardPosition(x, y) {
  var boardX = Math.floor(x / 50);
  var boardY = Math.floor(y / 50);
  return {x: boardX, y: boardY}
}

function handleMouseDown(event) {
  var position = boardPosition(event.clientX, event.clientY);
  var x = position.x;
  var y = position.y;
  if(x < 0 || y < 0 || x > 9 || y > 9) return;
  if(state.board[y][x] && state.board[y][x].charAt(0) === state.turn) {
    state.movingPiece = {
      piece: state.board[y][x],
      startPosition: {x: x, y: y},
      currentPosition: boardPosition(event.clientX,event.clientY)
    }
    state.action = "dragging";
    state.board[y][x] = null;
    renderBoard();
  }
}

function handleMouseUp(event) {
  if(state.action !== 'dragging') return;
  var position = boardPosition(event.clientX, event.clientY);
  var x = position.x;
  var y = position.y;
  if(x < 0 || y < 0 || x > 9 || y > 9) {
    var sx = state.movingPiece.startPosition.x;
    var sy = state.movingPiece.startPosition.y;
    state.board[sy][sx] = state.movingPiece.piece;
    state.movingPiece = null;
    state.action = "idle";
    renderBoard();
    return;
  };
  if(true) {
    var lx = state.movingPiece.currentPosition.x;
    var ly = state.movingPiece.currentPosition.y;
    state.board[ly][lx] = state.movingPiece.piece;
    state.movingPiece = null;
    state.action = "idle";
    renderBoard();
    return;
  }
}

function renderDragging() {
  renderBoard();

  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.arc(
    state.movingPiece.startPosition.x*100+50,
    state.movingPiece.startPosition.y*100+50,
    40, 0, Math.PI * 2
  );
  ctx.fill();

  ctx.strokeStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(
    state.movingPiece.currentPosition.x*100+50,
    state.movingPiece.currentPosition.y*100+50,
    40, 0, Math.PI * 2
  );
  ctx.stroke();

}

function handleMouseMove(event) {
  renderBoard();
  switch(state.action) {
    case 'idle':
      hoverOverChecker(event);
      break;
    case 'dragging':
      state.movingPiece.currentPosition =
        boardPosition(event.clientX, event.clientY);
      renderDragging();
      break;
  }
}

function hoverOverChecker(event) {
  if(!ctx) return;
  var x = Math.floor(event.clientX / 50);
  var y = Math.floor(event.clientY / 50);
  if(x < 0 || y < 0 || x > 9 || y > 9) return;
  if(state.board[y][x] && state.board[y][x].charAt(0) === state.turn) {
    ctx.strokeWidth = 15;
    ctx.strokeStyle = "yellow";
    ctx.beginPath();
    ctx.arc(x*100+50, y*100+50, 40, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function setup() {
  var canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1000;
  canvas.onmousedown = handleMouseDown;
  canvas.onmouseup = handleMouseUp;
  canvas.onmousemove = handleMouseMove;
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  renderBoard();
}

setup();