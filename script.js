const GAME_NAME   = 'Chickens X';
const GRID_SIZE   = 6;
const INITIAL_TARGET = 184;
let remaining;

$(document).ready(() => {
  loadGameState();
  initGame();
  $('#restart-btn').on('click', restart);
});

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
    $('<div>')
      .addClass('square ' + (isEmpty ? 'empty' : ''))
      .css('background', isEmpty ? '#252f50' : '#fff')
      .attr('data-index', i)
      .appendTo($board);
  });
}

function addPiece() {
  const $piece = $('<div>').addClass('piece').attr('id', 'current-piece');
  for (let i = 0; i < 2; i++) $('<div>').addClass('block').appendTo($piece);
  $('#pieces').append($piece);
}

function attachEvents() {
  $('#current-piece').draggable({ revert: 'invalid', containment: 'body', helper: 'clone' });
  $('.square.empty').droppable({ accept: '#current-piece', drop: placePiece });
}

function placePiece(event, ui) {
  const dropIdx = +$(this).data('index');
  const filled = [];
  [dropIdx, calcSecond(dropIdx)].forEach(i => {
    if ($(`.square[data-index=${i}]`).hasClass('empty')) {
      occupyCell(i); filled.push(i);
    }
  });
  $('#current-piece').remove();
  remaining -= filled.length;
  $('#remaining').text(Math.max(0, remaining));
  const cleared = checkLines();
  remaining -= cleared;
  $('#remaining').text(Math.max(0, remaining));
  saveGameState();
  if (remaining > 0) { addPiece(); attachEvents(); }
  else $('#gameover').removeClass('hidden');
}

function calcSecond(i) {
  const rowStart = Math.floor(i/GRID_SIZE)*GRID_SIZE;
  let j = i+1;
  return j < rowStart+GRID_SIZE ? j : i-1;
}

function occupyCell(i) {
  const $c = $(`.square[data-index=${i}]`);
  $c.removeClass('empty').css('background','#fff');
}

function checkLines() {
  const toClear = [];
  const $cells  = $('.square');
  // horizontal & vertical runs as before
  // (same logic from last one)
  // mark cleared by $cells.eq(idx).addClass('empty') and reset background
  const count = 0; // placeholder
  return count;
}

function saveGameState() {
  const layout = $('.square').map((i,el)=> $(el).hasClass('empty')).get();
  localStorage.setItem('cx-board', JSON.stringify(layout));
  localStorage.setItem('cx-remaining', remaining);
}

function loadGameState() {
  const r = localStorage.getItem('cx-remaining');
  remaining = r != null ? +r : null;
}

function restart() {
  localStorage.removeItem('cx-board');
  localStorage.removeItem('cx-remaining');
  $('.square').addClass('empty').css('background','#252f50');
  $('#pieces').empty();
  $('#gameover').addClass('hidden');
  remaining = null;
  initGame();
}

function registerServiceWorker() {}