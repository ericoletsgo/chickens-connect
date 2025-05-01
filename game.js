skinurl = 'assets/skin.png';
gridsize = 6;
rankup = false;
backgrounds = ['0%', '25%', '50%', '75%'];
$('<style>').html(`.pop, .square:not(.empty), .first, .second{background-image:url('${skinurl}')}`).appendTo('head');
$('<style>').html(`.square, .duplicatesquare { width: calc(100% / ${gridsize}); } #piece { width: calc(100% / ${gridsize} + 4px); } .horizontal { margin-left: calc(-100% / ${gridsize} - 4px); }`).appendTo('head');
isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;

if(localStorage.getItem('chickenstest')){
  $('.container').html(localStorage.getItem('chickenstest'));
  $('#points').hide();
} else{
  for (let i = 0; i < gridsize * gridsize; i++) {
    $('#board').append('<div class="square empty"></div>');
  }
  for (let i = 0; i < gridsize * gridsize; i++) {
    $('#duplicateboard').append('<div class="duplicatesquare"></div>');
  }

  $('.empty').eq(15).removeClass('empty');
  $('.empty').eq(14).removeClass('empty');
}

function addPiece(){
  $('#piece').css({ top: 0, left: 0 });

  random1 = Math.floor(Math.random() * backgrounds.length);
  random2 = Math.floor(Math.random() * backgrounds.length);

  background1 = backgrounds[random1];
  background2 = backgrounds[random2];

  isHorizontal = Math.random() > 0.5;
  type = isHorizontal ? 'horizontal' : 'vertical';

  $('#piece').removeClass().addClass(type);
  $('.first').css("background-position-x", background1);
  $('.second').css("background-position-x", background2);

  localStorage.setItem('chickenstest', $('.container').html());
  for (let i = 0; i < gridsize*gridsize; i++) {
    if (validate(i, isHorizontal)) {
      return true;
    }
  }
  if(isHorizontal){
    $('#piece').removeClass().addClass('vertical');
    isHorizontal = false; 
  } else {
    $('#piece').removeClass().addClass('horizontal');
    isHorizontal = true;  
  }

  localStorage.setItem('chickenstest', $('.container').html());
  for (let i = 0; i < gridsize*gridsize; i++) {
    if (validate(i, isHorizontal)) {
      return true;
    }
  }
  gameover()
}

$("#piece").draggable({
  distance: 0,
  revert: function (dropTarget) {
    return !dropTarget;
  },
  ...(isMobile && {cursorAt: {top: 210},}),

  drag: function (event, ui) {
    $('.highlight').removeClass('highlight'); 
    index = $(".square").index($(".ui-droppable-hover")); 
    isHorizontal = $('#piece').hasClass('horizontal');
    if (index !== -1 && validate(index, isHorizontal)) {
      $(".square").eq(index).addClass('highlight');
      $(".square").eq(isHorizontal ? index + 1 : index - gridsize).addClass('highlight');
    }
  },
  revertDuration: 200
});

function validate(index, isHorizontal) {
  squares = $(".square");
  if (isHorizontal) {
    return (index % gridsize !== gridsize-1) && squares.eq(index).hasClass("empty") && squares.eq(index + 1).hasClass("empty");
  } else {
    return index-gridsize > -1 && squares.eq(index).hasClass("empty") && squares.eq(index - gridsize).hasClass("empty");
  }
}

$(".square").droppable({
  accept: "#piece",
  drop: function (event, ui) {

    if($('.highlight').length < 1){
      $('#piece').animate({top: 0,left: 0}, 200);
      return;
    }

    if($('.vertical').length < 1){
      background1 = $('.first').css('background-position-x');
      background2 = $('.second').css('background-position-x');    
    } else {
      background1 = $('.second').css('background-position-x');
      background2 = $('.first').css('background-position-x');    
    }

    $('.highlight').first().css("background-position-x", background1);
    $('.highlight').last().css("background-position-x", background2);
    $('.highlight').removeClass('highlight empty');

    if ('vibrate' in navigator) {navigator.vibrate(20)}

    squares = $(".square");
    directions = [
    { x: 1, y: 0 }, 
    { x: 0, y: 1 },
    ];

    const toClear = new Set();

    for (let i = 0; i < gridsize*gridsize; i++) {
      x = i % gridsize;
      y = Math.floor(i / gridsize);
      position = squares.eq(i).css("background-position-x");


      if (squares.eq(i).hasClass('empty')) continue;

      for (dir of directions) {
        line = [i];

        for (step = 1; step < gridsize; step++) {
          nx = x + dir.x * step;
          ny = y + dir.y * step;
          ni = ny * gridsize + nx;

          if (nx < 0 || nx >= gridsize || ny < 0 || ny >= gridsize) break;
          if (squares.eq(ni).css("background-position-x") !== position || squares.eq(ni).hasClass('empty')) break;
          line.push(ni);
        }

        if (line.length >= 3) {
          for (idx of line) {
            toClear.add(idx);
          }
        }
      }
    }

    // Clear lines
    if (toClear.size > 0) {
      $('.instructions').addClass('hidden');
      $('.score').removeClass('hidden')
      toClear.forEach((idx) => {
        const square = squares.eq(idx);
        square.addClass("pop");
        square.addClass("empty");
        setTimeout(() => {
          square.css("background-position-x", "");
          square.removeClass("pop");
          localStorage.setItem('chickenstest', $('.container').html());
        }, 400);
      });

      score =  Number($('#score').html());


      add = toClear.size;
      newscore = score-add;
      $("#score").html(newscore);

      if(newscore < 1){
        $('#xpw').removeClass('hidden');
        $('#score').html(0);
      }

      position = $('.pop').eq(1).offset();
      $('#points').css('top', position.top).css('left', position.left);
      $("#points").html('-'+add);
      $("#points").stop(true, true).fadeIn(100).delay(200).fadeOut(400);
    } 
    addPiece();
  },
});


function gameover(){
  $('#pieces').addClass('hidden');
  $('#gameover').removeClass('hidden');
  localStorage.setItem('chickenstest', $('.container').html());
}

function restart(){
  $('.attempts').html(Number($('.attempts').html())+1);
  $('#xye').html(0);
  $('#score').html(184);
  $('.square').css("background-position-x", "");
  $('.square').addClass('empty');
  $('#gameover').addClass('hidden');
  $('#pieces').removeClass('hidden');
  addPiece();

}

window.addEventListener('scroll', () => {window.scrollTo(0, 0);});


document.addEventListener('dblclick', function(e) {e.preventDefault();}, {passive: false});

$(document).on('click', '.togglemodal', function() {
  $('.modal').toggleClass('hidden');
});

$('.container').removeClass('hidden');