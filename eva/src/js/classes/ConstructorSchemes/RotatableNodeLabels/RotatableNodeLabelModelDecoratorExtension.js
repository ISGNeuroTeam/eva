/* eslint-disable no-underscore-dangle */
import {
  GraphMLAttribute, MarkupExtension, TypeAttribute, YBoolean,
} from 'yfiles';

/**
 * Markup extension that helps (de-)serializing a {@link RotatableNodeLabelModelDecorator).
 */
class RotatableNodeLabelModelDecoratorExtension extends MarkupExtension {
  constructor() {
    super();
    this._useNodeRotation = true;
    this._wrapped = null;
  }

  /**
   * @type {boolean}
   */
  get useNodeRotation() {
    return this._useNodeRotation;
  }

  /**
   * @type {boolean}
   */
  set useNodeRotation(value) {
    this._useNodeRotation = value;
  }

  /**
   * @type {!ILabelModel}
   */
  get wrapped() {
    return this._wrapped;
  }

  /**
   * @type {!ILabelModel}
   */
  set wrapped(value) {
    this._wrapped = value;
  }

  /**
   * Meta attributes for GraphML serialization.
   * @type {!object}
   */
  static get $meta() {
    return {
      useNodeRotation: [
        GraphMLAttribute().init({ defaultValue: true }),
        TypeAttribute(YBoolean.$class),
      ],
    };
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {*}
   */
  provideValue(serviceProvider) {
    const labelModel = new RotatableNodeLabelModelDecorator(this.wrapped);
    labelModel.useNodeRotation = this.useNodeRotation;
    return labelModel;
  }
}

export default RotatableNodeLabelModelDecoratorExtension;
