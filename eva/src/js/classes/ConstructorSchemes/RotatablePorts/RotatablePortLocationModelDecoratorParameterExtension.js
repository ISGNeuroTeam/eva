/* eslint-disable no-underscore-dangle */
import { MarkupExtension } from 'yfiles';
import RotatablePortLocationModelDecorator from './RotatablePortLocationModelDecorator';

/**
 * Markup extension that helps (de-)serializing
 * a {@link RotatablePortLocationModelDecoratorParameter).
 */
class RotatablePortLocationModelDecoratorParameterExtension extends MarkupExtension {
  constructor() {
    super();
    this._model = null;
    this._wrapped = null;
  }

  /**
   * @type {?RotatablePortLocationModelDecorator}
   */
  get model() {
    return this._model;
  }

  /**
   * @type {?RotatablePortLocationModelDecorator}
   */
  set model(value) {
    this._model = value;
  }

  /**
   * @type {!IPortLocationModelParameter}
   */
  get wrapped() {
    return this._wrapped;
  }

  /**
   * @type {!IPortLocationModelParameter}
   */
  set wrapped(value) {
    this._wrapped = value;
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {*}
   */
  provideValue(serviceProvider) {
    const model = this.model instanceof RotatablePortLocationModelDecorator
      ? this.model
      : RotatablePortLocationModelDecorator.INSTANCE;
    return model.createWrappingParameter(this.wrapped);
  }
}

export default RotatablePortLocationModelDecoratorParameterExtension;
