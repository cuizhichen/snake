const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1200;
canvas.height = 800;
document.body.appendChild(canvas);

const BORDER_WIDTH = 6;
const SNAKE_WIDTH = 12;
const FOOD_WIDTH = 12;
const SNAKE_WIDTH_2 = SNAKE_WIDTH / 2;
let speed = 1;

const snake = {
  speed: 12,
  direction: "",
  bodyNode: [],
  length: 48,
};

const food = {
  x: 0,
  y: 0,
};
let scores = 0;
const keyMap = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
};
// 37 -> left
// 38 -> up
// 39 -> right
// 40 -> down
let prevKeysDown = keyMap.right;
let keysDown = keyMap.right;
let temporaryKeysDown = null;

window.addEventListener("keydown", ({ keyCode }) => {
  // 存在点击比时间间隔快的可能性
  temporaryKeysDown = keyCode;
  prevKeysDown = keysDown;
});

const foodReset = () => {
  food.x = FOOD_WIDTH + Math.random() * (canvas.width - FOOD_WIDTH * 3);
  food.y = FOOD_WIDTH + Math.random() * (canvas.height - FOOD_WIDTH * 3);
};

const render = () => {
  ctx.clearRect(
    BORDER_WIDTH,
    BORDER_WIDTH,
    canvas.width - BORDER_WIDTH * 2,
    canvas.height - BORDER_WIDTH * 2
  );
  ctx.beginPath();
  ctx.lineWidth = SNAKE_WIDTH;
  for (let i = 0; i < snake.bodyNode.length; i++) {
    if (i === 0) {
      ctx.moveTo(...snake.bodyNode[i]);
    } else {
      ctx.lineTo(...snake.bodyNode[i]);
    }
  }

  ctx.stroke();

  ctx.fillRect(
    food.x - FOOD_WIDTH / 2,
    food.y - FOOD_WIDTH / 2,
    FOOD_WIDTH,
    FOOD_WIDTH
  );
  ctx.font = "16px Helvetica";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgb(70, 70, 70)";
  ctx.fillText(`Scores: ${scores}`, 16, 16);
  ctx.fillText(`Speed: ${speed}`, 110, 16);
  ctx.fillText("v-0.0.1", 196, 16);
};

const updateFirstNode = () => {
  const item = snake.bodyNode[0];
  const isNewNode = snake.bodyNode[1][2] !== keysDown;
  if (isNewNode) {
    item[2] = keysDown;
  }

  switch (keysDown) {
    case 37:
      if (isNewNode) {
        item[1] =
          snake.bodyNode[1][2] === keyMap.up
            ? item[1] + SNAKE_WIDTH_2
            : item[1] - SNAKE_WIDTH_2;

        snake.bodyNode.unshift([item[0] - SNAKE_WIDTH_2, item[1]]);
      }
      snake.bodyNode[0][0] -= snake.speed;
      break;
    case 38:
      if (isNewNode) {
        item[0] =
          snake.bodyNode[1][2] === keyMap.left
            ? item[0] + SNAKE_WIDTH_2
            : item[0] - SNAKE_WIDTH_2;

        snake.bodyNode.unshift([item[0], item[1] - SNAKE_WIDTH_2]);
      }
      snake.bodyNode[0][1] -= snake.speed;
      break;
    case 39:
      if (isNewNode) {
        item[1] =
          snake.bodyNode[1][2] === keyMap.up
            ? item[1] + SNAKE_WIDTH_2
            : item[1] - SNAKE_WIDTH_2;

        snake.bodyNode.unshift([item[0] + SNAKE_WIDTH_2, item[1]]);
      }
      snake.bodyNode[0][0] += snake.speed;
      break;
    case 40:
      if (isNewNode) {
        item[0] =
          snake.bodyNode[1][2] === keyMap.left
            ? item[0] + SNAKE_WIDTH_2
            : item[0] - SNAKE_WIDTH_2;

        snake.bodyNode.unshift([item[0], item[1] + SNAKE_WIDTH_2]);
      }
      snake.bodyNode[0][1] += snake.speed;
      break;

    default:
      break;
  }
};

