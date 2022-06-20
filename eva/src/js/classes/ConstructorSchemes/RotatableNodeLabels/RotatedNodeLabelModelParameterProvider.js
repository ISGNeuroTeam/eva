import { BaseClass, ILabelModelParameterProvider, List } from 'yfiles';

/**
 * Provides candidate parameters for rotated label models.
 */
class RotatedNodeLabelModelParameterProvider extends BaseClass(ILabelModelParameterProvider) {
  /**
   * Returns a new instance using the given parameter provider.
   * @param {!ILabelModelParameterProvider} wrapped
   */
  constructor(wrapped) {
    super();
    this.wrappedProvider = wrapped;
  }

  /**
   * Returns a set of possible wrapped {@link ILabelModelParameter} instances.
   * @param {!ILabel} label
   * @param {!ILabelModel} model
   * @returns {!IEnumerable.<ILabelModelParameter>}
   */
  getParameters(label, model) {
    const wrapperModel = model;
    const parameters = this.wrappedProvider.getParameters(label, wrapperModel.wrapped);
    const result = new List();
    parameters.forEach((parameter) => {
      result.add(wrapperModel.createWrappingParameter(parameter));
    });
    return result;
  }
}

export default RotatedNodeLabelModelParameterProvider;
