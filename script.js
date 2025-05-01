const INITIAL_SCORE = 184;
const GRID_SIZE = 6;
const SKIN_URL = 'assets/skin.png';
const BACKGROUNDS = ['0%', '25%', '50%', '75%'];
const SAVE_KEY = 'chickensGameModified';

let skinurl = SKIN_URL;
let gridsize = GRID_SIZE;
let backgrounds = BACKGROUNDS;
let isMobile;

$(document).ready(function() {

    $('<style>').html(`.pop, .square:not(.empty), .first, .second { background-image:url('${skinurl}'); }`).appendTo('head');
    $('<style>').html(`
        .square, .duplicatesquare { width: calc(100% / ${gridsize}); }
        #piece { width: calc(100% / ${gridsize} + 4px); }
        .horizontal { margin-left: calc(-100% / ${gridsize} - 4px); }
        `).appendTo('head');

    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;

    if (localStorage.getItem(SAVE_KEY)) {
        console.log("Loading saved game...");
        $('.container').html(localStorage.getItem(SAVE_KEY));
        $('#points').hide();
        attachEventHandlers(); 
        if (!$('#gameover').hasClass('hidden')) {
            $('#restart').off('click').on('click', restart);
        }
    } else {
        console.log("Initializing new game...");
        for (let i = 0; i < gridsize * gridsize; i++) {
            $('#board').append('<div class="square empty"></div>');
        }
        $('#score').html(INITIAL_SCORE);

        addPiece();

        attachEventHandlers();
    }

    $('.container').removeClass('hidden');

});

function attachEventHandlers() {
    if ($("#piece").length > 0) {
        try {
            if ($("#piece").data('ui-draggable')) {
                $("#piece").draggable('destroy');
            }
        } catch (e) { console.warn("Error destroying draggable:", e); }

        $("#piece").draggable({
            distance: 0,
            revert: "invalid",
            containment: 'body',
            zIndex: 1000,
            cursor: 'grabbing',
            ...(isMobile && { cursorAt: { top: 210 } }),
            drag: function(event, ui) {
                $('.highlight').removeClass('highlight');
                let currentDroppable = findDroppableUnderHelper(ui.helper);
                if (currentDroppable) {
                    let index = $(".square").index(currentDroppable);
                    let isHorizontal = $(this).hasClass('horizontal'); // Check orientation of dragged item
                    if (index !== -1 && validate(index, isHorizontal)) {
                        $(currentDroppable).addClass('highlight');
                        const secondSquareIndex = isHorizontal ? index + 1 : index - gridsize;
                        $(".square").eq(secondSquareIndex).addClass('highlight');
                    }
                }
            },
            stop: function(event, ui) {
                $('.highlight').removeClass('highlight');
            },
            revertDuration: 200
        });
    } else {
        
    }

    $(".square").each(function() {
        try {
            if ($(this).data('ui-droppable')) {
                $(this).droppable('destroy');
            }
        } catch (e) { console.warn("Error destroying droppable:", e); }
    });
    $(".square.empty").droppable({
        accept: "#piece",
        tolerance: 'pointer',
        drop: handleDrop,
    });

    $(document).off('click', '.togglemodal').on('click', '.togglemodal', function() {
        $('#xpw').toggleClass('hidden');
    });
     $(document).off('click', '#xpw .close').on('click', '#xpw .close', function() {
        $('#xpw').addClass('hidden');
    });

    $('#restart').off('click').on('click', restart);

}

function findDroppableUnderHelper(helper) {
    let maxOverlap = 0;
    let foundDroppable = null;
    const helperRect = helper[0].getBoundingClientRect();

    $('.square.empty').each(function() {
        const squareRect = this.getBoundingClientRect();
        const overlap = calculateOverlap(helperRect, squareRect);
        if (overlap > maxOverlap && overlap > 10) {
            maxOverlap = overlap;
            foundDroppable = this;
        }
    });
    return foundDroppable;
}

function calculateOverlap(rect1, rect2) {
    const xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
    const yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
    return xOverlap * yOverlap;
}


