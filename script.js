const GAME_NAME = 'Chickens X';
const GRID_SIZE = 6;
const INITIAL_TARGET = 184;

$(document).ready(() => {
  initGame();
  $('#restart-btn').on('click', restart);
});

function initGame() {
  document.title = GAME_NAME;
  $('#game-title').text(GAME_NAME);
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
  // simple horizontal two-block piece
  const $piece = $('<div>').addClass('piece').attr('id', 'current-piece');
  for (let i = 0; i < 2; i++) {
    $('<div>').addClass('block empty').appendTo($piece);
  }
  $('#pieces').append($piece);
}

function attachEvents() {
  // make the current piece draggable
  $('#current-piece').draggable({
    revert: 'invalid',
    containment: 'body',
    helper: 'clone'
  });

  // make squares droppable
  $('.square.empty').droppable({
    accept: '#current-piece',
    drop: function(event, ui) {
      // placeholder: place blocks, then clear piece
      $(this).removeClass('empty').css('background', '#fff');
      ui.helper.remove();
      //checkLines(), update target, addPiece()
    }
  });
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