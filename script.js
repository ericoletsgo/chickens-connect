const GAME_NAME = 'Chickens X';
const GRID_SIZE = 6;
const INITIAL_TARGET = 184;
let remaining = INITIAL_TARGET;

$(document).ready(() => {
  initGame();
  $('#restart-btn').on('click', restart);
});

function initGame() {
  document.title = GAME_NAME;
  $('#game-title').text(GAME_NAME);
  remaining = INITIAL_TARGET;
  $('#remaining').text(remaining);
  renderBoard();
  $('#pieces').empty();
  addPiece();
  attachEvents();
}

function renderBoard() {
  const $board = $('#board').empty();
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    $('<div>')
      .addClass('square empty')
      .attr('data-index', i)
      .appendTo($board);
  }
}

function addPiece() {
  const $piece = $('<div>').addClass('piece').attr('id', 'current-piece');
  for (let i = 0; i < 2; i++) $('<div>').addClass('block').appendTo($piece);
  $('#pieces').append($piece);
}

function attachEvents() {
  $('#current-piece').draggable({
    revert: 'invalid',
    containment: 'body',
    helper: 'clone'
  });

  $('.square.empty').droppable({
    accept: '#current-piece',
    drop: placePiece
  });
}

function placePiece(event, ui) {
  const dropIdx = parseInt($(this).attr('data-index'), 10);
  // place first block
  occupyCell(dropIdx);
  // place second block to the right if within same row, else to left
  const rowStart = Math.floor(dropIdx / GRID_SIZE) * GRID_SIZE;
  let secondIdx = dropIdx + 1;
  if (secondIdx >= rowStart + GRID_SIZE) secondIdx = dropIdx - 1;
  occupyCell(secondIdx);

  // remove piece and update remaining
  $('#current-piece').remove();
  remaining -= 2;
  $('#remaining').text(Math.max(0, remaining));

  // sequence next
  if (remaining > 0) {
    addPiece();
    attachEvents();
  } else {
    $('#gameover').removeClass('hidden');
  }
}

function occupyCell(idx) {
  const $cell = $(`.square[data-index=${idx}]`);
  if ($cell.hasClass('empty')) {
    $cell.removeClass('empty').css('background', '#fff');
  }
}

function checkLines() {
}

function saveGameState() {
}

function loadGameState() {
}

function restart() {
  $('.square').addClass('empty').css('background', '#252f50');
  $('#pieces').empty();
  $('#gameover').addClass('hidden');
  initGame();
}

function registerServiceWorker() {
}

//call registerServiceWorker();