export const CANVAS_HEIGHT = 450;
export const CANVAS_WIDTH = 600;
export const MAX_REVEAL_LEVEL = 6;

export const EFFECTS = [ "zoomed-in", "pixelated", "scrambled", "distorted", "hidden" ] as const;

export type MemeEffect = (typeof EFFECTS)[number];

export const EFFECT_CONFIG = {
    distorted: { intensityPerUnrevealedLevel: 16, sliceHeight: 4 },
    hidden: { holesPerLevel: 6, initialHoleCount: 2, maximumRadius: 62, minimumRadius: 18 },
    pixelated: { initialPixelSize: 50 },
    scrambled: { columns: 20, partialBottomStartRatio: 0.6, rows: 15 },
    "zoomed-in": {
        focusPoints: [
            { x: 0.2, y: 0.2 },
            { x: 0.8, y: 0.2 },
            { x: 0.2, y: 0.8 },
            { x: 0.8, y: 0.8 },
            { x: 0.5, y: 0.5 },
        ],
        initialZoom: 4.8,
    },
} as const;

interface DrawMemeOptions {
    canvas: HTMLCanvasElement;
    effect: MemeEffect;
    image: HTMLImageElement;
    revealLevel: number;
    seed: number;
}

export const drawMemePreview = ({ canvas, effect, image, revealLevel, seed }: DrawMemeOptions) => {
    const context = canvas.getContext("2d");

    if (!context) {
        return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (effect === "pixelated") {
        drawPixelated(context, image, revealLevel);
        return;
    }

    if (effect === "zoomed-in") {
        drawZoomedIn(context, image, revealLevel, seed);
        return;
    }

    if (effect === "scrambled") {
        drawScrambled(context, image, revealLevel, seed);
        return;
    }

    if (effect === "distorted") {
        drawDistorted(context, image, revealLevel, seed);
        return;
    }

    drawHidden(context, image, revealLevel, seed);
};

const drawSource = (context: CanvasRenderingContext2D, image: HTMLImageElement, destinationWidth = CANVAS_WIDTH, destinationHeight = CANVAS_HEIGHT) => {
    const imageRatio = image.width / image.height;
    const canvasRatio = destinationWidth / destinationHeight;
    const sourceWidth = imageRatio > canvasRatio ? image.height * canvasRatio : image.width;
    const sourceHeight = imageRatio > canvasRatio ? image.height : image.width / canvasRatio;
    const sourceX = (image.width - sourceWidth) / 2;
    const sourceY = (image.height - sourceHeight) / 2;

    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, destinationWidth, destinationHeight);
};

