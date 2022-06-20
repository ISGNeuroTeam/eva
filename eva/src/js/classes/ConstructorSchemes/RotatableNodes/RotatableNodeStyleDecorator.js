import {
  BaseClass, GeneralPath,
  IMarkupExtensionConverter,
  Matrix,
  NodeStyleBase, OrientedRectangle,
  Point,
  ShapeNodeStyle,
  SvgVisualGroup,
} from 'yfiles';
import CachingOrientedRectangle from './CachingOrientedRectangle';

class RotatableNodeStyleDecorator extends BaseClass(
  NodeStyleBase,
  IMarkupExtensionConverter,
) {
  /**
   * Creates a new instance with a wrapped node style and an angle.
   * @param {?INodeStyle} [wrapped=null]
   * @param {number} [angle=0]
   */
  constructor(wrapped = null, angle = 0) {
    super();
    this.rotatedLayout = new CachingOrientedRectangle();
    this.matrix = new Matrix();
    this.matrixAngle = 0;
    this.inverseMatrix = new Matrix();
    this.inverseMatrixAngle = 0;
    // Specifies the wrapped style.
    this.wrapped = wrapped || new ShapeNodeStyle();
    this.angle = angle || 0;
    this.matrixCenter = Point.ORIGIN;
    this.inverseMatrixCenter = Point.ORIGIN;
  }

  /**
   * Returns the rotation angle.
   * @type {number}
   */
  get angle() {
    return this.rotatedLayout.angle;
  }

  /**
   * Specifies the rotation angle.
   * @type {number}
   */
  set angle(angle) {
    this.rotatedLayout.angle = angle;
  }

  /**
   * Creates a visual which rotates the visualization of the wrapped style.
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {!SvgVisualGroup}
   */
  createVisual(context, node) {
    const visual = this.wrapped.renderer.getVisualCreator(node, this.wrapped).createVisual(context);
    const container = new SvgVisualGroup();
    const matrix = new Matrix();
    matrix.rotate(CachingOrientedRectangle.toRadians(-this.angle), node.layout.center);
    container.transform = matrix;
    container.add(visual);
    container['render-data-cache'] = {
      angle: this.angle,
      center: node.layout.center,
      wrapped: this.wrapped,
    };
    context.registerForChildrenIfNecessary(container, this.disposeChildren.bind(this));
    return container;
  }

  /**
   * Updates a visual which rotates the visualization of the wrapped style.
   * @param {!IRenderContext} context
   * @param {!SvgVisualGroup} oldVisual
   * @param {!INode} node
   * @returns {!SvgVisualGroup}
   */
  updateVisual(context, oldVisual, node) {
    if (!oldVisual.children || oldVisual.children.size !== 1) {
      return this.createVisual(context, node);
    }

    const cache = oldVisual['render-data-cache'];

    const oldWrappedStyle = cache.wrapped;
    const newWrappedStyle = this.wrapped;

    const creator = this.wrapped.renderer.getVisualCreator(node, this.wrapped);

    const oldWrappedVisual = oldVisual.children.get(0);

    let newWrappedVisual;
    if (newWrappedStyle !== oldWrappedStyle) {
      newWrappedVisual = creator ? creator.createVisual(context) : null;
    } else {
      newWrappedVisual = creator ? creator.updateVisual(context, oldWrappedVisual) : null;
    }

    if (oldWrappedVisual !== newWrappedVisual) {
      oldVisual.children.insert(0, newWrappedVisual);
      context.childVisualRemoved(oldWrappedVisual);
    }
    context.registerForChildrenIfNecessary(oldVisual, this.disposeChildren.bind(this));

    if (cache.angle !== this.angle || !cache.center.equals(node.layout.center)) {
      const matrix = new Matrix();
      matrix.rotate(CachingOrientedRectangle.toRadians(-this.angle), node.layout.center);
      oldVisual.transform = matrix;
    }

    oldVisual['render-data-cache'] = {
      angle: this.angle,
      center: node.layout.center,
      wrapped: this.wrapped,
    };

    return oldVisual;
  }

  /**
   * Returns bounds based on the size provided by the wrapped style and the location and
   * rotation of the node.
   * @param {!ICanvasContext} context
   * @param {!INode} node
   */
  getBounds(context, node) {
    const nodeOrientedRect = this.getRotatedLayout(node);

    // Create an oriented rectangle with the size of
    // the wrapped bounds and the location and rotation of the node
    const wrappedBounds = this.wrapped.renderer
      .getBoundsProvider(node, this.wrapped)
      .getBounds(context);

    const orientedRectangle = new OrientedRectangle(
      0,
      0,
      wrappedBounds.width,
      wrappedBounds.height,
      nodeOrientedRect.upX,
      nodeOrientedRect.upY,
    );
    orientedRectangle.setCenter(node.layout.center);

    return orientedRectangle.bounds;
  }

  /**
   * Returns the intersection point of the node's rotated bounds and the segment between the inner
   * and outer point or null if there is no intersection.
   * @param {!INode} node
   * @param {!Point} inner
   * @param {!Point} outer
   * @returns {?Point}
   */
  getIntersection(node, inner, outer) {
    const rotatedInner = this.getRotatedPoint(inner, node, false);
    const rotatedOuter = this.getRotatedPoint(outer, node, false);

    const rotatedIntersection = this.wrapped.renderer
      .getShapeGeometry(node, this.wrapped)
      .getIntersection(rotatedInner, rotatedOuter);
    if (rotatedIntersection) {
      return this.getRotatedPoint(rotatedIntersection, node, true);
    }
    return null;
  }

  /**
   * Returns the outline of the node's rotated shape.
   * @param {!INode} node
   * @returns {!GeneralPath}
   */
  getOutline(node) {
    let outline = this.wrapped.renderer.getShapeGeometry(node, this.wrapped).getOutline();
    if (outline) {
      outline = outline.clone();
      outline.transform(this.getInverseRotationMatrix(node));
    } else {
      const layout = this.getRotatedLayout(node);
      outline = new GeneralPath();
      outline.appendOrientedRectangle(layout, false);
    }
    return outline;
  }

  /**
   * Returns whether or not the given location is inside the rotated node.
   * @param {!IInputModeContext} context
   * @param {!Point} location
   * @param {!INode} node
   * @returns {boolean}
   */
  isHit(context, location, node) {
    // rotated the point like the node, that is by the angle around the node center
    const transformedPoint = this.getRotatedPoint(location, node, false);
    return this.wrapped.renderer.getHitTestable(node, this.wrapped)
      .isHit(context, transformedPoint);
  }

  /**
   * Returns whether or not the given node is inside the rectangle.
   * @param {!IInputModeContext} context
   * @param {!Rect} rectangle
   * @param {!INode} node
   * @returns {boolean}
   */
  isInBox(context, rectangle, node) {
    const nodeOrientedRect = this.getRotatedLayout(node);

    // Create an oriented rectangle with the size of
    // the wrapped bounds and the location and rotation of the node
    const wrappedBounds = this.wrapped.renderer
      .getBoundsProvider(node, this.wrapped)
      .getBounds(context);
    const orientedRectangle = new OrientedRectangle(
      0,
      0,
      wrappedBounds.width,
      wrappedBounds.height,
      nodeOrientedRect.upX,
      nodeOrientedRect.upY,
    );
    orientedRectangle.setCenter(node.layout.center);

    return rectangle.intersects(orientedRectangle, 0.01);
  }

  /**
   * Returns whether or not the node is currently visible.
   * @param {!ICanvasContext} context
   * @param {!Rect} rectangle
   * @param {!INode} node
   * @returns {boolean}
   */
  isVisible(context, rectangle, node) {
    return (
      this.wrapped.renderer
        .getVisibilityTestable(node, this.wrapped)
        .isVisible(context, rectangle) || this.getBounds(context, node).intersects(rectangle)
    );
  }

  /**
   * Creates a copy of this node style decorator.
   * @returns {*}
   */
  clone() {
    return new RotatableNodeStyleDecorator(this.wrapped, this.angle);
  }

  /**
   * Returns the rotated bounds of the node.
   * @param {!INode} node
   * @returns {!CachingOrientedRectangle}
   */
  getRotatedLayout(node) {
    this.rotatedLayout.updateCache(node.layout.toRect());
    return this.rotatedLayout;
  }

  /**
   * Returns the rotated point.
   * @param {!Point} point
   * @param {!INode} node
   * @param {boolean} inverse
   * @returns {!Point}
   */
  getRotatedPoint(point, node, inverse) {
    const matrix = inverse ? this.getInverseRotationMatrix(node) : this.getRotationMatrix(node);
    return matrix.transform(point);
  }

  /**
   * Returns the rotation matrix for the given node and the current angle.
   * @param {!INode} node
   * @returns {!Matrix}
   */
  getRotationMatrix(node) {
    const { center } = node.layout;
    if (!center.equals(this.matrixCenter) || this.angle !== this.matrixAngle) {
      this.matrix.reset();
      this.matrix.rotate(RotatableNodeStyleDecorator.toRadians(this.angle), center);
      this.matrixCenter = center;
      this.matrixAngle = this.angle;
    }
    return this.matrix;
  }

  /**
   * Returns the inverse rotation matrix for the given node and the current angle.
   * @param {!INode} node
   * @returns {!Matrix}
   */
  getInverseRotationMatrix(node) {
    const { center } = node.layout;
    if (!center.equals(this.inverseMatrixCenter) || this.angle !== this.inverseMatrixAngle) {
      this.inverseMatrix.reset();
      this.inverseMatrix.rotate(RotatableNodeStyleDecorator.toRadians(-this.angle), center);
      this.inverseMatrixCenter = center;
      this.inverseMatrixAngle = this.angle;
    }
    return this.inverseMatrix;
  }

  /**
   * @param {!IRenderContext} context
   * @param {!Visual} removedVisual
   * @param {boolean} _dispose
   * @returns {?Visual}
   */
  // eslint-disable-next-line class-methods-use-this
  disposeChildren(context, removedVisual, _dispose) {
    const container = removedVisual instanceof SvgVisualGroup ? removedVisual : null;
    if (container != null && container.children.size > 0) {
      context.childVisualRemoved(container.children.get(0));
    }
    return null;
  }

  /**
   * Returns that this style can be converted.
   * @param {!IWriteContext} context The current write context.
   * @param {*} value The object to convert.
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  canConvert(context, value) {
    return true;
  }

  static toRadians(degrees) {
    return (degrees / 180) * Math.PI;
  }
}

export default RotatableNodeStyleDecorator;
