const BATTERY_DRAIN_RATE = 10;
const POWER_UP_BATTERY_BOOST = 30;
const GRID_SIZE = 5;

const directions = ["north", "east", "south", "west"];
const buttons = ["button-forward", "button-left", "button-right"];

const buttonLeft = document.getElementById("button-left");
const buttonRight = document.getElementById("button-right");
const buttonForward = document.getElementById("button-forward");
const gameResetButton = document.getElementById("reset-game-button");

const batteryLevelElement = document.getElementById("battery-level");

// INIT
const setInitialGameState = () => {
  return {
    activePowerUp: null,
    batteryLevel: 100,
    powerUpPosition: null,
    reverseMovesRemaining: 0,
    robotDirection: "north",
    robotPosition: { x: 2, y: 2 },
  };
};

let gameState = setInitialGameState();

const initGame = () => {
  gameState.powerUpPosition = getRandomCellPosition();

  createGrid();
  renderBatteryLevel();
  renderRobot();
  createPowerUpElement();
  updatePowerUpPosition();
};

const createGrid = () => {
  const gridElement = document.getElementById("grid");
  gridElement.innerHTML = ""; // Clear the grid

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = `cell-${row}-${col}`;
      gridElement.appendChild(cell);
    }
  }
};

// BATTERY

const drainBattery = () => {
  gameState.batteryLevel = Math.max(
    gameState.batteryLevel - BATTERY_DRAIN_RATE,
    0
  );

  if (gameState.batteryLevel <= 0) {
    document.getElementById("game-message").innerText =
      "Game over, battery depleted!";
    document.getElementById("reset-game-button").style.display = "block";
    disableControls();

    gameState.batteryLevel = 0;
  }
};

const updateBatteryLevel = () => {
  return Math.min(gameState.batteryLevel + POWER_UP_BATTERY_BOOST, 100);
};

const renderBatteryLevel = () => {
  batteryLevelElement.innerText = `${gameState.batteryLevel}%`;
};

const renderRobot = () => {
  let robot = document.getElementById("robot");

  if (!robot) {
    robot = document.createElement("img");
    robot.alt = "game-cell-robot";
    robot.src = "https://i.ibb.co/FVvvvdh/robot.png";
    robot.classList.add("robot-image");
    robot.id = "robot";
    document.getElementById("grid").appendChild(robot);
  }

  const robotCell = document.getElementById(
    `cell-${gameState.robotPosition.y}-${gameState.robotPosition.x}`
  );

  robotCell.appendChild(robot);
  robot.style.transform = `rotate(${getRotation(gameState.robotDirection)}deg)`;

  collectPowerUp();
};

// HELPERS
const getRotation = (direction) => {
  switch (direction) {
    case "north":
      return 0;
    case "east":
      return 90;
    case "south":
      return 180;
    case "west":
      return 270;
    default:
      return 0;
  }
};

const reverseDirection = (direction) => {
  switch (direction) {
    case "north":
      return "south";
    case "east":
      return "west";
    case "south":
      return "north";
    case "west":
      return "east";
  }
};

const getRandomPowerUpType = () => {
  const powerUps = ["move", "teleport", "reverse"];
  return powerUps[Math.floor(Math.random() * powerUps.length)];
};

const getRandomCellPosition = () => {
  let newPosition = { x: 0, y: 0 };
  do {
    newPosition.x = Math.floor(Math.random() * GRID_SIZE);
    newPosition.y = Math.floor(Math.random() * GRID_SIZE);
  } while (
    newPosition.x === gameState.robotPosition.x &&
    newPosition.y === gameState.robotPosition.y
  );
  return newPosition;
};

// CONTROLS

const disableControls = (condition = true) => {
  buttons.forEach((button) => {
    document.getElementById(button).disabled = condition;
  });
};

