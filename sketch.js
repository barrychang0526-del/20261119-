
let characterSprite;
let walkSprite;
let magicSprite;
let magicEffectSprite;
let bgImage;

// ================================
// 角色設定
// ================================

let characterX;
let facingDirection = 1;
let isWalking = false;
let isCasting = false;

let magicStartFrame = 0;
let magicDirection = 1;
let spaceIsDown = false;

let activeEffects = [];

// ================================
// 背景設定
// ================================

let cameraX = 0;
const backgroundCount = 3;

// ================================
// 精靈圖設定
// ================================

// 站立動畫
const frameCountInSprite = 10;
const frameWidth = 1395 / 10;
const frameHeight = 196;

// 走路動畫
const walkFrameCount = 9;
const walkFrameWidth = 1246 / 9;
const walkFrameHeight = 198;

// 施法動畫
const magicFrameCount = 4;
const magicFrameWidth = 1039 / 4;
const magicFrameHeight = 146;

// 魔法特效
const effectFrameCount = 5;
const effectFrameWidth = 740 / 5;
const effectFrameHeight = 19;

const framesPerStep = 8;

// ================================
// 動態場景設定
// ================================

let clouds = [];
let fireflies = [];
let grasses = [];

// ================================
// 載入圖片
// ================================

function preload() {

  bgImage = loadImage("BG/BD-1.png");

  characterSprite = loadImage(
    "1/stop/stop.png"
  );

  walkSprite = loadImage(
    "1/walk/walk.png"
  );

  magicSprite = loadImage(
    "1/magic/magic.png"
  );

  magicEffectSprite = loadImage(
    "1/magic_effect/magic_effect.png"
  );
}

// ================================
// 初始化
// ================================

function setup() {

  createCanvas(windowWidth, windowHeight);

  imageMode(CENTER);

  frameRate(60);

  // 角色初始位置
  characterX = width * 2 / 3;

  // 從中間背景開始
  cameraX = 0;

  createEnvironment();
}

// ================================
// 建立背景環境
// ================================

function createEnvironment() {

  clouds = [];
  fireflies = [];
  grasses = [];

  // 三張背景總寬度
  const worldWidth = width * backgroundCount;

  // 固定位置的雲朵
  for (let i = 0; i < 12; i++) {

    clouds.push({

      worldX: random(worldWidth),

      y: random(
        height * 0.08,
        height * 0.28
      ),

      size: random(40, 90),

      phase: random(TWO_PI)

    });
  }

  // 固定位置的螢火蟲
  for (let i = 0; i < 36; i++) {

    fireflies.push({

      worldX: random(worldWidth),

      y: random(
        height * 0.35,
        height * 0.8
      ),

      size: random(2, 5),

      phase: random(TWO_PI)

    });
  }

  // 固定在地面上的草
  for (let i = 0; i < 120; i++) {

    grasses.push({

      worldX: random(worldWidth),

      size: random(6, 16),

      phase: random(TWO_PI)

    });
  }
}

// ================================
// 世界座標轉換
// ================================

function worldToScreen(worldX) {

  return worldX - width - cameraX;
}

// ================================
// 主遊戲畫面
// ================================

