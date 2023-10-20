const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const scoreEl = document.querySelector('.score');
const highScoreEl = document.querySelector('.high-score');
const gameOverEl = document.querySelector('.game-over');
const playAgainBtn = document.querySelector('.play-again');

canvas.style.border = '1px solid #fff';

const FPS = 1000 / 15;
let gameLoop;

let gameStarted = false;

let directionsQueue = [];

let boardColor = '#000000';

const headColor = '#fff';
const bodyColor = '#999';

let currentDirection = '';
const directions = {
	RIGHT: 'ArrowRight',
	LEFT: 'ArrowLeft',
	DOWN: 'ArrowDown',
	UP: 'ArrowUp',
};

const width = canvas.width;
const height = canvas.height;
const squareSize = 20;

function drawBoard() {
	context.fillStyle = boardColor;
	context.fillRect(0, 0, width, height);
}

function drawSquare(x, y, color) {
	context.fillStyle = color;
	context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
	context.strokeStyle = boardColor;
	context.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}

let snake = [
	{ x: 2, y: 0 },
	{ x: 1, y: 0 },
	{ x: 0, y: 0 },
];

function drawSnake() {
	snake.forEach((square, index) => {
		const color = index === 0 ? headColor : bodyColor;
		drawSquare(square.x, square.y, color);
	});
}

// how many squares vert / horizontal
const horizontalSquares = width / squareSize;
const verticalSquares = height / squareSize;

let food = createFood();
function createFood() {
	let food = {
		x: Math.floor(Math.random() * horizontalSquares),
		y: Math.floor(Math.random() * verticalSquares),
	};
	while (snake.some((square) => square.x === food.x && square.y === food.y)) {
		createFood();
		// calling create again instead of repeating obj
	}
	return food;
}

function drawFood() {
	drawSquare(food.x, food.y, '#f95700');
}

document.addEventListener('keydown', setDirection);
function setDirection(e) {
	const newDirection = e.key;
	const oldDirection = currentDirection;
	if (
		(newDirection === directions.LEFT && oldDirection !== directions.RIGHT) ||
		(newDirection === directions.RIGHT && oldDirection !== directions.LEFT) ||
		(newDirection === directions.UP && oldDirection !== directions.DOWN) ||
		(newDirection === directions.DOWN && oldDirection !== directions.UP)
	) {
		if (!gameStarted) {
			gameStarted = true;
			gameLoop = setInterval(frame, FPS);
		}
		directionsQueue.push(newDirection);
	}
}

function moveSnake() {
	if (!gameStarted) return;
	const head = { ...snake[0] };
	if (directionsQueue.length) {
		currentDirection = directionsQueue.shift();
	}
	switch (currentDirection) {
		case directions.RIGHT:
			head.x += 1;
			break;
		case directions.LEFT:
			head.x -= 1;
			break;
		case directions.UP:
			head.y -= 1;
			break;
		case directions.DOWN:
			head.y += 1;
			break;
	}
	if (hasEatenFood()) {
		food = createFood();
	} else {
		// remove tail
		snake.pop();
	}

	// unshift new head
	snake.unshift(head);
}
function hasEatenFood() {
	const head = snake[0];
	return head.x === food.x && head.y === food.y;
}

const initialSnakeLength = snake.length;
let score = 0;
let highScore = localStorage.getItem('high-score') || 0;
function renderScore() {
	score = snake.length - initialSnakeLength;
	scoreEl.innerHTML = `⭐ ${score}`;
	highScoreEl.innerHTML = `🏆 ${highScore}`;
}

function hitWall() {
	const head = snake[0];

	return (
		head.x < 0 ||
		head.x >= horizontalSquares ||
		head.y < 0 ||
		head.y >= verticalSquares
	);
}

function hitSelf() {
	const snakeBody = [...snake];
	const head = snakeBody.shift();
	return snakeBody.some((square) => square.x === head.x && square.y === head.y);
}

function gameOver() {
	// select score and high score el
	const scoreEl = document.querySelector('.game-over-score .current');
	const highScoreEl = document.querySelector('.game-over-score .high');

	// calculate the high score
	highScore = Math.max(score, highScore);
	localStorage.setItem('high-score', highScore);

	// update the score and high score el
	scoreEl.innerHTML = `⭐ ${score}`;
	highScoreEl.innerHTML = `🏆 ${highScore}`;

	// show game over el
	gameOverEl.classList.remove('hide');
}

function frame() {
	drawBoard();
	drawSquare();
	drawFood();
	moveSnake();
	drawSnake();
	renderScore();

	if (hitWall() || hitSelf()) {
		clearInterval(gameLoop);
		gameOver();
	}
}

// gameLoop = setInterval(frame, FPS);
frame();

playAgainBtn.addEventListener('click', restartGame);
function restartGame() {
  // reset snake length and position
  snake = [
    { x: 2, y: 0 }, // Head
    { x: 1, y: 0 }, // Body
    { x: 0, y: 0 }, // Tail
  ];

  // reset directions
  currentDirection = '';
  directionsQueue = [];

  // hide the game over screen
  gameOverEl.classList.add('hide');

  // reset the gameStarted state to false
  gameStarted = false;

  // re-draw everything
  frame();
}