const drawPixelated = (context: CanvasRenderingContext2D, image: HTMLImageElement, revealLevel: number) => {
    const scale = Math.max(1, Math.round(
        EFFECT_CONFIG.pixelated.initialPixelSize
        - (EFFECT_CONFIG.pixelated.initialPixelSize - 1) * (revealLevel / MAX_REVEAL_LEVEL),
    ));
    const temporaryCanvas = document.createElement("canvas");

    temporaryCanvas.width = Math.ceil(CANVAS_WIDTH / scale);
    temporaryCanvas.height = Math.ceil(CANVAS_HEIGHT / scale);
    const temporaryContext = temporaryCanvas.getContext("2d");

    if (!temporaryContext) {
        return;
    }

    drawSource(temporaryContext, image, temporaryCanvas.width, temporaryCanvas.height);
    context.imageSmoothingEnabled = false;
    context.drawImage(temporaryCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.imageSmoothingEnabled = true;
};

const drawZoomedIn = (context: CanvasRenderingContext2D, image: HTMLImageElement, revealLevel: number, seed: number) => {
    const initialZoom = EFFECT_CONFIG["zoomed-in"].initialZoom;
    const firstRevealProgress = 1 - (1 - 1 / MAX_REVEAL_LEVEL) ** 5;
    const firstRevealZoom = 1 + (initialZoom - 1) * (1 - firstRevealProgress);
    const zoom = revealLevel === 0
        ? initialZoom
        : firstRevealZoom - (firstRevealZoom - 1) * ((revealLevel - 1) / (MAX_REVEAL_LEVEL - 1));
    const width = CANVAS_WIDTH / zoom;
    const height = CANVAS_HEIGHT / zoom;
    const focusPoint = zoomFocusPoint(seed);
    const x = clamp(CANVAS_WIDTH * focusPoint.x - width / 2, 0, CANVAS_WIDTH - width);
    const y = clamp(CANVAS_HEIGHT * focusPoint.y - height / 2, 0, CANVAS_HEIGHT - height);

    const temporaryCanvas = document.createElement("canvas");
    temporaryCanvas.width = CANVAS_WIDTH;
    temporaryCanvas.height = CANVAS_HEIGHT;
    const temporaryContext = temporaryCanvas.getContext("2d");

    if (!temporaryContext) {
        return;
    }

    drawSource(temporaryContext, image);
    context.drawImage(temporaryCanvas, x, y, width, height, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};

const drawDistorted = (context: CanvasRenderingContext2D, image: HTMLImageElement, revealLevel: number, seed: number) => {
    if (revealLevel === MAX_REVEAL_LEVEL) {
        drawSource(context, image);
        return;
    }

    const temporaryCanvas = document.createElement("canvas");
    temporaryCanvas.width = CANVAS_WIDTH;
    temporaryCanvas.height = CANVAS_HEIGHT;
    const temporaryContext = temporaryCanvas.getContext("2d");

    if (!temporaryContext) {
        return;
    }

    drawSource(temporaryContext, image);
    const distortion = (MAX_REVEAL_LEVEL - revealLevel) * EFFECT_CONFIG.distorted.intensityPerUnrevealedLevel;
    const random = seededRandom(seed);
    const primaryPhase = random() * Math.PI * 2;
    const secondaryPhase = random() * Math.PI * 2;
    const hueRotation = 35 + random() * 90;

    for (let y = 0; y < CANVAS_HEIGHT; y += EFFECT_CONFIG.distorted.sliceHeight) {
        const wave = Math.sin(y / 19 + primaryPhase) * distortion;
        const detailWave = Math.sin(y / 7 + secondaryPhase) * distortion * 0.28;
        const shift = wave + detailWave;

        context.drawImage(temporaryCanvas, 0, y, CANVAS_WIDTH, EFFECT_CONFIG.distorted.sliceHeight, shift, y, CANVAS_WIDTH, EFFECT_CONFIG.distorted.sliceHeight);

        context.globalAlpha = 0.32;
        context.globalCompositeOperation = "screen";
        context.filter = `hue-rotate(${ hueRotation }deg)`;
        context.drawImage(temporaryCanvas, 0, y, CANVAS_WIDTH, EFFECT_CONFIG.distorted.sliceHeight, -shift, y, CANVAS_WIDTH, EFFECT_CONFIG.distorted.sliceHeight);
        context.filter = "none";
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1;
    }
};

const drawScrambled = (context: CanvasRenderingContext2D, image: HTMLImageElement, revealLevel: number, seed: number) => {
    const temporaryCanvas = document.createElement("canvas");
    temporaryCanvas.width = CANVAS_WIDTH;
    temporaryCanvas.height = CANVAS_HEIGHT;
    const temporaryContext = temporaryCanvas.getContext("2d");

    if (!temporaryContext) {
        return;
    }

    drawSource(temporaryContext, image);
    const { columns, rows } = EFFECT_CONFIG.scrambled;
    const tileWidth = CANVAS_WIDTH / columns;
    const tileHeight = CANVAS_HEIGHT / rows;
    const tileCount = columns * rows;
    const order = shuffledTiles(tileCount, seed);

    for (let targetIndex = 0; targetIndex < tileCount; targetIndex += 1) {
        const row = Math.floor(targetIndex / columns);
        const column = targetIndex % columns;
        const sourceIndex = shouldRestoreTile(row, column, revealLevel) ? targetIndex : order[targetIndex];
        const sourceX = (sourceIndex % columns) * tileWidth;
        const sourceY = Math.floor(sourceIndex / columns) * tileHeight;
        const targetX = (targetIndex % columns) * tileWidth;
        const targetY = Math.floor(targetIndex / columns) * tileHeight;

        context.drawImage(temporaryCanvas, sourceX, sourceY, tileWidth, tileHeight, targetX, targetY, tileWidth, tileHeight);
    }
};

const drawHidden = (context: CanvasRenderingContext2D, image: HTMLImageElement, revealLevel: number, seed: number) => {
    if (revealLevel === MAX_REVEAL_LEVEL) {
        drawSource(context, image);
        return;
    }

    context.fillStyle = "#080b18";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const holeCount = EFFECT_CONFIG.hidden.initialHoleCount + revealLevel * EFFECT_CONFIG.hidden.holesPerLevel;
    const random = seededRandom(seed);

    context.save();
    context.beginPath();
    for (let index = 0; index < holeCount; index += 1) {
        const x = random() * CANVAS_WIDTH;
        const y = random() * CANVAS_HEIGHT;
        const radius = EFFECT_CONFIG.hidden.minimumRadius + random() * (EFFECT_CONFIG.hidden.maximumRadius - EFFECT_CONFIG.hidden.minimumRadius) + revealLevel * 3;

        context.moveTo(x + radius, y);
        context.arc(x, y, radius, 0, Math.PI * 2);
    }
    context.clip();
    drawSource(context, image);
    context.restore();
};

const shouldRestoreTile = (row: number, column: number, revealLevel: number) => {
    if (revealLevel === MAX_REVEAL_LEVEL) {
        return true;
    }

    const topRows = revealLevel;
    const rightColumns = revealLevel;
    const bottomRows = Math.max(0, revealLevel - 1);
    const leftColumns = Math.max(0, revealLevel - 1);

    const partiallyRestoredBottomRow = revealLevel === 1
        && row === EFFECT_CONFIG.scrambled.rows - 1
        && column >= Math.floor(EFFECT_CONFIG.scrambled.columns * EFFECT_CONFIG.scrambled.partialBottomStartRatio);

    return row < topRows
        || column >= EFFECT_CONFIG.scrambled.columns - rightColumns
        || row >= EFFECT_CONFIG.scrambled.rows - bottomRows
        || column < leftColumns
        || partiallyRestoredBottomRow;
};

const shuffledTiles = (tileCount: number, seed: number) => {
    const tiles = Array.from({ length: tileCount }, (_, index) => index);
    const random = seededRandom(seed);

    for (let index = tiles.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [ tiles[index], tiles[swapIndex] ] = [ tiles[swapIndex], tiles[index] ];
    }

    return tiles;
};

const zoomFocusPoint = (seed: number) => {
    const { focusPoints } = EFFECT_CONFIG["zoomed-in"];
    const index = Math.floor(seededRandom(seed)() * focusPoints.length);

    return focusPoints[index];
};

const seededRandom = (seed: number) => {
    let value = seed;

    return () => {
        value = (value * 1_664_525 + 1_013_904_223) % 4_294_967_296;
        return value / 4_294_967_296;
    };
};

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);
