import {ipcRenderer} from 'electron';
import "../style.css";
const NUM_ROWS = 20;
const NUM_COLS = 10;
const BLOCK_WIDTH = 30;
const BLOCK_HEIGHT = 30;
const TICK_MS = 1000;

// 키 초기화
const KEY_ENTER = 13;
const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_A = 65;
const KEY_D = 68;
const KEY_R = 82;

let pieces =
    [
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]],
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0]],
        [
            [0, 0, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0]],
        [
            [0, 0, 0, 0],
            [0, 0, 1, 1],
            [0, 1, 1, 0],
            [0, 0, 0, 0]],
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 1],
            [0, 0, 0, 0]],
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ]
    ];
function randomPiece() {
    return pieces[Math.floor(Math.random() * pieces.length)];
}

function TetrisGame() {
    this.gameOver = false;
    this.score = 0;
    this.currentPiece = randomPiece();
    this.nextPiece = randomPiece();
    this.pieceY = 0;
    this.pieceX = 3;
    this.rows = [];
    for (let i = 0; i < NUM_ROWS; i++) {
        this.rows[i] = [];
        for (let j = 0; j < NUM_COLS; j++) {
            this.rows[i][j] = 0;
        }
    }
}

function intersects(rows, piece, y, x){
    for (let i = 0; i< 4; i++){
        for(let j = 0; j< 4; j++){
            if(piece[i][j]){
                if(y + i >= NUM_ROWS || x + j < 0 || x + j >= NUM_COLS || rows[y + i][x + j]){
                    return true;
                }
            }
        }
    }
    return false;
}
TetrisGame.prototype.get_score = function () {
    return this.score;
}

TetrisGame.prototype.get_game_over = function () {
    return this.gameOver;
}
TetrisGame.prototype.get_next_piece = function () {
    return this.nextPiece;
}
TetrisGame.prototype.get_rows = function () {
    return apply_piece(this.rows, this.currentPiece, this.pieceY, this.pieceX);
}
function apply_piece(rows, piece, y, x) {
    let newRows = [];
    for (let i = 0; i < NUM_ROWS; i++){
        newRows[i] = rows[i].slice();
    }
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
            if (piece[i][j])
                newRows[y + i][x + j] = 1;
    return newRows;
}
TetrisGame.prototype.steerLeft = function () {
    if (!intersects(this.rows, this.currentPiece, this.pieceY, this.pieceX - 1))
        this.pieceX -= 1;
}

TetrisGame.prototype.steerRight = function () {
    if (!intersects(this.rows, this.currentPiece, this.pieceY, this.pieceX + 1))
        this.pieceX += 1;
}

TetrisGame.prototype.steerDown = function () {
    if (!intersects(this.rows, this.currentPiece, this.pieceY + 1, this.pieceX))
        this.pieceY += 1;
}
TetrisGame.prototype.rotateLeft = function () {
    let newPiece = rotateLeft(this.currentPiece);
    if (!intersects(this.rows, newPiece, this.pieceY, this.pieceX))
        this.currentPiece = newPiece;
}

TetrisGame.prototype.rotateRight = function () {
    let newPiece = rotateRight(this.currentPiece);
    if (!intersects(this.rows, newPiece, this.pieceY, this.pieceX))
        this.currentPiece = newPiece;
}
TetrisGame.prototype.letFall = function () {
    while (!intersects(this.rows, this.currentPiece, this.pieceY + 1, this.pieceX))
        this.pieceY += 1;
    this.tick();
}

TetrisGame.prototype.tick = function(){
    if(this.gameOver){
        return false;
    }
    if(intersects(this.rows, this.currentPiece, this.pieceY + 1, this.pieceX)){
        // 블럭이 블럭 또는 바닥 에 닳았음
        this.rows = apply_piece(this.rows, this.currentPiece, this.pieceY, this.pieceX);
        if (intersects(this.rows, this.nextPiece, 0, NUM_COLS / 2 - 2)) {
            console.log("더이상 올라갈 수 없습니다..");
            this.gameOver = true;
        } else {
            console.log("블럭 체인지");
            this.currentPiece = this.nextPiece;
            this.pieceY = 0;
            this.pieceX = NUM_COLS / 2 - 2;
            this.nextPiece = randomPiece();
        }
    }else{
        // 블럭이 바닥에 닳지 않았음
        this.pieceY += 1;
    }
    return true;
}
function rotateLeft(piece) {
    return [
        [piece[0][3], piece[1][3], piece[2][3], piece[3][3]],
        [piece[0][2], piece[1][2], piece[2][2], piece[3][2]],
        [piece[0][1], piece[1][1], piece[2][1], piece[3][1]],
        [piece[0][0], piece[1][0], piece[2][0], piece[3][0]]
    ];
}

function rotateRight(piece) {
    return [
        [piece[3][0], piece[2][0], piece[1][0], piece[0][0]],
        [piece[3][1], piece[2][1], piece[1][1], piece[0][1]],
        [piece[3][2], piece[2][2], piece[1][2], piece[0][2]],
        [piece[3][3], piece[2][3], piece[1][3], piece[0][3]]
    ];
}
function draw_tetrisScore(game, isPaused) {
    let score = game.get_score();
    let scoreElem = document.createElement('div');
    scoreElem.classList.add('tetrisScore');
    scoreElem.innerHTML = `<p>SCORE: ${score} </p>`;
    if(isPaused){
        scoreElem.innerHTML +="<p>PAUSED</p>"
    }
    if(game.get_game_over()){
        scoreElem.innerHTML += '<p>GAME OVER</p>'
    }
    return scoreElem;
}
function draw_tetrisPreview(game){
    let piece = game.get_next_piece();
    let pieceElem = draw_blocks(piece, 4, 4);
    let previewElem = document.createElement('div');
    previewElem.classList.add('tetrisPreview');
    previewElem.appendChild(pieceElem);
    return previewElem;
}

