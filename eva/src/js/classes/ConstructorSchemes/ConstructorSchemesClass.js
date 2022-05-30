import {
  GraphComponent,
  GraphEditorInputMode,
  License,
  EdgePathLabelModel,
  EdgeSides,
  InteriorLabelModel,
  ShapeNodeStyle,
  Size,
  PolylineEdgeStyle,
  DefaultLabelStyle,
  ILabel,
  LabelDropInputMode,
  DragDropEffects,
  IPort,
  PortDropInputMode,
  IEdge,
  DragSource,
  DragDropItem,
  NodeDropInputMode,
  GraphSnapContext,
  GraphItemTypes,
  SimpleNode,
  Rect,
  SimpleLabel,
  GridSnapTypes,
  ListEnumerable,
  ImageNodeStyle,
  VoidNodeStyle,
  Point,
  FreeNodeLabelModel,
  SimpleEdge,
  INode,
  WebGL2GraphModelManager,
  WebGL2SelectionIndicatorManager,
  Color,
} from 'yfiles';

import licenseData from '../../../license/license.json';
import { DragAndDropPanelItem, DragAndDropPanel } from './DnDPanelClass';
import HtmlLabelStyle from './HtmlLabelStyles';
import VuejsNodeStyle from './VueNodeStyle';

License.value = licenseData; // Проверка лицензии

class ConstructorSchemesClass {
  options = {
    defaultNodeStyle: {
      fill: '#FFFFFF',
      strokeColor: '#F4F4F4',
      strokeSize: '1.5px',
      size: [140, 140], // Width, height
    },
    defaultEdgeStyle: {
      strokeColor: '#FFFFFF',
      strokeSize: '1.5px',
      targetArrowColor: '#F4F4F4',
      targetArrowType: 'none',
      smoothingLength: 0,
    },
    defaultLabelStyle: {
      font: '12px Tahoma', // Size, family
      textFill: '#000000', // Color
    },
  }

  get defaultNodeStyle() {
    return this.options.defaultNodeStyle;
  }

  set defaultNodeStyle({
    fill = Color.TRANSPARENT,
    strokeColor = Color.TRANSPARENT,
    strokeSize = '1.5px',
    size = [140, 140],
  }) {
    this.options.defaultNodeStyle = {
      fill,
      strokeColor,
      strokeSize,
      size,
    };
  }

  get defaultEdgeStyle() {
    return this.options.defaultEdgeStyle;
  }

  set defaultEdgeStyle({
    strokeColor = '#FFFFFF',
    strokeSize = '1.5px',
    targetArrowColor = '#F4F4F4',
    targetArrowType = 'none',
    smoothingLength = 0,
  }) {
    this.options.defaultEdgeStyle = {
      strokeColor,
      strokeSize,
      targetArrowColor,
      targetArrowType,
      smoothingLength,
    };
  }

  get defaultLabelStyle() {
    return this.options.defaultLabelStyle;
  }

  set defaultLabelStyle({
    font = '12px Tahoma',
    textFill = '#000000',
  }) {
    this.options.defaultLabelStyle = {
      font,
      textFill,
    };
  }

  constructor({
    dndPanelContainerElem,
    dndPanelElem,
    elem,
    iconsList,
    edgeCustomStyles,
    nodeCustomStyles,
    labelCustomStyles,
  }) {
    // this.applyStylesElements();
    this.dragAndDropPanel = null;
    this.iconsList = iconsList;
    // initialize the GraphComponent
    this.graphComponent = new GraphComponent(elem);
    // this.enableWebGL2();
    // Configures default label model parameters for newly created graph elements
    this.setDefaultLabelParameters();
    // Configures default styles for newly created graph elements
    this.applyStylesElements({
      nodeCustomStyles,
      edgeCustomStyles,
      labelCustomStyles,
    });
    // this.setDefaultStyles();
    // Populates the graph and overrides some styles and label models
    // this.populateGraph();
    // Manages the viewport
    this.updateViewport();
    this.dndPanelContainerElem = dndPanelContainerElem;
    this.dndPanelElem = dndPanelElem;
    this.configureInputModes();
    this.initializeDnDPanel();
  }

