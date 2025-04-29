// script.js
const GRID_SIZE = 6;

$(document).ready(() => {
  initGame();
  $('#restart-btn').on('click', restart);
});

function initGame() {
  renderBoard();
}

function renderBoard() {
  const $board = $('#board').empty();
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const $cell = $('<div>')
      .addClass('square empty')
      .attr('data-index', i);
    $board.append($cell);
  }
}

function addPiece() {
}

function attachEvents() {
}

function checkLines() {
}

function saveGameState() {
  // Persist state
}

function loadGameState() {
  // Restore state
}

function restart() {
  $('.square').addClass('empty').css('background', '');
  $('#gameover').addClass('hidden');
  initGame();
}

function registerServiceWorker() {
}

//call registerServiceWorker();