function addPiece() {
    if ($('#piece').length === 0) {
         $('#pieces').html('<div id="piece" class="vertical"><div class="first"><span class="second"></span></div></div>');
         console.log("Recreated #piece structure.");
    }

    $('#piece').css({ top: '', left: '', transform: 'translateX(-50%)' });

    let random1 = Math.floor(Math.random() * backgrounds.length);
    let random2 = Math.floor(Math.random() * backgrounds.length);
    let background1 = backgrounds[random1];
    let background2 = backgrounds[random2];

    let isHorizontal = Math.random() > 0.5;
    let type = isHorizontal ? 'horizontal' : 'vertical';

    $('#piece').removeClass('horizontal vertical').addClass(type);
    $('#piece .first').css("background-position-x", background1);
    $('#piece .second').css("background-position-x", background2);

    // Check placement possibility
    let placementPossible = false;
    for (let i = 0; i < gridsize * gridsize; i++) {
        if (validate(i, isHorizontal)) {
            placementPossible = true;
            break;
        }
    }
    if (!placementPossible) {
        isHorizontal = !isHorizontal;
        type = isHorizontal ? 'horizontal' : 'vertical';
        $('#piece').removeClass('horizontal vertical').addClass(type);
        for (let i = 0; i < gridsize * gridsize; i++) {
            if (validate(i, isHorizontal)) {
                placementPossible = true;
                break;
            }
        }
    }

    if (!placementPossible) {
        console.log("No placement possible.");
        gameover();
        return false;
    } else {
        saveGameState();
        return true;
    }
}

function validate(index, isHorizontal) {
    const squares = $(".square");
    if (index < 0 || index >= squares.length) return false;

    if (isHorizontal) {
        const isNotOnRightEdge = (index % gridsize !== gridsize - 1);
        const nextIndex = index + 1;
        if (!isNotOnRightEdge || nextIndex >= squares.length) return false;
        return squares.eq(index).hasClass("empty") && squares.eq(nextIndex).hasClass("empty");
    } else {
        const aboveIndex = index - gridsize;
        if (aboveIndex < 0) return false;
        return squares.eq(index).hasClass("empty") && squares.eq(aboveIndex).hasClass("empty");
    }
}