  applyStylesElements({
    nodeCustomStyles,
    edgeCustomStyles,
    labelCustomStyles,
  }) {
    if (nodeCustomStyles) {
      this.defaultNodeStyle = {
        strokeColor: nodeCustomStyles.strokeColor,
        fill: nodeCustomStyles.fill,
        strokeSize: nodeCustomStyles.strokeSize,
      };
    }
    if (edgeCustomStyles) {
      this.defaultEdgeStyle = {
        strokeSize: edgeCustomStyles.strokeSize,
        strokeColor: edgeCustomStyles.strokeColor,
        smoothingLength: edgeCustomStyles.smoothingLength,
      };
    }
    if (labelCustomStyles) {
      this.defaultLabelStyle = {
        textFill: labelCustomStyles.textFill,
        font: labelCustomStyles.font,
      };
    }
    this.setDefaultStyles();
    if (this.dndPanelElem) {
      this.initializeDnDPanel();
    }
  }

  configureInputModes() {
    // configure the snapping context
    const mode = new GraphEditorInputMode({
      allowGroupingOperations: true,
      snapContext: new GraphSnapContext({
        nodeToNodeDistance: 30,
        nodeToEdgeDistance: -50,
        snapOrthogonalMovement: false,
        snapDistance: 10,
        snapSegmentsToSnapLines: true,
        snapBendsToSnapLines: true,
        gridSnapType: GridSnapTypes.ALL,
      }),
    });

    // create a new NodeDropInputMode to configure the drag and drop operation
    mode.nodeDropInputMode = new NodeDropInputMode({
      // enables the display of the dragged element during the drag
      showPreview: true,
      // initially disables snapping fo the dragged element to existing elements
      snappingEnabled: false,
      // by default the mode available in GraphEditorInputMode is disabled, so first enable it
      enabled: true,
      itemCreator: async (context, graph, dropData, dropTarget, dropLocation) => {
        console.group();
        console.log('context', context);
        console.log('graph', graph);
        console.log('dropData', dropData);
        console.log('dropTarget', dropTarget);
        console.log('dropLocation', dropLocation);
        console.groupEnd();
        const createdNode = graph.createNodeAt({
          location: dropLocation,
          style: dropData.style,
          labels: dropData.labels,
        });
        // Позиция и размеры нового элемента
        graph.setNodeLayout(createdNode, new Rect(
          dropLocation.x - (dropData.layout.width / 2),
          dropLocation.y - (dropData.layout.height / 2),
          dropData.layout.width,
          dropData.layout.height,
        ));
        return createdNode;
      },
      // nodes that have a DemoGroupStyle assigned have to be created as group nodes
      // isGroupNodePredicate: (draggedNode) => draggedNode.style instanceof DemoGroupStyle,
    });

    // Обновляем состояние графа(обязательно при работе с WebGl2)
    // mode.nodeDropInputMode.addItemCreatedListener(async (sender, evt) => {
    //   const node = await evt.item;
    //   this.graphComponent.graphModelManager.update(node);
    //   this.defaultNodeStyle = {
    //     fill: '#FFFFFF',
    //     strokeColor: '#FFFFFF',
    //     strokeSize: '1.5px',
    //     size: [140, 140],
    //   };
    //   this.setDefaultStyles();
    // });

    mode.labelDropInputMode = new LabelDropInputMode({
      showPreview: true,
      snappingEnabled: true,
      enabled: true,
      useBestMatchingParameter: true,
      // allow for nodes and edges to be the new label owner
      isValidLabelOwnerPredicate: (labelOwner) => labelOwner instanceof INode
        || labelOwner instanceof IEdge
        || labelOwner instanceof IPort,
    });

    mode.portDropInputMode = new PortDropInputMode({
      showPreview: true,
      snappingEnabled: false,
      enabled: true,
      useBestMatchingParameter: true,
      // allow only for nodes to be the new port owner
      isValidPortOwnerPredicate: (portOwner) => portOwner instanceof INode,
    });

    mode.deletableItems = GraphItemTypes.NODE | GraphItemTypes.EDGE;

    // this.graphComponent.graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
    //   ConstructorSchemesClass.getPortCandidateProvider,
    // );

    // configure the edge drop input mode
    // ConstructorSchemesClass.configureEdgeDropInputMode(mode);

    this.graphComponent.inputMode = mode;
  }

  // static getPortCandidateProvider(forNode) {
  //   // noinspection JSCheckFunctionSignatures
  //   return IPortCandidateProvider.fromCandidates([
  //     new DefaultPortCandidate(forNode, FreeNodePortLocationModel.NODE_TOP_ANCHORED.model),
  //   ]);
  // }

