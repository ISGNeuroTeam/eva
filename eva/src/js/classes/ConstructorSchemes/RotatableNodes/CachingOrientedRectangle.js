import {
  BaseClass,
  IOrientedRectangle,
  OrientedRectangle,
  Point,
  Rect,
} from 'yfiles';

class CachingOrientedRectangle extends BaseClass(IOrientedRectangle) {
  /**
   * Creates a new instance.
   * @param {!Rect} layout
   */
  constructor(layout = Rect.EMPTY) {
    super();
    // eslint-disable-next-line no-underscore-dangle
    this._upVector = new Point(0, -1);
    // eslint-disable-next-line no-underscore-dangle
    this._angle = 0;
    this.cachedLayout = layout;
    this.cachedOrientedRect = new OrientedRectangle(layout);
  }

  /**
   * Returns the rotation angle.
   * @type {number}
   */
  get angle() {
    // eslint-disable-next-line no-underscore-dangle
    return this._angle;
  }

  /**
   * Specifies the rotation angle.
   * @type {number}
   */
  set angle(angle) {
    // eslint-disable-next-line no-underscore-dangle
    this._angle = CachingOrientedRectangle.normalizeAngle(angle);
    this.cachedOrientedRect.angle = CachingOrientedRectangle.toRadians(angle);
    this.cachedOrientedRect.setCenter(this.cachedLayout.center);
    // eslint-disable-next-line no-underscore-dangle
    this._upVector = this.cachedOrientedRect.upVector;
  }

  /**
   * Returns the width of the rectangle.
   * @type {number}
   */
  get width() {
    return this.cachedLayout.width;
  }

  /**
   * Returns the height of the rectangle.
   * @type {number}
   */
  get height() {
    return this.cachedLayout.height;
  }

  /**
   * Returns the x-coordinate of the rectangle's anchor point.
   * @type {number}
   */
  get anchorX() {
    return this.cachedOrientedRect.anchorX;
  }

  /**
   * Returns the y-coordinate of the rectangle's anchor point.
   * @type {number}
   */
  get anchorY() {
    return this.cachedOrientedRect.anchorY;
  }

  /**
   * Returns the x-coordinate of the rectangle's up vector.
   * @type {number}
   */
  get upX() {
    return this.cachedOrientedRect.upX;
  }

  /**
   * Returns the y-coordinate of the rectangle's up vector.
   * @type {number}
   */
  get upY() {
    return this.cachedOrientedRect.upY;
  }

  /**
   * Returns the rectangle's up vector.
   * @type {!Point}
   */
  get upVector() {
    // eslint-disable-next-line no-underscore-dangle
    return this._upVector;
  }

  /**
   * Specifies the rectangle's up vector.
   * @type {!Point}
   */
  set upVector(upVector) {
    // eslint-disable-next-line no-underscore-dangle
    this._upVector = upVector;
    this.cachedOrientedRect.setUpVector(upVector.x, upVector.y);
    this.cachedOrientedRect.setCenter(this.cachedLayout.center);
    this.angle = CachingOrientedRectangle.toDegrees(this.cachedOrientedRect.angle);
  }

  /**
   * Returns the angle in radians.
   * @returns {number}
   */
  getRadians() {
    return CachingOrientedRectangle.toRadians(this.angle);
  }

  /**
   * Updates the layout in the cache.
   * @param {!Rect} layout
   */
  updateCache(layout) {
    if (
      layout.equals(this.cachedLayout)
      && this.upVector.equals(this.cachedOrientedRect.upVector)
    ) {
      return;
    }
    this.cachedLayout = layout;
    this.cachedOrientedRect.setUpVector(this.upVector.x, this.upVector.y);
    this.cachedOrientedRect.width = this.width;
    this.cachedOrientedRect.height = this.height;
    this.cachedOrientedRect.setCenter(this.cachedLayout.center);
  }

  static toDegrees(radians) {
    return (radians * 180) / Math.PI;
  }

  static toRadians(degrees) {
    return (degrees / 180) * Math.PI;
  }

  static normalizeAngle(angle) {
    let normalizedAngle = angle % 360;
    if (normalizedAngle < 0) {
      normalizedAngle += 360;
    }
    return normalizedAngle;
  }
}

export default CachingOrientedRectangle;
