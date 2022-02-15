/** Returns a subsection of a 2d array */
export function slice2D(array2D, x, y, width, height) {
  return array2D.slice(y, y + height).map(row => row.slice(x, x + width));
}