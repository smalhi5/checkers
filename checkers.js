const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function printBoard() {
  console.log()
  console.log("   a b c d e f g h i j");
  state.board.forEach(function(row, index){
    var ascii = row.map(function(square){
      if(!square) return '_';
      else return square;
    }).join('|');
    console.log(index, ascii);
  });
  console.log('\n');
}

function getJumpString(move) {
  var jumps = move.landings.map(function(landing) {
    return String.fromCharCode(97 + landing.x) + "," + landing.y;
  }).join(' to ');
  return "jump to " + jumps + " capturing " + move.captures.length + " piece" + ((move.captures.length > 1)?'s':'');
}

function processTurn() {
  printBoard();
  console.log(state.turn + "'s turn");
  rl.question("Pick a piece to move, (letter, number): ", function(answer) {

    var match = /([a-j]),?\s?([0-9])/.exec(answer);
    if(match) {
      var x = match[1].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
      var y = parseInt(match[2]);
      var piece = state.board[y][x];
      var moves = getLegalMoves(piece, x, y);
      if(moves.length === 0) {
        console.log("\nNo legal moves for ", piece, "at", x, ",", y);
        return processTurn();
      }

      console.log("\nAvailable moves for ", match[1] + "," + match[2]);
      console.log("C. Cancel")
      moves.forEach(function(move, index) {
        if(move.type === 'slide') {
          console.log(index + ". You can slide to " + String.fromCharCode(97 + move.x) + "," + move.y);
        } else {
          console.log(index + ". You can " + getJumpString(move));
        }
      })
      rl.question("Pick your move from the list:", function(answer) {
        if(answer.substring(0,1) === 'c') return processTurn();
        var command = parseInt(answer);
        if(isNaN(command) || command >= moves.length) return processTurn();
        applyMove(x,y,moves[command]);
        var result = checkForVictory();
        if(result) {
          console.log(result);
          return;
        }
        nextTurn();
        return processTurn();
      });
    }
  });
}

function main() {
  processTurn();
}

main();