function draw_tetrisUsage(){
    let usageElem = document.createElement('div');
    usageElem.classList.add('tetrisUsage');
    usageElem.innerHTML =
        "<table>" +
        "<tr><th>Cursor Keys</th><td>Steer</td></tr>" +
        "<tr><th>a/d</th><td>Rotate</td></tr>" +
        "<tr><th>Space bar</th><td>Let fall</td></tr>" +
        "<tr><th>Enter</th><td>Toggle pause</td></tr>" +
        "<tr><th>r</th><td>Restart game</td></tr>" +
        "</table>";
    return usageElem;
}

function draw_tetrisLeftPane(game, isPaused){
    let scoreElem = draw_tetrisScore(game, isPaused);
    let previewElem = draw_tetrisPreview(game);
    let usageElem = draw_tetrisUsage();
    let leftPaneElem = document.createElement('div');
    leftPaneElem.classList.add('tetrisLeftPane');
    leftPaneElem.appendChild(previewElem);
    leftPaneElem.appendChild(scoreElem);
    leftPaneElem.appendChild(usageElem);
    return leftPaneElem;
}

function draw_tetrisRightPane(game){
    let boardElem = draw_tetrisBoard(game);
    let rightPaneElem = document.createElement('div');
    rightPaneElem.classList.add('tetrisRightPane');
    rightPaneElem.appendChild(boardElem);
    return rightPaneElem;
}
function draw_blocks(rows, num_rows, num_cols) {
    let boardElem = document.createElement('div');
    for (let i = 0; i < num_rows; i++) {
        for (let j = 0; j < num_cols; j++) {
            let blockElem = document.createElement('div');
            blockElem.classList.add('tetrisBlock');
            if (rows[i][j])
                blockElem.classList.add('habitated');
            blockElem.style.top = (i * BLOCK_HEIGHT) + 'px';
            blockElem.style.left = (j * BLOCK_WIDTH) + 'px';
            boardElem.appendChild(blockElem);
        }
    }
    return boardElem;
}

function draw_tetrisBoard(game){
    let rows = game.get_rows();
    let boardElem = draw_blocks(rows, NUM_ROWS, NUM_COLS);
    boardElem.classList.add('tetrisBoard');
    return boardElem;
}

function draw_tetrisGame(game, isPaused){
    let leftPaneElem = draw_tetrisLeftPane(game, isPaused);
    let rightPaneElem = draw_tetrisRightPane(game);
    let gameElem = document.createElement('div');
    gameElem.classList.add('tetrisGame');
    gameElem.appendChild(leftPaneElem);
    gameElem.appendChild(rightPaneElem);
    return gameElem;
}

function redraw(game, isPaused, containerElem){
    let gameElem = draw_tetrisGame(game, isPaused);
    containerElem.innerHTML = '';
    containerElem.appendChild(gameElem);
}

function tetris_run(containerElem){
    let game = new TetrisGame();
    play();
    function play(){
        let intervalHandler = setInterval(
            function(){
                // 검사 및 블록 점점 떨어지는거
                if(game.tick()){
                    // 블록 그려주기
                    redraw(game, false, containerElem);
                }
            },
            TICK_MS
        );
        function keyHandler(kev){
            console.log(kev);
            if(kev.shiftKey || kev.altKey || kev.metaKey){
                return;
            }
            let consumed = true;
            let mustpause = false; // 정지 버튼
            if(kev.keyCode === KEY_ENTER){
                mustpause = true;
            }else if (kev.keyCode === KEY_R) {
                // 게임 다시 시작
                game = new TetrisGame();
            } else if (kev.keyCode === KEY_LEFT) {
                game.steerLeft();
            } else if (kev.keyCode === KEY_RIGHT) {
                game.steerRight();
            } else if (kev.keyCode === KEY_DOWN) {
                game.steerDown();
            } else if (kev.keyCode === KEY_A) {
                game.rotateLeft();
            } else if (kev.keyCode === KEY_D) {
                game.rotateRight();
            } else if (kev.keyCode === KEY_SPACE) {
                game.letFall();
            } else {
                consumed = false;
            }
            if(consumed){
                kev.preventDefault();
                // 정지함
                if(mustpause){
                    containerElem.removeEventListener('keydown', keyHandler);
                    clearInterval(intervalHandler);
                    pause();
                }else{
                    redraw(game, false, containerElem);
                }
            }
        }
        containerElem.addEventListener('keydown', keyHandler);
        function pause(){
            function keyHandler(kev){
                if(kev.keyCode == KEY_ENTER){
                    containerElem.removeEventListener('keydown', keyHandler);
                    play();
                }
            }
            console.log("작동중");
            containerElem.addEventListener('keydown', keyHandler);
            redraw(game, true, containerElem);
        }
    }
}


document.addEventListener("DOMContentLoaded",function(){
   tetris_run(document.body);
});