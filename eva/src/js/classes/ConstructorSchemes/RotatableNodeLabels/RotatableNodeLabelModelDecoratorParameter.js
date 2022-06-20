/* eslint-disable no-underscore-dangle */
import {
  BaseClass, ILabelModelParameter, IMarkupExtensionConverter, INode,
} from 'yfiles';
import RotatableNodeLabelModelDecoratorParameterExtension from './RotatableNodeLabelModelDecoratorParameterExtension';

/**
 * A {@link ILabelModelParameter} decorator for node labels using
 * {@link RotatableNodeLabelModelDecorator} to adjust the label rotation to the node rotation.
 */
class RotatableNodeLabelModelDecoratorParameter extends BaseClass(
  ILabelModelParameter,
  IMarkupExtensionConverter,
) {
  /**
   * Creates a new instance wrapping the given parameter.
   * @param {!ILabelModelParameter} wrapped
   * @param {!ILabelModel} model
   */
  constructor(wrapped, model) {
    super();
    // Specifies the wrapped label model parameter.
    this.wrapped = wrapped;
    this._model = model;
  }

  /**
   * Returns a copy of this label model parameter.
   * @returns {*}
   */
  clone() {
    return new RotatableNodeLabelModelDecoratorParameter(this.wrapped, this.model);
  }

  /**
   * Returns the label model.
   * @type {!ILabelModel}
   */
  get model() {
    return this._model;
  }

  /**
   * Specifies the label model.
   * @type {!ILabelModel}
   */
  set model(model) {
    this._model = model;
  }

  /**
   * Whether this parameter supports the given label.
   * Accepts node labels that are supported by the wrapped label model parameter.
   * @param {!ILabel} label
   * @returns {boolean}
   */
  supports(label) {
    return label.owner instanceof INode && this.wrapped.supports(label);
  }

  /**
   * Returns that this label model parameter can be converted.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  canConvert(context, value) {
    return true;
  }

  /**
   * Converts this label model parameter to a
   * {@link RotatableNodeLabelModelDecoratorParameterExtension}.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {!RotatableNodeLabelModelDecoratorParameterExtension}
   */
  convert(context, value) {
    const extension = new RotatableNodeLabelModelDecoratorParameterExtension();
    extension.model = this._model;
    extension.wrapped = this.wrapped;
    return extension;
  }
}

export default RotatableNodeLabelModelDecoratorParameter;
