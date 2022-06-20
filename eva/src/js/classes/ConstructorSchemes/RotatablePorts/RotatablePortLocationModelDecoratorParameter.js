/* eslint-disable no-underscore-dangle */
import { BaseClass, IMarkupExtensionConverter, IPortLocationModelParameter } from 'yfiles';

/**
 * A {@link IPortLocationModelParameter} decorator for ports using
 * {@link RotatablePortLocationModelDecorator} to adjust the port location to the node rotation.
 */
class RotatablePortLocationModelDecoratorParameter extends BaseClass(
  IPortLocationModelParameter,
  IMarkupExtensionConverter,
) {
  /**
   * Creates a new instance wrapping the given location model parameter.
   * @param {!IPortLocationModelParameter} wrapped
   * @param {!RotatablePortLocationModelDecorator} model
   */
  constructor(wrapped, model) {
    super();
    this._wrapped = wrapped;
    this._model = model;
  }

  /**
   * Creates a copy of this location model parameter.
   * @returns {*}
   */
  clone() {
    return new RotatablePortLocationModelDecoratorParameter(this.wrapped.clone(), this.model);
  }

  /**
   * Returns the model.
   * @type {!IPortLocationModel}
   */
  get model() {
    return this._model;
  }

  /**
   * Returns the wrapped parameter.
   * @type {!IPortLocationModelParameter}
   */
  get wrapped() {
    return this._wrapped;
  }

  /**
   * Accepts all port owners that are supported by the wrapped parameter.
   * @param {!IPortOwner} portOwner
   * @returns {boolean}
   */
  supports(portOwner) {
    return this.wrapped.supports(portOwner);
  }

  /**
   * Converts this port location
   * model parameter using {@link RotatablePortLocationModelDecoratorParameterExtension}.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {!MarkupExtension}
   */
  // eslint-disable-next-line no-unused-vars
  // convert(context, value) {
  //   const markupExtension = new RotatablePortLocationModelDecoratorParameterExtension();
  //   markupExtension.model = this.model === RotatablePortLocationModelDecorator.INSTANCE
  //     ? null
  //     : this.model;
  //   markupExtension.wrapped = this.wrapped;
  //   return markupExtension;
  // }
}

export default RotatablePortLocationModelDecoratorParameter;