function draw() {

  const dt = min(deltaTime / (1000 / 60), 2);

  // ================================
  // 鍵盤偵測
  // ================================

  const movingRight = keyIsDown(RIGHT_ARROW);
  const movingLeft = keyIsDown(LEFT_ARROW);

  isWalking = movingRight !== movingLeft;

  // 移動速度
  const movementSpeed = constrain(
    width * 0.004,
    2,
    8
  );

  const step = movementSpeed * dt;

  // ================================
  // 背景與角色移動
  // ================================

  if (movingRight && !movingLeft) {

    facingDirection = 1;

    // 背景尚未到達最右邊
    if (cameraX < width) {

      cameraX = min(
        cameraX + step,
        width
      );

    } else {

      // 背景停止，角色向右移動
      characterX += step;

    }

  } else if (movingLeft && !movingRight) {

    facingDirection = -1;

    // 背景尚未到達最左邊
    if (cameraX > -width) {

      cameraX = max(
        cameraX - step,
        -width
      );

    } else {

      // 背景停止，角色向左移動
      characterX -= step;

    }
  }

  // ================================
  // 繪製背景與環境動畫
  // ================================

  drawScrollingBackground();

  drawClouds();

  drawFireflies();

  drawGrass();

  // ================================
  // 角色尺寸
  // ================================

  // 固定為畫布高度的 1/3
  const characterHeight = height / 3;

  const characterWidth =
    characterHeight * frameWidth / frameHeight;

  // ================================
  // 施法動畫完成判斷
  // ================================

  if (
    isCasting &&
    frameCount - magicStartFrame >=
    magicFrameCount * framesPerStep
  ) {

    isCasting = false;

    activeEffects.push({

      x:
        characterX +
        magicDirection * characterWidth / 2,

      y:
        height - characterHeight * 0.58,

      direction: magicDirection

    });
  }

  // ================================
  // 選擇精靈動畫
  // ================================

  let activeSprite;
  let activeFrameCount;
  let activeFrameWidth;
  let activeFrameHeight;

  if (isCasting) {

    activeSprite = magicSprite;

    activeFrameCount = magicFrameCount;
    activeFrameWidth = magicFrameWidth;
    activeFrameHeight = magicFrameHeight;

  } else if (isWalking) {

    activeSprite = walkSprite;

    activeFrameCount = walkFrameCount;
    activeFrameWidth = walkFrameWidth;
    activeFrameHeight = walkFrameHeight;

  } else {

    activeSprite = characterSprite;

    activeFrameCount = frameCountInSprite;
    activeFrameWidth = frameWidth;
    activeFrameHeight = frameHeight;

  }

  // ================================
  // 動畫影格
  // ================================

  let frameIndex;

  if (isCasting) {

    frameIndex = min(
      floor(
        (frameCount - magicStartFrame) /
        framesPerStep
      ),
      magicFrameCount - 1
    );

  } else {

    frameIndex =
      floor(frameCount / framesPerStep) %
      activeFrameCount;

  }

  const sourceX =
    frameIndex * activeFrameWidth;

  // ================================
  // 等比例縮放
  // ================================

  const activeHeight = height / 3;

  const activeWidth =
    activeHeight *
    activeFrameWidth / activeFrameHeight;

  // ================================
  // 限制角色位置
  // ================================

  characterX = constrain(
    characterX,
    activeWidth / 2,
    max(
      activeWidth / 2,
      width - activeWidth / 2
    )
  );

  // 保持角色底部貼地
  const characterY =
    height - activeHeight / 2;

  // ================================
  // 角色陰影
  // ================================

  push();

  noStroke();

  fill(0, 0, 0, 45);

  ellipse(
    characterX,
    height - 5,
    characterWidth * 0.8,
    10
  );

  pop();

  // ================================
  // 繪製角色
  // ================================

  push();

  translate(characterX, characterY);

  scale(
    isCasting
      ? magicDirection
      : facingDirection,
    1
  );

  image(
    activeSprite,
    0,
    0,
    activeWidth,
    activeHeight,
    sourceX,
    0,
    activeFrameWidth,
    activeFrameHeight
  );

  pop();

  // ================================
  // 魔法特效
  // ================================

  drawMagicEffects(characterHeight);
}

// ================================
// 三張背景水平串接
// ================================

function drawScrollingBackground() {

  push();

  imageMode(CORNER);

  for (let i = 0; i < backgroundCount; i++) {

    const worldX = i * width;

    const screenX = worldToScreen(worldX);

    image(
      bgImage,
      screenX,
      0,
      width,
      height
    );
  }

  pop();
}

// ================================
// 動態雲朵
// ================================

function drawClouds() {

  push();

  noStroke();

  for (let cloud of clouds) {

    // 固定在背景上的世界位置
    // 加入輕微的自然漂浮

    const sway =
      sin(frameCount * 0.006 + cloud.phase) * 8;

    const x =
      worldToScreen(cloud.worldX) + sway;

    const y =
      cloud.y +
      sin(frameCount * 0.004 + cloud.phase) * 3;

    if (x < -150 || x > width + 150) {
      continue;
    }

    fill(255, 255, 255, 105);

    ellipse(
      x,
      y,
      cloud.size,
      cloud.size * 0.42
    );

    ellipse(
      x - cloud.size * 0.25,
      y + 5,
      cloud.size * 0.62,
      cloud.size * 0.35
    );

    ellipse(
      x + cloud.size * 0.23,
      y + 3,
      cloud.size * 0.7,
      cloud.size * 0.4
    );
  }

  pop();
}