const checkLastNode = () => {
  const len = snake.bodyNode.length;
  const l1x = snake.bodyNode[len - 1][0];
  const l1y = snake.bodyNode[len - 1][1];
  const l2x = snake.bodyNode[len - 2][0];
  const l2y = snake.bodyNode[len - 2][1];

  if (
    l1x + SNAKE_WIDTH_2 >= l2x &&
    l1y + SNAKE_WIDTH_2 >= l2y &&
    l2x + SNAKE_WIDTH_2 >= l1x &&
    l2y + SNAKE_WIDTH_2 >= l1y
  ) {
    switch (snake.bodyNode[len - 1][2]) {
      case 37:
      case 39:
        const newY =
          snake.bodyNode[len - 2][2] === 38
            ? snake.bodyNode[len - 1][1] + SNAKE_WIDTH_2
            : snake.bodyNode[len - 1][1] - SNAKE_WIDTH_2;
        snake.bodyNode[len - 2][1] = newY;
        break;

      case 38:
      case 40:
        const newX =
          snake.bodyNode[len - 2][2] === 37
            ? snake.bodyNode[len - 1][0] + SNAKE_WIDTH_2
            : snake.bodyNode[len - 1][0] - SNAKE_WIDTH_2;
        snake.bodyNode[len - 2][0] = newX;
        break;

      default:
        break;
    }
    snake.bodyNode.pop();
  }

  return (
    l1x + SNAKE_WIDTH / 2 >= l2x &&
    l1y + SNAKE_WIDTH / 2 >= l2y &&
    l2x + SNAKE_WIDTH / 2 >= l1x &&
    l2y + SNAKE_WIDTH / 2 >= l1y
  );
};

const updateLastNode = () => {
  const len = snake.bodyNode.length;
  const last = snake.bodyNode[len - 1];
  switch (last[2]) {
    case 37:
      last[0] -= snake.speed;
      break;
    case 38:
      last[1] -= snake.speed;
      break;
    case 39:
      last[0] += snake.speed;
      break;
    case 40:
      last[1] += snake.speed;
      break;
    default:
      break;
  }
};

const handleEatFood = () => {
  const first = snake.bodyNode[0];
  if (
    first[0] + SNAKE_WIDTH_2 + FOOD_WIDTH / 2 >= food.x &&
    food.x + SNAKE_WIDTH_2 + FOOD_WIDTH / 2 >= first[0] &&
    first[1] + SNAKE_WIDTH_2 + FOOD_WIDTH / 2 >= food.y &&
    food.y + SNAKE_WIDTH_2 + FOOD_WIDTH / 2 >= first[1]
  ) {
    const last = snake.bodyNode[snake.bodyNode.length - 1];
    switch (last[2]) {
      case 37:
        last[0] += snake.speed;
        break;
      case 38:
        last[1] += snake.speed;
        break;
      case 39:
        last[0] -= snake.speed;
        break;
      case 40:
        last[1] -= snake.speed;
        break;
      default:
        break;
    }
    scores++;
    let newSpeed = Math.ceil(scores / 5);
    speed = newSpeed >= 39 ? 39 : newSpeed;
    foodReset();
  }
};

const reset = () => {
  snake.bodyNode = [
    [canvas.width / 2 + 24, canvas.height / 2],
    [canvas.width / 2 - 24, canvas.height / 2, keyMap.right],
  ];
  scores = 0;
  speed = 1;
  foodReset();
};

const handleBoundary = () => {
  const first = snake.bodyNode[0];
  if (
    first[0] + BORDER_WIDTH > canvas.width ||
    first[0] - BORDER_WIDTH < 0 ||
    first[1] + BORDER_WIDTH > canvas.height ||
    first[1] - BORDER_WIDTH < 0
  ) {
    alert(`Game Over! Eat ${scores} food 🎉🎉🎉!`);
    reset();
  }
};

const update = () => {
  handleBoundary();
  updateFirstNode();
  updateLastNode();
  checkLastNode();
  handleEatFood();
};

const init = () => {
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeStyle = "rgb(55, 55, 55)";
  ctx.strokeRect(
    BORDER_WIDTH / 2,
    BORDER_WIDTH / 2,
    canvas.width - BORDER_WIDTH,
    canvas.height - BORDER_WIDTH
  );

  reset();
};

const walk = () => {
  if (
    (temporaryKeysDown === 37 && keysDown !== 39) ||
    (temporaryKeysDown === 38 && keysDown !== 40) ||
    (temporaryKeysDown === 39 && keysDown !== 37) ||
    (temporaryKeysDown === 40 && keysDown !== 38)
  ) {
    keysDown = temporaryKeysDown;
  }

  update();
  render();

  setTimeout(() => {
    requestAnimationFrame(walk);
  }, 102 - speed * 2);
};

init();
render();
walk();
