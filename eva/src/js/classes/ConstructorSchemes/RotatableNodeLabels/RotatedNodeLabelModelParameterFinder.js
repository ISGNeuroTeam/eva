import { BaseClass, ILabelModelParameterFinder, OrientedRectangle } from 'yfiles';

/**
 * Finds the best {@link ILabelModelParameter} to approximate a specific rotated layout.
 */
class RotatedNodeLabelModelParameterFinder extends BaseClass(ILabelModelParameterFinder) {
  /**
   * Creates a new instance using the given parameter finder.
   * @param {!ILabelModelParameterFinder} wrapped
   */
  constructor(wrapped) {
    super();
    this.wrappedFinder = wrapped;
  }

  /**
   * Finds the label model parameter that describes the given label layout best. Sometimes the
   * layout cannot be met exactly, then the nearest location is used.
   * @param {!ILabel} label
   * @param {!ILabelModel} model
   * @param {!IOrientedRectangle} labelLayout
   * @returns {!ILabelModelParameter}
   */
  findBestParameter(label, model, labelLayout) {
    const wrapperModel = model;
    const styleWrapper = wrapperModel.getNodeStyleWrapper(label);
    if (!wrapperModel.useNodeRotation || styleWrapper === null || styleWrapper.angle === 0) {
      return wrapperModel.createWrappingParameter(
        this.wrappedFinder.findBestParameter(label, wrapperModel.wrapped, labelLayout),
      );
    }

    const node = label.owner;
    const rotatedCenter = styleWrapper.getRotatedPoint(
      labelLayout.orientedRectangleCenter,
      node,
      false,
    );
    const rotatedLayout = styleWrapper.getRotatedLayout(node);

    const rectangle = new OrientedRectangle(labelLayout);
    rectangle.angle -= rotatedLayout.getRadians();
    rectangle.setCenter(rotatedCenter);

    return wrapperModel.createWrappingParameter(
      this.wrappedFinder.findBestParameter(label, wrapperModel.wrapped, rectangle),
    );
  }
}

export default RotatedNodeLabelModelParameterFinder;
