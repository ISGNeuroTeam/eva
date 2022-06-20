import {
  BaseClass,
  FreeNodeLabelModel,
  ILabelModel, ILabelModelParameterFinder,
  ILabelModelParameterProvider,
  IMarkupExtensionConverter, INode, OrientedRectangle,
} from 'yfiles';
import RotatedNodeLabelModelParameterProvider from './RotatedNodeLabelModelParameterProvider';
import RotatableNodeLabelModelDecoratorExtension from './RotatableNodeLabelModelDecoratorExtension';
import RotatedNodeLabelModelParameterFinder from './RotatedNodeLabelModelParameterFinder';
import RotatableNodeLabelModelDecoratorParameter from './RotatableNodeLabelModelDecoratorParameter';
import { RotatableNodeStyleDecorator } from '../RotatableNodes/index';

/**
 * A {@link ILabelModel} decorator for node labels that wraps another label model and considers the
 * {@link RotatableNodeStyleDecorator#angle rotation angle} of the label owner when a
 * {@link RotatableNodeStyleDecorator} is used.
 * This will make the node labels rotate with the node's rotation.
 */
class RotatableNodeLabelModelDecorator extends BaseClass(
  ILabelModel,
  IMarkupExtensionConverter,
) {
  /**
   * Creates a new instance of {@link RotatableNodeLabelModelDecorator}.
   * @param {!ILabelModel} wrapped
   */
  constructor(wrapped) {
    super();
    // Specifies the wrapped label model.
    this.wrapped = wrapped || FreeNodeLabelModel.INSTANCE;
    // Specifies whether or not the rotation of the label owner should be considered.
    this.useNodeRotation = true;
  }

  /**
   * Provides custom implementations of {@link ILabelModelParameterProvider} and
   * {@link ILabelModelParameterFinder} that consider the nodes rotation.
   * Wraps the default implementations in a special wrapper which supports rotation.
   * @param {!Class} type
   * @returns {?object}
   */
  lookup(type) {
    if (type === ILabelModelParameterProvider.$class) {
      const provider = this.wrapped.lookup(ILabelModelParameterProvider.$class);
      if (provider) {
        return new RotatedNodeLabelModelParameterProvider(provider);
      }
    }
    if (type === ILabelModelParameterFinder.$class) {
      const finder = this.wrapped.lookup(ILabelModelParameterFinder.$class);
      if (finder) {
        return new RotatedNodeLabelModelParameterFinder(finder);
      }
    }
    return null;
  }

  /**
   * Returns the current geometry of the given label.
   * @param {!ILabel} label
   * @param {!ILabelModelParameter} parameter
   * @returns {!IOrientedRectangle}
   */
  getGeometry(label, parameter) {
    const styleWrapper = this.getNodeStyleWrapper(label);
    const wrappedParameter = this.getWrappedParameter(parameter);
    const orientedRectangle = wrappedParameter.model.getGeometry(label, wrappedParameter);
    if (
      !this.useNodeRotation
      || !(label.owner instanceof INode)
      || styleWrapper === null
      || styleWrapper.angle === 0
    ) {
      return orientedRectangle;
    }

    const rotatedCenter = styleWrapper.getRotatedPoint(
      orientedRectangle.orientedRectangleCenter,
      label.owner,
      true,
    );
    const rotatedLayout = styleWrapper.getRotatedLayout(label.owner);

    const rectangle = new OrientedRectangle(orientedRectangle);
    rectangle.angle += rotatedLayout.getRadians();
    rectangle.setCenter(rotatedCenter);
    return rectangle;
  }

  /**
   * Creates a wrapped instance of the wrapped label model's default parameter.
   * @returns {!RotatableNodeLabelModelDecoratorParameter}
   */
  createDefaultParameter() {
    return new RotatableNodeLabelModelDecoratorParameter(
      this.wrapped.createDefaultParameter(),
      this,
    );
  }

  /**
   * Creates a wrapped parameter containing the given parameter.
   * @param {!ILabelModelParameter} wrapped
   * @returns {!RotatableNodeLabelModelDecoratorParameter}
   */
  createWrappingParameter(wrapped) {
    return new RotatableNodeLabelModelDecoratorParameter(wrapped, this);
  }

  /**
   * Provides a lookup context for the given combination of label and parameter.
   * @param {!ILabel} label
   * @param {!ILabelModelParameter} parameter
   * @returns {!ILookup}
   */
  getContext(label, parameter) {
    const wrappedParameter = this.getWrappedParameter(parameter);
    return wrappedParameter.model.getContext(label, wrappedParameter);
  }

  /**
   * Returns the wrapped label model parameter
   * @param {!ILabelModelParameter} parameter
   * @returns {!ILabelModelParameter}
   */
  // eslint-disable-next-line class-methods-use-this
  getWrappedParameter(parameter) {
    return parameter instanceof RotatableNodeLabelModelDecoratorParameter
      ? parameter.wrapped
      : parameter;
  }

  /**
   * Returns the wrapping style for nodes when {@link RotatableNodeStyleDecorator}
   * is used, null otherwise.
   * @param {!ILabel} label
   * @returns {?RotatableNodeStyleDecorator}
   */
  // eslint-disable-next-line class-methods-use-this
  getNodeStyleWrapper(label) {
    const node = label.owner;
    if (node instanceof INode) {
      return node.style instanceof RotatableNodeStyleDecorator ? node.style : null;
    }
    return null;
  }

  /**
   * Returns that this label model can be converted.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  canConvert(context, value) {
    return true;
  }

  /**
   * Converts this label model using {@link RotatableNodeLabelModelDecoratorExtension}.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {!RotatableNodeLabelModelDecoratorExtension}
   */
  convert(context, value) {
    const extension = new RotatableNodeLabelModelDecoratorExtension();
    extension.wrapped = this.wrapped;
    extension.useNodeRotation = this.useNodeRotation;
    return extension;
  }
}

export default RotatableNodeLabelModelDecorator;
