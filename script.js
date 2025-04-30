const GAME_NAME   = 'Chickens X';
const GRID_SIZE   = 6;
const INITIAL_TARGET = 184;
const SKIN_URL       = 'assets/skin.png';
const BACKGROUNDS    = ['0%', '25%', '50%', '75%'];
let remaining;

$(document).ready(() => {
  injectDynamicStyles();
  loadGameState();
  initGame();
  $('#restart-btn').on('click', restart);
});

function injectDynamicStyles() {
  $('<style>').text(
    `.square:not(.empty), .piece .block { background-image: url('${SKIN_URL}'); }` +
    `.square { width: ${100/GRID_SIZE}% }`
  ).appendTo('head');
}

function initGame() {
  document.title = GAME_NAME;
  $('#game-title').text(GAME_NAME);
  if (remaining == null) remaining = INITIAL_TARGET;
  $('#remaining').text(remaining);
  renderBoard();
  $('#pieces').empty();
  addPiece();
  attachEvents();
}

function renderBoard() {
  const saved  = localStorage.getItem('cx-board');
  const layout = saved ? JSON.parse(saved) : Array(GRID_SIZE*GRID_SIZE).fill(true);
  const $board = $('#board').empty();
  layout.forEach((isEmpty, i) => {
    const $cell = $('<div>').addClass('square').toggleClass('empty', isEmpty)
      .css('background-position-x', isEmpty ? '' : BACKGROUNDS[0])
      .attr('data-index', i)
      .appendTo($board);
  });
}

function addPiece() {
  const $piece = $('<div>').addClass('piece').attr('id', 'current-piece');
  const isHorizontal = Math.random() > 0.5;
  $piece.toggleClass('horizontal', isHorizontal).toggleClass('vertical', !isHorizontal);
  // two blocks at positions 0 and horizontal?1: vertical?1
  BACKGROUNDS.sort(() => 0.5 - Math.random());
  for (let i=0; i<2; i++) {
    $('<div>').addClass('block')
      .css('background-position-x', BACKGROUNDS[i])
      .appendTo($piece);
  }
  $('#pieces').append($piece);
}

function attachEvents() {
  $('#current-piece').draggable({ revert:'invalid', helper:'clone', containment:'body' });
  $('.square.empty').droppable({ accept:'#current-piece', drop: placePiece });
}

function placePiece(e, ui) {
  const $p = $('#current-piece');
  const idx = +ui.helper.data('index') || +$(this).data('index');
  const isH = $p.hasClass('horizontal');
  const idx2 = isH ? idx+1 : idx-GRID_SIZE;
  applyBlock(idx,  BACKGROUNDS[0]);
  applyBlock(idx2, BACKGROUNDS[1]);
  $p.remove();
  remaining -= 2;
  $('#remaining').text(Math.max(0,remaining));
  const cleared = checkLines(); remaining -= cleared;
  $('#remaining').text(Math.max(0,remaining));
  saveGameState();
  if (remaining>0) { addPiece(); attachEvents(); } else $('#gameover').removeClass('hidden');
}

function applyBlock(i, bg) {
  const $c = $(`.square[data-index=${i}]`);
  $c.removeClass('empty').css('background-position-x', bg);
}

function checkLines() {
  // same logic as previous, using BACKGROUNDS compare instead of white
  // return number of cleared cells
  return 0; // placeholder
}

// persistence
function saveGameState() {
  const layout = $('.square').map((i,el)=> $(el).hasClass('empty')).get();
  localStorage.setItem('cx-board', JSON.stringify(layout));
  localStorage.setItem('cx-remaining', remaining);
}

function loadGameState() {
  const r = localStorage.getItem('cx-remaining');
  remaining = r!=null ? +r : null;
}

function restart() {
  localStorage.clear();
  remaining = null;
  $('#gameover').addClass('hidden');
  initGame();
}