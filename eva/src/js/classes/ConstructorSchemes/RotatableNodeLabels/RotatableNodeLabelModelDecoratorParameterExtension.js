/* eslint-disable no-underscore-dangle */
import { MarkupExtension } from 'yfiles';

/**
 * Markup extension that helps (de-)serializing a {@link RotatableNodeLabelModelDecoratorParameter).
 */
class RotatableNodeLabelModelDecoratorParameterExtension extends MarkupExtension {
  constructor() {
    super();
    this._model = null;
    this._wrapped = null;
  }

  /**
   * @type {!ILabelModel}
   */
  get model() {
    return this._model;
  }

  /**
   * @type {!ILabelModel}
   */
  set model(value) {
    this._model = value;
  }

  /**
   * @type {!ILabelModelParameter}
   */
  get wrapped() {
    return this._wrapped;
  }

  /**
   * @type {!ILabelModelParameter}
   */
  set wrapped(value) {
    this._wrapped = value;
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {*}
   */
  provideValue(serviceProvider) {
    const rotatableModel = this.model;
    if (rotatableModel?.createWrappingParameter) {
      return rotatableModel.createWrappingParameter(this.wrapped);
    }
    return this.wrapped;
  }
}

export default RotatableNodeLabelModelDecoratorParameterExtension;
