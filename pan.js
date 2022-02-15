import { width, height } from "./settings.js";
import { zoom } from "./zoom.js";

export let x = 0
export let y = 0;

export function panLeft() {
  const _x = Math.max(x - width / zoom, 0);
  x = _x;
  if (x != _x) dispatchEvent(new Event("pan::change"));
}

export function panRight() {
  const _x = Math.min(x + width / zoom, width - width / zoom);
  x = _x;
  if (x != _x) dispatchEvent(new Event("pan::change"));
}

export function panUp() {
  const _y = Math.max(y - height / zoom, 0);
  y = _y;
  if (y != _y) dispatchEvent(new Event("pan::change"));
}

export function panDown() {
  const _y = Math.min(y + height / zoom, height - height / zoom);
  y = _y;
  if (y != _y) dispatchEvent(new Event("pan::change"));
}

export function pan(xDist = 0, yDist = 0) {
  if (xDist == 0 && yDist == 0) return;
  x -= xDist;
  y -= yDist;
  panInBounds();
  dispatchEvent(new Event("pan::change"));
}

/** pans to fit into bounds */
export function panInBounds() {
  const _x = Math.min(Math.max(x, 0), width - width / zoom);
  const _y = Math.min(Math.max(y, 0), height - height / zoom);
  x = _x;
  y = _y;
  if (x != _x || y != _y) dispatchEvent(new Event("pan::change"));
}

/** mouse drag to pan */
export function panDrag({ movementX, movementY }) {
  pan(movementX / zoom, movementY / zoom);
}