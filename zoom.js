
import { panInBounds } from "./pan.js";

const ZoomLevels = [1, 2, 4, 5, 10, 20, 25, 50, 100, 125, 250, 500]; // factors of 500
let zoomIndex = 0;

export let zoom = ZoomLevels[zoomIndex];

export function zoomIn() {
  zoomIndex = Math.min(++zoomIndex, ZoomLevels.length - 1);
  dispatchEvent(new Event("zoomIndex::change"));
}

export function zoomOut() {
  zoomIndex = Math.max(--zoomIndex, 0);
  dispatchEvent(new Event("zoomIndex::change"));
}

addEventListener('zoomIndex::change', updateZoom)

export function updateZoom() {
  zoom = ZoomLevels[zoomIndex];
  dispatchEvent(new Event("zoom::change"));
}

// fix for zooming out of bounds
addEventListener('zoom::change', () => panInBounds())