const moveForward = () => {
  let steps = gameState.activePowerUp === "move" ? 2 : 1;

  for (let i = 0; i < steps; i++) {
    const { x, y } = gameState.robotPosition;
    const moveDirection =
      gameState.reverseMovesRemaining > 0
        ? reverseDirection(gameState.robotDirection)
        : gameState.robotDirection;

    switch (moveDirection) {
      case "north":
        gameState.robotPosition.y = y > 0 ? y - 1 : GRID_SIZE - 1;
        break;
      case "east":
        gameState.robotPosition.x = x < GRID_SIZE - 1 ? x + 1 : 0;
        break;
      case "south":
        gameState.robotPosition.y = y < GRID_SIZE - 1 ? y + 1 : 0;
        break;
      case "west":
        gameState.robotPosition.x = x > 0 ? x - 1 : GRID_SIZE - 1;
        break;
    }
  }

  drainBattery();
  renderBatteryLevel();

  if (gameState.activePowerUp === "move") gameState.activePowerUp = null;

  if (gameState.reverseMovesRemaining > 0) {
    gameState.reverseMovesRemaining--;
    if (gameState.reverseMovesRemaining === 0) {
      document.getElementById("power-up-message").innerText =
        "Reverse controls have worn off!";
    }
  }

  renderRobot();
};

const rotateLeft = () => {
  const currentIndex = directions.indexOf(gameState.robotDirection);
  gameState.robotDirection = directions[(currentIndex + 3) % 4];
  renderRobot();
};

const rotateRight = () => {
  const currentIndex = directions.indexOf(gameState.robotDirection);
  gameState.robotDirection = directions[(currentIndex + 1) % 4];
  renderRobot();
};

// POWER UPS

const createPowerUpElement = () => {
  const powerUp = document.createElement("div");
  powerUp.classList.add("power-up");
  document.getElementById("grid").appendChild(powerUp);
};
const updatePowerUpPosition = () => {
  const { x, y } = gameState.powerUpPosition;
  const powerUp = document.querySelector(".power-up");
  const powerUpCell = document.getElementById(`cell-${y}-${x}`);

  if (powerUpCell && powerUp) {
    powerUpCell.appendChild(powerUp);
  }
};

const applyPowerUp = (powerUp) => {
  const messageElement = document.getElementById("power-up-message");

  gameState.activePowerUp = null;

  switch (powerUp) {
    case "move":
      gameState.activePowerUp = "move";
      messageElement.innerText =
        "Move Power-Up Collected! Next move is two steps!";
      break;
    case "teleport":
      gameState.robotPosition = getRandomCellPosition();
      messageElement.innerText = "Teleport Power-Up Collected! Teleporting...";
      break;
    case "reverse":
      gameState.reverseMovesRemaining = 3;
      messageElement.innerText =
        "Reverse Power-Up Collected! Controls are reversed for 3 moves!";
      break;
  }

  renderRobot();
};

const collectPowerUp = () => {
  if (!gameState.powerUpPosition) return;

  if (
    gameState.robotPosition.x === gameState.powerUpPosition.x &&
    gameState.robotPosition.y === gameState.powerUpPosition.y
  ) {
    gameState.powerUpPosition = getRandomCellPosition();
    const powerUp = getRandomPowerUpType();

    applyPowerUp(powerUp);
    updatePowerUpPosition();

    gameState.batteryLevel = updateBatteryLevel();

    renderBatteryLevel();
  }
};

// EVENT HANLDERS

const handleKeyPress = (event) => {
  if (gameState.batteryLevel <= 0) return;

  let buttonId;
  switch (event.key) {
    case "ArrowUp":
      moveForward();
      buttonId = "button-forward";

      break;
    case "ArrowLeft":
      rotateLeft();
      buttonId = "button-left";

      break;
    case "ArrowRight":
      rotateRight();
      buttonId = "button-right";

      break;
    default:
      break;
  }

  highlightButtonPress(buttonId);
};

const highlightButtonPress = (buttonId) => {
  if (!buttonId) return;
  document.getElementById(buttonId).classList.add("active");
  setTimeout(() => {
    document.getElementById(buttonId).classList.remove("active");
  }, 200);
};

buttonLeft.addEventListener("click", rotateLeft);
buttonRight.addEventListener("click", rotateRight);
buttonForward.addEventListener("click", moveForward);

document.addEventListener("keydown", handleKeyPress);

const resetGame = () => {
  gameState = setInitialGameState();
  initGame();

  document.getElementById("game-message").innerText = "";
  gameResetButton.style.display = "none";

  disableControls(false);
};

gameResetButton.addEventListener("click", () => {
  resetGame();
});

initGame();