  static async webGl2CreateNode({
    graph,
    createdNode,
    dropData,
  }) {
    await graph.setStyle(
      createdNode,
      new ShapeNodeStyle({
        shape: 'round-rectangle',
        fill: ConstructorSchemesClass.colorToString(Color.from(dropData.style.fill.color)),
        stroke: `${ConstructorSchemesClass.colorToString(Color.from(dropData.style.stroke.fill.color))} ${dropData.style.stroke.thickness}px`,
      }),
    );
    return createdNode;
  }

  static colorToString(color) {
    console.log(`rgb(${color.r}, ${color.g}, ${color.b})`);
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  prepareNode({
    dropLocation,
    dropData,
  }) {
    this.graphComponent.graph.nodeDefaults.size = new Size(
      dropData.layout.width,
      dropData.layout.height,
    );
    return this.graphComponent.graph.createNodeAt(dropLocation);
  }

  static async webGl2CreateIcon({
    dropData,
    graph,
    createdNode,
  }) {
    // const ctx = ConstructorSchemesClass.createCanvasContext(dropData.layout.size);
    await graph.setStyle(
      createdNode,
      new ImageNodeStyle(dropData.style.image),
    );
    graph.addRelativePort(createdNode, new Point(30, -80));
    graph.addRelativePort(createdNode, new Point(30, 80));
    graph.addRelativePort(createdNode, new Point(0, 0));

    return createdNode;
  }

  enableWebGL2() {
    this.graphComponent.graphModelManager = new WebGL2GraphModelManager();
    this.graphComponent
      .selectionIndicatorManager = new WebGL2SelectionIndicatorManager(this.graphComponent);
  }

  setDefaultLabelParameters() {
    const { graph } = this.graphComponent;
    // For node labels, the default is a label position at the node center
    // Let's keep the default.  Here is how to set it manually
    graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER;

    // For edge labels, the default is a label that is rotated to match the associated edge segment
    // We'll start by creating a model that is similar to the default:
    const edgeLabelModel = new EdgePathLabelModel({
      autoRotation: true,
      distance: 10,
      sideOfEdge: EdgeSides.LEFT_OF_EDGE | EdgeSides.RIGHT_OF_EDGE,
    });
    // Finally, we can set this label model as the default for edge labels
    graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createDefaultParameter();
  }

  setDefaultStyles() {
    const { graph } = this.graphComponent;

    // Creates a nice ShapeNodeStyle instance, using an orange Fill.
    // Sets this style as the default for all nodes that don't have another
    // style assigned explicitly
    graph.nodeDefaults.ports.autoCleanUp = false;
    // graph.nodeDefaults.style = new ShapeNodeStyle({
    //   shape: 'round-rectangle',
    //   fill: this.defaultNodeStyle.fill,
    //   stroke: `${this.defaultNodeStyle.strokeSize} ${this.defaultNodeStyle.strokeColor}`,
    // });
    // graph.nodeDefaults.style = new ShapeNodeStyle({
    //   shape: 'round-rectangle',
    //   fill: this.defaultNodeStyle.fill,
    //   stroke: `${this.defaultNodeStyle.strokeSize} ${this.defaultNodeStyle.strokeColor}`,
    // });
    // Sets the default size for nodes explicitly to 40x40
    graph.nodeDefaults.style = new VuejsNodeStyle(`<g>
<rect fill="#C0C0C0" :width="layout.width" :height="layout.height" x="2" y="2"></rect>
<rect :fill="localUrl('bottomGradient')" stroke="#C0C0C0" :width="layout.width" :height="layout.height"></rect>
<rect v-if="tag.status === 'present'" :width="layout.width" height="2" fill="#55B757"></rect>
<rect v-else-if="tag.status === 'busy'" :width="layout.width" height="2" fill="#E7527C"></rect>
<rect v-else-if="tag.status === 'travel'" :width="layout.width" height="2" fill="#9945E9"></rect>
<rect v-else-if="tag.status === 'unavailable'" :width="layout.width" height="2" fill="#8D8F91"></rect>
<rect fill="transparent" :stroke="selected ? '#FF6C00' : 'transparent'" stroke-width="3" :width="layout.width-3" :height="layout.height-3" x="1.5" y="1.5"></rect>
<template v-if="zoom >= 0.7">
  <image :xlink:href="'./resources/' + tag.icon + '.svg'" x="15" y="10" width="63.75" height="63.75"></image>
  <image :xlink:href="'./resources/' + tag.status + '_icon.svg'" x="25" y="80" height="15" width="60"></image>
  <g style="font-family: Roboto,sans-serif; fill: #444" width="185">
    <text transform="translate(90 25)" style="font-size: 16px; fill: #336699">{{tag.name}}</text>
    <text transform="translate(90 45)" style="text-transform: uppercase">{{tag.position}}</text>
    <text transform="translate(90 72)">{{tag.email}}</text>
    <text transform="translate(90 88)">{{tag.phone}}</text>
    <text transform="translate(170 88)">{{tag.fax}}</text>
  </g>
</template>
<template v-else>
  <image :xlink:href="'./resources/' + tag.icon + '.svg'" x="15" y="20" width="56.25" height="56.25"></image>
  <g style="font-size: 15px; font-family: Roboto,sans-serif; fill: #444" width="185">
    <text transform="translate(85 40)" style="font-size: 26px; fill: #336699">{{tag.name}}</text>
    <svg-text :content="tag.position.toUpperCase()" x="85" y="50" :width="layout.width - 100" :height="50" :wrapping="4" font-family="sans-serif" :font-size="14" :font-style="0" :font-weight="0" :text-decoration="0" fill="black" :opacity="1" :visible="true" :clipped="true" align="start" transform=""></svg-text>
  </g>
</template>
<defs>
  <linearGradient :id="localId('bottomGradient')" x1="0%" y1="100%" x2="0%" y2="0%">
    <stop offset="0%" v-if="tag.status === 'present'" style="stop-color:#76b041;stop-opacity:1"/>
    <stop offset="0%" v-else-if="tag.status === 'busy'" style="stop-color:#ab2346;stop-opacity:1"/>
    <stop offset="0%" v-else-if="tag.status === 'travel'" style="stop-color:#a367dc;stop-opacity:1"/>
    <stop offset="0%" v-else-if="tag.status === 'unavailable'" style="stop-color:#c1c1c1;stop-opacity:1"/>
    <stop offset="5%" style="stop-color:white;stop-opacity:1" />
  </linearGradient>
</defs>
</g>`);
    graph.nodeDefaults.size = new Size(
      this.defaultNodeStyle.size[0],
      this.defaultNodeStyle.size[1],
    );

    // Creates a PolylineEdgeStyle which will be used as default for all edges
    // that don't have another style assigned explicitly
    graph.edgeDefaults.style = new PolylineEdgeStyle({
      smoothingLength: this.defaultEdgeStyle.smoothingLength,
      stroke: `${this.defaultEdgeStyle.strokeSize} solid ${this.defaultEdgeStyle.strokeColor}`,
      targetArrow: `${this.defaultEdgeStyle.targetArrowColor} ${this.defaultEdgeStyle.targetArrowType}`,
    });

    // Creates a label style with the label font set to Tahoma and a black text color
    const defaultLabelStyle = new DefaultLabelStyle({
      font: this.defaultLabelStyle.font,
      textFill: this.defaultLabelStyle.textFill,
    });

    // Sets the defined style as the default for both edge and node labels
    graph.nodeDefaults.labels.style = new HtmlLabelStyle(defaultLabelStyle.font);
    graph.edgeDefaults.labels.style = new HtmlLabelStyle(defaultLabelStyle.font);
  }

  async updateViewport() {
    // Uncomment the following line to update the content rectangle
    // to include all graph elements
    // This should result in correct scrolling behaviour:

    // graphComponent.updateContentRect();

    // Additionally, we can also set the zoom level so that the
    // content rectangle fits exactly into the viewport area:
    // Uncomment this line in addition to UpdateContentRect:
    // Note that this changes the zoom level (i.e. the graph elements will look smaller)

    // graphComponent.fitContent();

    // The sequence above is equivalent to just calling:
    await this.graphComponent.fitGraphBounds();
  }

  initializeDnDPanel() {
    // initialize panel for yFiles drag and drop
    this.dragAndDropPanel = new DragAndDropPanel(this.dndPanelElem);
    // Set the callback that starts the actual drag and drop operation
    this.dragAndDropPanel.beginDragCallback = (element, data) => {
      const dragPreview = element.cloneNode(true);
      dragPreview.style.margin = '0';

      let dragSource = null;
      if (data instanceof ILabel) {
        dragSource = LabelDropInputMode.startDrag(
          element,
          data,
          DragDropEffects.ALL,
          true,
          dragPreview,
        );
      } else if (data instanceof IPort) {
        dragSource = PortDropInputMode.startDrag(
          element,
          data,
          DragDropEffects.ALL,
          true,
          dragPreview,
        );
      } else if (data instanceof IEdge) {
        new DragSource(element).startDrag(
          new DragDropItem(IEdge.$class.name, data),
          DragDropEffects.ALL,
        );
      } else {
        dragSource = NodeDropInputMode.startDrag(
          element,
          data,
          DragDropEffects.ALL,
          true,
          dragPreview,
        );
      }

      // let the GraphComponent handle the preview rendering if possible
      if (dragSource) {
        dragSource.addQueryContinueDragListener((src, args) => {
          if (args.dropTarget === null) {
            ConstructorSchemesClass.removeClass(dragPreview, 'hidden');
          } else {
            ConstructorSchemesClass.addClass(dragPreview, 'hidden');
          }
        });
      }
    };

    this.dragAndDropPanel.maxItemWidth = 160;
    this.dragAndDropPanel.populatePanel(
      ConstructorSchemesClass.createDnDPanelItems({
        iconsList: this.iconsList,
        defaultEdgeStyle: this.defaultEdgeStyle,
        defaultNodeStyle: this.defaultNodeStyle,
        defaultLabelStyle: this.defaultLabelStyle,
      }),
    );
  }

  parseDataJson(jsonData) {
    this.graphComponent.selection.selectedNodes.forEach((node) => {
      try {
        node.tag = JSON.parse(jsonData);
        // ConstructorSchemesClass.removeClass(errorArea, 'open-error');
      } catch (err) {
        console.log('ERROR', err);
        // addClass(errorArea, 'open-error');
        // errorArea.setAttribute('title', err.toString());
      }
    });
    this.graphComponent.invalidate();
  }

  static generateIconNodes(iconsList) {
    return iconsList.map((icon) => {
      const imageStyleNode = new SimpleNode();
      imageStyleNode.layout = new Rect(0, 0, icon.width, icon.height);
      imageStyleNode.style = new ImageNodeStyle(icon.src);
      return new DragAndDropPanelItem(imageStyleNode, icon.label);
    });
  }

  static createDnDPanelDefaultNode(defaultNodeStyle) {
    const defaultNode = new SimpleNode();
    defaultNode.layout = new Rect(
      0,
      0,
      defaultNodeStyle.size[0],
      defaultNodeStyle.size[1],
    );
    defaultNode.style = new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: defaultNodeStyle.fill,
      stroke: `${defaultNodeStyle.strokeSize} ${defaultNodeStyle.strokeColor}`,
    });
    return new DragAndDropPanelItem(defaultNode, 'Demo Node');
  }

  static createDnDPanelDataNode(defaultNodeStyle) {
    const dataNode1 = new SimpleNode();
    dataNode1.layout = new Rect(0, 0, defaultNodeStyle.size[0], defaultNodeStyle.size[0]);
    dataNode1.style = new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: 'transparent',
      stroke: 'transparent',
    });
    const dataNode1Label = new SimpleLabel(
      dataNode1,
      '<span style="font-size: 100px;">Test label</span>',
    );
    dataNode1.labels = new ListEnumerable([dataNode1Label]);
    return new DragAndDropPanelItem(dataNode1, 'Data node 1');
  }

  // TODO: Вынести создание элементов панели в отдельные методы для передачи входных данных снаружи
  static createDnDPanelItems({
    iconsList,
    defaultNodeStyle,
    defaultEdgeStyle,
    defaultLabelStyle,
  }) {
    const itemContainer = [];

    // Create some nodes
    // const groupNodeStyle = new DemoGroupStyle();

    // A label model with insets for the expand/collapse button
    // const groupLabelModel = new InteriorStretchLabelModel({ insets: 4 });
    //
    // const groupLabelStyle = new DefaultLabelStyle({
    //   textFill: 'white',
    // });
    //
    // const groupNode = new SimpleNode();
    // groupNode.layout = new Rect(0, 0, 80, 80);
    // // groupNode.style = '';
    // const groupLabel = new SimpleLabel(
    //   groupNode,
    //   'Group Node',
    //   groupLabelModel.createParameter(InteriorStretchLabelModelPosition.NORTH),
    // );
    // groupLabel.style = groupLabelStyle;
    // groupNode.labels = new ListEnumerable([groupLabel]);
    // itemContainer.push(new DragAndDropPanelItem(groupNode, 'Group Node'));
    // Узел создаваемый кликом по графу

    // Стандартный узел
    itemContainer.push(ConstructorSchemesClass.createDnDPanelDefaultNode(defaultNodeStyle));

    // Ребра
    const edge1 = new SimpleEdge({
      style: new PolylineEdgeStyle({
        smoothingLength: defaultEdgeStyle.smoothingLength,
        // [color]
        // [scale - xx-small|x-small|small|medium|large|x-large|xx-large]
        // type- normal|none|default|simple|short|diamond|cross|circle|ball|triangle
        targetArrow: 'none',
        sourceArrow: 'none',
        stroke: `${defaultEdgeStyle.strokeSize} solid ${defaultEdgeStyle.strokeColor}`, // '[thickness] [type] color'
      }),
    });
    itemContainer.push(new DragAndDropPanelItem(edge1, 'Default'));

    // Узел с данными
    itemContainer.push(ConstructorSchemesClass.createDnDPanelDataNode(defaultNodeStyle));

    // Иконки
    if (iconsList?.length > 0) {
      itemContainer.push(...ConstructorSchemesClass.generateIconNodes(iconsList));
    }

    // Подписи к узлам\ребрам
    const labelNode = new SimpleNode();
    labelNode.layout = new Rect(0, 0, defaultNodeStyle.size[0], defaultNodeStyle.size[0]);
    labelNode.style = new VoidNodeStyle();

    const labelStyle = new DefaultLabelStyle({
      backgroundStroke: 'transparent',
      backgroundFill: 'transparent',
      insets: [3, 5, 3, 5],
      textFill: defaultLabelStyle.textFill,
      font: defaultLabelStyle.font,
    });

    const label = new SimpleLabel(
      labelNode,
      'label',
      FreeNodeLabelModel.INSTANCE.createDefaultParameter(),
    );
    label.style = labelStyle;
    label.preferredSize = labelStyle.renderer.getPreferredSize(label, labelStyle);
    labelNode.tag = label;
    labelNode.labels = new ListEnumerable([label]);
    itemContainer.push(new DragAndDropPanelItem(labelNode, 'Label'));

    return itemContainer;
  }

  static removeClass(e, className) {
    const classes = e.getAttribute('class');
    if (classes !== null && classes !== '') {
      if (classes === className) {
        e.setAttribute('class', '');
      } else {
        const result = classes
          .split(' ')
          .filter((s) => s !== className)
          .join(' ');
        e.setAttribute('class', result);
      }
    }
    return e;
  }

  static addClass(e, className) {
    const classes = e.getAttribute('class');
    if (classes === null || classes === '') {
      e.setAttribute('class', className);
    } else if (!ConstructorSchemesClass.hasClass(e, className)) {
      e.setAttribute('class', `${classes} ${className}`);
    }
    return e;
  }

  static hasClass(e, className) {
    const classes = e.getAttribute('class') || '';
    const r = new RegExp(`\\b${className}\\b`, '');
    return r.test(classes);
  }

  static async createUrlIcon(ctx, url, imageSize, iconSize) {
    return new Promise((resolve, reject) => {
      // create an Image from the url
      const image = new Image(imageSize.width, imageSize.height);
      image.onload = () => {
        // render the image into the canvas
        ctx.clearRect(0, 0, iconSize.width, iconSize.height);
        ctx.drawImage(
          image,
          0,
          0,
          imageSize.width,
          imageSize.height,
          0,
          0,
          iconSize.width,
          iconSize.height,
        );
        const imageData = ctx.getImageData(0, 0, iconSize.width, iconSize.height);
        resolve(imageData);
      };
      image.onerror = () => {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Loading the image failed.');
      };
      image.src = url;
    });
  }

  static createCanvasContext(iconSize) {
    // canvas used to pre-render the icons
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', `${iconSize.width}`);
    canvas.setAttribute('height', `${iconSize.height}`);
    return canvas.getContext('2d');
  }

  // Дополнительные порты
  // static getPortCandidateProvider(forNode) {
  //   const model = new CustomNodePortLocationModel(10);
  //   // noinspection JSCheckFunctionSignatures
  //   return IPortCandidateProvider.fromCandidates([
  //     new DefaultPortCandidate(forNode, model.createCustomParameter(PortLocation.CENTER)),
  //     new DefaultPortCandidate(forNode, model.createCustomParameter(PortLocation.NORTH)),
  //     new DefaultPortCandidate(forNode, model.createCustomParameter(PortLocation.EAST)),
  //     new DefaultPortCandidate(forNode, model.createCustomParameter(PortLocation.SOUTH)),
  //     new DefaultPortCandidate(forNode, model.createCustomParameter(PortLocation.WEST)),
  //   ]);
  // }
}

export default ConstructorSchemesClass;
