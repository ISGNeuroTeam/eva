/* eslint-disable no-underscore-dangle */
import { MarkupExtension } from 'yfiles';
import RotatablePortLocationModelDecorator from './RotatablePortLocationModelDecorator';

/**
 * Markup extension that helps (de-)serializing a {@link RotatablePortLocationModelDecorator).
 */
class RotatablePortLocationModelDecoratorExtension extends MarkupExtension {
  constructor() {
    super();
    this._wrapped = null;
  }

  /**
   * @type {!IPortLocationModel}
   */
  get wrapped() {
    return this._wrapped;
  }

  /**
   * @type {!IPortLocationModel}
   */
  set wrapped(value) {
    this._wrapped = value;
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {*}
   */
  // eslint-disable-next-line no-unused-vars
  provideValue(serviceProvider) {
    const model = new RotatablePortLocationModelDecorator();
    model.wrapped = this.wrapped;
    return model;
  }
}

export default RotatablePortLocationModelDecoratorExtension;
