var state = {
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