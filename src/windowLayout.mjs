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

export function getMinerTableViewportHeight(viewportHeight) {
    const preferredHeight = Math.round(viewportHeight * 0.52);
    const maxHeight = Math.max(140, viewportHeight - 540);
    return Math.max(140, Math.min(preferredHeight, maxHeight));
}