// ================================
// 螢火蟲光點動畫
// ================================

function drawFireflies() {

  push();

  noStroke();

  for (let fly of fireflies) {

    const time =
      frameCount * 0.025 + fly.phase;

    // 固定在背景附近漂浮
    const x =
      worldToScreen(fly.worldX) +
      sin(time) * 8;

    const y =
      fly.y +
      cos(time * 0.8) * 7;

    if (x < -30 || x > width + 30) {
      continue;
    }

    const alpha =
      80 + sin(time * 2) * 65;

    // 外層柔光
    fill(
      255,
      230,
      120,
      alpha * 0.25
    );

    ellipse(
      x,
      y,
      fly.size * 4
    );

    // 中心光點
    fill(
      255,
      245,
      180,
      alpha
    );

    ellipse(
      x,
      y,
      fly.size
    );
  }

  pop();
}

// ================================
// 草叢擺動
// ================================

function drawGrass() {

  push();

  noFill();

  stroke(50, 135, 65, 135);

  strokeWeight(1.5);

  for (let blade of grasses) {

    const x =
      worldToScreen(blade.worldX);

    if (x < -20 || x > width + 20) {
      continue;
    }

    // 草根固定，只讓頂端擺動
    const sway =
      sin(
        frameCount * 0.035 +
        blade.phase
      ) * 3;

    line(
      x,
      height,
      x + sway,
      height - blade.size
    );
  }

  pop();
}

// ================================
// 魔法特效
// ================================

function drawMagicEffects(characterHeight) {

  const effectScale =
    characterHeight / frameHeight;

  const effectWidth =
    effectFrameWidth * effectScale;

  const effectHeight =
    effectFrameHeight * effectScale;

  const effectSpeed =
    max(6, width * 0.008);

  for (
    let i = activeEffects.length - 1;
    i >= 0;
    i--
  ) {

    const effect = activeEffects[i];

    effect.x +=
      effect.direction * effectSpeed;

    if (
      effect.x > width + effectWidth ||
      effect.x < -effectWidth
    ) {

      activeEffects.splice(i, 1);
      continue;

    }

    const effectFrameIndex =
      floor(frameCount / framesPerStep) %
      effectFrameCount;

    push();

    translate(effect.x, effect.y);

    scale(effect.direction, 1);

    image(
      magicEffectSprite,
      0,
      0,
      effectWidth,
      effectHeight,
      effectFrameIndex * effectFrameWidth,
      0,
      effectFrameWidth,
      effectFrameHeight
    );

    pop();
  }
}

// ================================
// 鍵盤按下
// ================================

function keyPressed() {

  if (keyCode === RIGHT_ARROW) {

    facingDirection = 1;

    return false;
  }

  if (keyCode === LEFT_ARROW) {

    facingDirection = -1;

    return false;
  }

  // 空白鍵施法
  if (keyCode === 32) {

    if (!spaceIsDown && !isCasting) {

      isCasting = true;

      magicStartFrame = frameCount;

      magicDirection = facingDirection;
    }

    spaceIsDown = true;

    return false;
  }
}

// ================================
// 鍵盤放開
// ================================

function keyReleased() {

  if (keyCode === 32) {

    spaceIsDown = false;

    return false;
  }

  if (
    keyCode === LEFT_ARROW ||
    keyCode === RIGHT_ARROW
  ) {

    return false;
  }
}

// ================================
// 視窗縮放
// ================================

function windowResized() {

  const oldWidth = width;

  const cameraRatio =
    oldWidth > 0 ? cameraX / oldWidth : 0;

  const characterRatio =
    oldWidth > 0 ? characterX / oldWidth : 2 / 3;

  resizeCanvas(windowWidth, windowHeight);

  // 保留背景捲動比例
  cameraX = constrain(
    cameraRatio * width,
    -width,
    width
  );

  // 保留角色位置比例
  characterX = characterRatio * width;

  const newHeight = height / 3;

  const newWidth =
    newHeight * frameWidth / frameHeight;

  characterX = constrain(
    characterX,
    newWidth / 2,
    max(
      newWidth / 2,
      width - newWidth / 2
    )
  );

  // 重建適合新視窗尺寸的環境裝飾
  createEnvironment();
}
