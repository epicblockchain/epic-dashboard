const DEFAULT_WINDOW_WIDTH = 1280;
const DEFAULT_WINDOW_HEIGHT = 720;
const MIN_WINDOW_WIDTH = 800;
const MIN_WINDOW_HEIGHT = 620;

export function getInitialWindowBounds(workArea) {
    return {
        width: Math.min(DEFAULT_WINDOW_WIDTH, workArea.width),
        minWidth: Math.min(MIN_WINDOW_WIDTH, workArea.width),
        height: Math.min(DEFAULT_WINDOW_HEIGHT, workArea.height),
        minHeight: Math.min(MIN_WINDOW_HEIGHT, workArea.height),
    };
}

export function getMinerTableBodyHeight(containerHeight) {
    const measuredHeight = Number.isFinite(containerHeight) ? Math.floor(containerHeight) : 0;
    return Math.max(1, measuredHeight);
}
