import {
  BaseClass,
  FreeNodePortLocationModel,
  IMarkupExtensionConverter,
  INode,
  IPortLocationModel,
  Matrix,
} from 'yfiles';

import RotatablePortLocationModelDecoratorParameter from './RotatablePortLocationModelDecoratorParameter';

import {
  getAngle,
  toRadians,
} from './helperFunctions';

const EPS = 0.001;
/**
 * Port location model decorator that automatically
 * provides the location in the rotated coordinates of the owner.
 */
class RotatablePortLocationModelDecorator extends BaseClass(
  IPortLocationModel,
  IMarkupExtensionConverter,
) {
  /** @type {RotatablePortLocationModelDecorator} */
  static get INSTANCE() {
    if (typeof RotatablePortLocationModelDecorator.$INSTANCE === 'undefined') {
      RotatablePortLocationModelDecorator.$INSTANCE = new RotatablePortLocationModelDecorator();
    }

    return RotatablePortLocationModelDecorator.$INSTANCE;
  }

  /** @type {RotatablePortLocationModelDecorator} */
  static set INSTANCE(INSTANCE) {
    RotatablePortLocationModelDecorator.$INSTANCE = INSTANCE;
  }

  /**
   * Creates a new instance wrapping a {@link FreeNodePortLocationModel}.
   */
  constructor() {
    super();

    // The wrapped location model.
    // It is only used when new parameters are created via {@link #createParameter}.
    this.wrapped = new FreeNodePortLocationModel();
  }

  /**
   * Delegates to the wrapped location model's lookup.
   * @param {!Class} type
   */
  lookup(type) {
    return this.wrapped.lookup(type);
  }

  /**
   * Recalculates the coordinates provided by parameter.
   * This has only an effect when parameter is created by this model and the owner of port has a
   * {@link RotatableNodeStyleDecorator}.
   * @param {!IPort} port
   * @param {!IPortLocationModelParameter} parameter
   * @returns {!Point}
   */
  getLocation(port, parameter) {
    const param = parameter.wrapped;
    const coreLocation = this.wrapped.getLocation(port, param);
    const ownerNode = port.owner;
    if (!(ownerNode instanceof INode)) {
      return coreLocation;
    }

    const angle = getAngle(ownerNode);
    if (Math.abs(angle) < EPS) {
      return coreLocation;
    }
    const matrix = new Matrix();
    matrix.rotate(-toRadians(angle), ownerNode.layout.center);
    return matrix.transform(coreLocation);
  }

  /**
   * Creates a parameter that matches the given location.
   * @param {!IPortOwner} portOwner
   * @param {!Point} location
   * @returns {!IPortLocationModelParameter}
   */
  createParameter(portOwner, location) {
    const angle = portOwner instanceof INode ? getAngle(portOwner) : 0;
    if (Math.abs(angle) >= EPS) {
      const ownerNode = portOwner;
      // Undo the rotation by the ownerNode so
      // that we can create a core parameter for the un-rotated layout.
      const matrix = new Matrix();
      matrix.rotate(toRadians(angle), ownerNode.layout.center);
      location = matrix.transform(location);
    }
    return new RotatablePortLocationModelDecoratorParameter(
      this.wrapped.createParameter(portOwner, location),
      this,
    );
  }

  /**
   * Wraps a given parameter so it can be automatically rotated.
   * The core parameter is assumed to provide coordinates for an un-rotated owner.
   * @param {!IPortLocationModelParameter} coreParameter
   * @returns {!IPortLocationModelParameter}
   */
  createWrappingParameter(coreParameter) {
    return new RotatablePortLocationModelDecoratorParameter(coreParameter, this);
  }

  /**
   * Returns the lookup of the wrapped location model.
   * @param {!IPort} port
   * @param {!IPortLocationModelParameter} parameter
   * @returns {!ILookup}
   */
  getContext(port, parameter) {
    return this.wrapped.getContext(port, parameter);
  }

  /**
   * Returns that this port location model can be converted.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  canConvert(context, value) {
    return true;
  }

  /**
   * Converts this port location model using {@link RotatablePortLocationModelDecoratorExtension}.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {!MarkupExtension}
   */
  // eslint-disable-next-line no-unused-vars
  // convert(context, value) {
  //   const markupExtension = new RotatablePortLocationModelDecoratorExtension();
  //   markupExtension.wrapped = this.wrapped;
  //   return markupExtension;
  // }
}

export default RotatablePortLocationModelDecorator;
