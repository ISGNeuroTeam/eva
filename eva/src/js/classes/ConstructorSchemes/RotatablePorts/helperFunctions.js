import { RotatableNodeStyleDecorator } from '../RotatableNodes';

export function getAngle(node) {
  return node.style instanceof RotatableNodeStyleDecorator ? node.style.angle : 0;
}

/**
 * Returns the given angle in radians.
 * @param {number} degrees
 * @returns {number}
 */
export function toRadians(degrees) {
  return (degrees / 180) * Math.PI;
}