function handleDrop(event, ui) {
    const $targetSquare = $(this);
    const index = $(".square").index($targetSquare);
    const isHorizontal = ui.draggable.hasClass('horizontal');

    if (!$targetSquare.hasClass('highlight')) {
         console.log("Drop on non-highlighted. Reverting.");
        return;
    }
    $('.highlight').removeClass('highlight');

    let background1, background2;
    try {
        background1 = ui.draggable.find('.first').css('background-position-x');
        background2 = ui.draggable.find('.second').css('background-position-x');
    } catch (e) {
        console.error("Error getting styles from piece:", e); return;
    }

    const $square1 = $targetSquare;
    const $square2 = isHorizontal ? $(".square").eq(index + 1) : $(".square").eq(index - gridsize);

     if (!$square2 || $square2.length === 0 || !$square2.hasClass('empty')) {
        console.error("Second square invalid."); return;
    }

    $square1.css("background-position-x", background1).removeClass('empty');
    $square2.css("background-position-x", background2).removeClass('empty');

    $square1.droppable('destroy');
    $square2.droppable('destroy');

    if ('vibrate' in navigator) { navigator.vibrate(20); }

    const squares = $(".square");
    const directions = [{ x: 1, y: 0 }, { x: 0, y: 1 }];
    const toClear = new Set();

    for (let i = 0; i < gridsize * gridsize; i++) {
        const currentSquare = squares.eq(i);
        if (currentSquare.hasClass('empty')) continue;
        const x = i % gridsize;
        const y = Math.floor(i / gridsize);
        const position = currentSquare.css("background-position-x");
        if (!position || position === 'none') continue;

        for (const dir of directions) {
            let line = [i];
            for (let step = 1; step < gridsize; step++) {
                const nx = x + dir.x * step; const ny = y + dir.y * step; const ni = ny * gridsize + nx;
                if (nx < 0 || nx >= gridsize || ny < 0 || ny >= gridsize) break;
                const nextSquare = squares.eq(ni);
                if (nextSquare.hasClass('empty') || nextSquare.css("background-position-x") !== position) break;
                line.push(ni);
            }
            if (line.length >= 3) { line.forEach(idx => toClear.add(idx)); }
        }
    }

    if (toClear.size > 0) {
        $('.instructions').addClass('hidden'); $('.score').removeClass('hidden');
        let score = Number($('#score').html());
        let clearedCount = toClear.size;
        let newscore = score - clearedCount;
        $("#score").html(Math.max(0, newscore));

        try {
            let firstClearedIndex = toClear.values().next().value;
            let $firstSquare = squares.eq(firstClearedIndex);
            if ($firstSquare.length > 0) {
                let animationPos = $firstSquare.offset();
                if (animationPos) {
                     $('#points').css({
                         top: animationPos.top + $firstSquare.height() / 2 - 17,
                         left: animationPos.left + $firstSquare.width() / 2 - 10,
                     });
                     $("#points").html('-' + clearedCount);
                     $("#points").stop(true, true).fadeIn(100).delay(200).fadeOut(400);
                }
            }
        } catch (e) { console.warn("Points animation error:", e); }

        toClear.forEach((idx) => {
            const $square = squares.eq(idx);
            $square.addClass("pop");
            setTimeout(() => {
                $square.addClass("empty").css("background-position-x", "").removeClass("pop");
                try {
                   if (!$square.data('ui-droppable')) {
                        $square.droppable({ accept: "#piece", tolerance:'pointer', drop: handleDrop });
                   }
                } catch(e) { console.warn("Error re-attaching droppable:", e); }
            }, 400);
        });

        if (newscore <= 0) {
            setTimeout(() => {
                $('#xpw .attempts').text($('#xye').text() || 0);
                $('#xpw').removeClass('hidden');
                 if ($("#piece").length > 0 && $("#piece").data('ui-draggable')) { $("#piece").draggable('disable'); }
                 $('#pieces').empty();
            }, 450);
             saveGameState(); return;
        }
    }

    // --- Add next piece ---
    setTimeout(() => {
        if (!$('#xpw').hasClass('hidden') || !$('#gameover').hasClass('hidden')) return;
        if (!addPiece()) {  }
        else {
            attachEventHandlers(); 
        }
    }, toClear.size > 0 ? 450 : 50);

    saveGameState();
}

function gameover() {
    console.log("Game Over called");
    if ($("#piece").length > 0 && $("#piece").data('ui-draggable')) {
        $("#piece").draggable('disable');
    }
    $('#pieces').addClass('hidden');
    $('#gameover').removeClass('hidden');
    saveGameState();
}

function restart() {
    console.log("Restarting game...");
    $('#xye').html(Number($('#xye').html() || 0) + 1);
    $('#xpw .attempts').html($('#xye').html());

    $('#score').html(INITIAL_SCORE);
    $('.instructions').removeClass('hidden');
    $('.score').addClass('hidden');

    $('.square').css("background-position-x", "").addClass('empty').removeClass('pop highlight');

    $('#gameover').addClass('hidden');
    $('#xpw').addClass('hidden');
    $('#pieces').removeClass('hidden').empty();

    localStorage.removeItem(SAVE_KEY); 

    addPiece();
    attachEventHandlers();

    console.log("Game restarted. Score:", INITIAL_SCORE);
}

function saveGameState() {
     try {
        $('.highlight').removeClass('highlight'); 
        if ($('#gameover').hasClass('hidden') && $('#xpw').hasClass('hidden')) {
            localStorage.setItem(SAVE_KEY, $('.container').html());
        } else {
             localStorage.removeItem(SAVE_KEY);
             console.log("Game finished, save data cleared.");
        }
    } catch (e) {
        console.error("Could not save game state:", e);
    }
}