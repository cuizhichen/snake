// TODO
// 1. 吃身体失败
// 2. 食物不出现在身体里

const app = document.querySelector("#app");

const canvas = document.createElement("canvas");
canvas.classList.add("main-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1200;
canvas.height = 804;
app.appendChild(canvas);

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

const keyCodeMap = Object.fromEntries(
  Object.entries(keyMap).map((r) => r.reverse())
);
// 37 -> left
// 38 -> up
// 39 -> right
// 40 -> down
let keysDown = keyMap.right;
let animationFrame = null;
let pause = false;
// TODO: 记录点击方向键
let keydownQueue = [];

window.addEventListener("keydown", ({ keyCode }) => {
  if (keyCodeMap[keyCode]) {
    keydownQueue.push(keyCode);
  }
});

const foodReset = () => {
  // food.x = FOOD_WIDTH + Math.random() * (canvas.width - FOOD_WIDTH * 3);
  // food.y = FOOD_WIDTH + Math.random() * (canvas.height - FOOD_WIDTH * 3) + 32;
  food.x =
    BORDER_WIDTH +
    Math.floor(
      ((canvas.width - BORDER_WIDTH * 3) / SNAKE_WIDTH) * Math.random()
    ) *
      SNAKE_WIDTH +
    FOOD_WIDTH / 2;
  food.y =
    BORDER_WIDTH +
    Math.floor(
      ((canvas.height - BORDER_WIDTH * 3) / SNAKE_WIDTH) * Math.random()
    ) *
      SNAKE_WIDTH +
    FOOD_WIDTH / 2;
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
  ctx.fillText("v-0.0.3", 196, 16);
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
    first[0] + FOOD_WIDTH / 2 >= food.x &&
    food.x + FOOD_WIDTH / 2 >= first[0] &&
    first[1] + FOOD_WIDTH / 2 >= food.y &&
    food.y + FOOD_WIDTH / 2 >= first[1]
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
    [canvas.width / 2 + 30, canvas.height / 2 - 6],
    [canvas.width / 2 - 30, canvas.height / 2 - 6, keyMap.right],
  ];
  scores = 0;
  speed = 1;
  keydownQueue = [];
  keysDown = keyMap.right;
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

const findNodeInSnakeBody = (x, y) => {
  let prev = null;

  return snake.bodyNode.some((node) => {
    if (!prev) {
      switch (snake.bodyNode[1][2]) {
        case keyMap.down:
          y -= SNAKE_WIDTH_2;
          prev = [node[0], node[1] - SNAKE_WIDTH];
          break;
        case keyMap.up:
          y += SNAKE_WIDTH_2;
          prev = [node[0], node[1] + SNAKE_WIDTH];
          break;
        case keyMap.left:
          x += SNAKE_WIDTH_2;
          prev = [node[0] + SNAKE_WIDTH, node[1]];
          break;
        case keyMap.right:
          x -= SNAKE_WIDTH_2;
          prev = [node[0] - SNAKE_WIDTH, node[1]];
          break;
        default:
          break;
      }

      return;
    }

    if (node[0] === prev[0] && node[0] === x) {
      return (y >= node[1] && y <= prev[1]) || (y <= node[1] && y >= prev[1]);
    }
    if (node[1] === prev[1] && node[1] === y) {
      return (x >= node[0] && x <= prev[0]) || (x <= node[0] && x >= prev[0]);
    }
    prev = node;
  });
};

const checkNodeInSnakeBody = () => {
  if (findNodeInSnakeBody(snake.bodyNode[0][0], snake.bodyNode[0][1])) {
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
  checkNodeInSnakeBody();
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
  if (pause) return;

  if (keydownQueue.length) {
    if (keydownQueue.every((r) => r === keysDown)) {
      keydownQueue.push(keysDown);
    }

    const walkKey = () => {
      const key = keydownQueue.shift();
      if (!key) return;
      if (
        (key === 37 && keysDown !== 39) ||
        (key === 38 && keysDown !== 40) ||
        (key === 39 && keysDown !== 37) ||
        (key === 40 && keysDown !== 38)
      ) {
        keysDown = key;
      }
      update();
      render();
      requestAnimationFrame(walkKey);
    };
    walkKey();

    // keydownQueue.forEach((key) => {
    //   if (
    //     (key === 37 && keysDown !== 39) ||
    //     (key === 38 && keysDown !== 40) ||
    //     (key === 39 && keysDown !== 37) ||
    //     (key === 40 && keysDown !== 38)
    //   ) {
    //     keysDown = key;
    //   }
    //   if (keydownQueue.length >= 2) {
    //     console.log(keydownQueue);
    //   }
    //   update();
    //   render();
    // });
    // keydownQueue = [];
  } else {
    update();
    render();
  }

  setTimeout(() => {
    animationFrame = requestAnimationFrame(walk);
  }, 102 - speed * 2);
};

init();
walk();

// 暂停逻辑
const canvas2 = document.createElement("canvas");
canvas2.classList.add("pause-canvas");
app.appendChild(canvas2);
const ctx2 = canvas2.getContext("2d");
canvas2.width = 20;
canvas2.height = 26;

ctx2.lineWidth = 4;
ctx2.strokeStyle = "rgb(70, 70, 70)";

const renderPause = () => {
  ctx2.fillStyle = "rgb(70, 70, 70)";
  ctx2.fillRect(0, 0, 8, 26);
  ctx2.fillRect(12, 0, 8, 26);
};

const renderContinue = () => {
  ctx2.beginPath();
  ctx2.moveTo(3, 4);
  ctx2.lineTo(16, 13);
  ctx2.lineTo(3, 22);
  ctx2.closePath();
  ctx2.stroke();
};

const canvas3 = document.createElement("canvas");
canvas3.classList.add("continue-mask-canvas");
const ctx3 = canvas3.getContext("2d");
app.appendChild(canvas3);
canvas3.width = 1200;
canvas3.height = 800;

const renderContinueMask = () => {
  ctx3.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx3.fillRect(0, 0, canvas.width, canvas.height);

  ctx3.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx3.lineWidth = 30;
  ctx3.beginPath();
  ctx3.moveTo(550, 300);
  ctx3.lineTo(750, 400);
  ctx3.lineTo(550, 500);
  ctx3.closePath();
  ctx3.fill();

  ctx3.font = "16px Helvetica";
  ctx3.fillText("已暂停，按空格可继续。", 560, 550);
};

const cleanContinueMask = () => {
  ctx3.clearRect(0, 0, canvas.width, canvas.height);
};

renderPause();

const handlePause = () => {
  pause = !pause;
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  if (pause) {
    renderContinue();
    renderContinueMask();
    cancelAnimationFrame(animationFrame);
    ctx.fillText(keyCodeMap[keysDown], 256, 16);
  } else {
    renderPause();
    cleanContinueMask();
    requestAnimationFrame(walk);
  }
};

window.addEventListener("keydown", (e) => {
  if (e.keyCode === 32) handlePause();
});

canvas2.addEventListener("click", handlePause);
