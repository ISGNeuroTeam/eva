import {
  Color,
  DefaultLabelStyle,
  DefaultPortCandidate,
  DragDropEffects,
  DragDropItem,
  DragSource,
  EdgePathLabelModel,
  EdgeSides,
  EventRecognizers,
  ItemMapping,
  GraphComponent,
  GraphEditorInputMode,
  LabelLayerPolicy,
  GraphMLIOHandler,
  GraphMLSupport,
  MoveLabelInputMode,
  GraphSnapContext,
  GridSnapTypes,
  HandlePositions,
  HierarchicNestingPolicy,
  ICommand,
  ImageNodeStyle,
  IEdge,
  IEdgeReconnectionPortCandidateProvider,
  ILabel,
  INode,
  InteriorLabelModel,
  IPort,
  IReshapeHandler,
  KeyEventRecognizers,
  LabelDropInputMode,
  License,
  ListEnumerable,
  MouseEventRecognizers,
  NodeDropInputMode,
  NodeReshapeHandleProvider,
  NodeStylePortStyleAdapter,
  Point,
  PolylineEdgeStyle,
  PortDropInputMode,
  Rect,
  ShapeNodeStyle,
  SimpleEdge,
  SimpleNode,
  StorageLocation,
  VoidNodeStyle,
  SimplePort,
  FreeNodePortLocationModel,
  GraphViewerInputMode,
  PortRelocationHandleProvider,
  PortSide,
  PortConstraint,
  Visualization, EdgeRouterData, EdgeRouter, EdgeRouterScope, BridgeManager, GraphObstacleProvider,
} from 'yfiles';
import Utils from './Utils.js';
import { throttle } from '@/js/utils/throttle';
import licenseData from '../../../license/license.json';
import { DragAndDropPanel, DragAndDropPanelItem } from './DnDPanelClass';
import HtmlLabelStyle from './HtmlLabelStyles';
import VuejsNodeStyle from './VueNodeStyle.js';
import { EdgePathPortCandidateProvider } from './EdgePathPortCandidateProvider';
import VuejsNodeStyleMarkupExtension from './VuejsNodeStyleMarkupExtension.js';
import EdgeDropInputMode from './EdgeDropInputModeClass';
import GenerateIcons from './GenerateIcons.js';
import SchemeUpdater from './SchemeUpdater.js';
import elementTemplates from './elementTemplates.js';
import ElementCreator from '@/js/classes/ConstructorSchemes/ElementCreator';
import GenerateElementsFromSearch from '@/js/classes/ConstructorSchemes/GenerateElementsFromSearch';

License.value = licenseData; // Проверка лицензии

class ConstructorSchemesClass {
  /* Static methods */
  static getColorForColorPicker(color) {
    return {
      rgba: {
        r: color.r,
        g: color.g,
        b: color.b,
        a: color.a,
      },
      rgbaString: Utils.colorToString(
        color,
        false,
      ),
    };
  }

  static createReactiveNode(data, isRgbaColor) {
    const dataNode = new SimpleNode();
    dataNode.tag = {
      ...data.dataRest,
      nodeId: dataNode.hashCode(),
    };
    if (isRgbaColor) {
      dataNode.tag = {
        ...dataNode.tag,
        borderColor: Utils.generateColor(Color.from(data.dataRest.borderColor.rgbaString)),
        textColor: Utils.generateColor(Color.from(data.dataRest.textColor.rgbaString)),
        bgColor: Utils.generateColor(Color.from(data.dataRest.bgColor.rgbaString)),
      };
    }
    dataNode.style = new VuejsNodeStyle(data.template);
    const width = data.dataRest.dataType === 'data-type-4'
      ? data.dataRest.types[data.dataRest.type].initialWidth : data.width;
    const height = data.dataRest.dataType === 'data-type-4'
      ? data.dataRest.types[data.dataRest.type].initialHeight : data.height;
    dataNode.layout = new Rect(
      0,
      0,
      width,
      height || data.rowHeight * (data?.dataRest?.items?.length || 1),
    );
    return dataNode;
  }

  static getEdgeOptions(edge) {
    const { color } = edge.style.stroke.fill;
    return {
      strokeColor: {
        rgbaObject: Utils.colorToRgbaObject(color),
        rgbaString: Utils.colorToString(Color.from(color)),
      },
      thickness: `${edge.style.stroke.thickness}px`,
      smoothingLength: edge.style.smoothingLength,
    };
  }

  static getVerticalPositionWithOffset({
    position, count, offset,
  }) {
    return position + offset;
  }

  // TODO: Временный метод, для обновления
  static upgradeNodeTag(node) {
    if (node?.tag?.dataType === '0' || node?.tag?.dataType === '1') {
      return {
        ...node.tag,
        dataType: 'data-type-0',
      };
    }
    if (node?.tag?.dataType === '2' || node?.tag?.dataType === '3') {
      return {
        ...node.tag,
        dataType: 'data-type-1',
      };
    }
    if (node?.tag?.dataType === '4') {
      return {
        ...node.tag,
        dataType: 'data-type-2',
      };
    }
    if (node?.tag?.dataType === '5') {
      return {
        ...node.tag,
        dataType: 'data-type-3',
      };
    }
    if (node?.tag?.dataType === '5') {
      return {
        ...node.tag,
        dataType: 'data-type-3',
      };
    }
    if (node?.tag?.dataType === 'label-0') {
      return {
        ...node.tag,
        dataType: 'label-type-0',
      };
    }
    if (node?.tag?.dataType === 'default-node') {
      return {
        ...node.tag,
        dataType: 'shape-type-0',
      };
    }
    if (node?.tag === 'invisible') {
      return {
        dataType: 'invisible',
      };
    }
    return node.tag;
  }

  /* Variables */
  defaultDataSource = []

  // Main constructor options
  options = {
    defaultNodeSize: [150, 150],
    defaultNodeStyle: {
      shape: 0,
      fill: '#FFFFFF',
      strokeColor: '#F4F4F4',
      strokeSize: '1.5px',
    },
    defaultEdgeStyle: {
      strokeColor: '#FFFFFF',
      strokeSize: '1.5px',
      targetArrowColor: '#F4F4F4',
      targetArrowType: 'none',
      smoothingLength: 0,
    },
    defaultLabelStyle: {
      font: '12px "ProximaNova", sans-serif', // Size, family
      textFill: '#000000', // Color
    },
    selectedShapeNodeStyle: '',
    isEdit: false,
    loadingDnDPanelItems: false,
  }

  // Additional options
  localVariables = {
    isEdgeCreating: false,
    creatingEdge: null,
    dataRest: [],
  }

  /* Getters/setters */

  get defaultDataSource() {
    return this.defaultDataSource;
  }

  set defaultDataSource(value) {
    this.defaultDataSource = value;
  }

  get loadingDnDPanelItems() {
    return this.options.loadingDnDPanelItems;
  }

  set loadingDnDPanelItems(value) {
    this.options.loadingDnDPanelItems = value;
  }

  get isEdit() {
    return this.options.isEdit;
  }

  set isEdit(val) {
    this.options.isEdit = val;
  }

  get defaultNodeSize() {
    return this.options.defaultNodeSize;
  }

  set defaultNodeSize(value) {
    this.options.defaultNodeSize = value;
  }

  get creatingEdge() {
    return this.localVariables.creatingEdge;
  }

  set creatingEdge(value) {
    this.localVariables.creatingEdge = value;
  }

  get isEdgeCreating() {
    return this.localVariables.isEdgeCreating;
  }

  set isEdgeCreating(value) {
    this.localVariables.isEdgeCreating = value;
  }

  get selectedShapeNodeStyle() {
    return this.options.selectedShapeNodeStyle;
  }

  set selectedShapeNodeStyle(value) {
    this.options.selectedShapeNodeStyle = value;
  }

  get defaultNodeStyle() {
    return this.options.defaultNodeStyle;
  }

  set defaultNodeStyle({
    shape = 0,
    fill = Color.TRANSPARENT,
    strokeColor = Color.TRANSPARENT,
    strokeSize = '1.5px',
  }) {
    this.options.defaultNodeStyle = {
      fill,
      strokeColor,
      strokeSize,
      shape,
    };
  }

  get defaultEdgeStyle() {
    return this.options.defaultEdgeStyle;
  }

  set defaultEdgeStyle({
    strokeColor = '#FFFFFF',
    strokeSize = '1px',
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
    font = `12px ${this.fontFamily}`,
    textFill = '#000000',
  }) {
    this.options.defaultLabelStyle = {
      font,
      textFill,
    };
  }

  get dataRest() {
    return this.localVariables.dataRest;
  }

  set dataRest(value) {
    this.localVariables.dataRest = value;
  }

  constructor({
    elem, // HTML элемент для отображения схемы
    dndPanelElem, // HTML элемент для отображения панели с элементами
    schemeId, // Идентификатор активной схемы
    dataRest, // Данные для схемы
    iconsList, // Список изображений
    savedGraph, // Сохраненная схема(old)
    savedGraphObject, // Сохраненная схема
    updateStoreCallback, // Обновление сохраненной схемы(old)
    updateStoreCallbackV2, // Обновление сохраненной схемы
    openDataPanelCallback, // Коллбэк для открытия панели с элементами
    closeDataPanelCallback, // Коллбэк для закрытия панели с элементами
    toggleLoadingCallback, // Коллбэк переключения состояния загрузки
    isEdit, // Флаг состояния дашборда(редактирование\нет)
    onClickObject, // Коллбэк для события click
    isBridgesEnable, // Флаг вкл\выкл обработку пересечения линий
  }) {
    this.dragAndDropPanel = null;
    this.schemeUpdater = null;
    this.elem = elem;
    this.isEdit = isEdit;
    this.dataRest = dataRest;
    this.iconsList = iconsList;
    this.schemeId = schemeId;
    // Сохранение через GraphML
    this.savedGraph = savedGraph;
    this.savedGraphObject = savedGraphObject;
    this.updateStoreCallback = updateStoreCallback;
    this.updateStoreCallbackV2 = updateStoreCallbackV2;
    this.openDataPanelCallback = openDataPanelCallback;
    this.closeDataPanelCallback = closeDataPanelCallback;
    this.toggleLoadingCallback = toggleLoadingCallback;
    this.elementTemplates = elementTemplates.templates;
    this.fontFamily = elementTemplates.fontFamily;
    // Вторая реализация сохранения данных
    this.targetDataNode = {};
    this.graphComponent = new GraphComponent(elem);
    this.additionalEdgeToEdgeSettings();
    this.setDefaultLabelParameters();
    this.enableUndo();
    if (this.isEdit) {
      this.configureInputModes(
        this.updateStoreCallback,
        this.openDataPanelCallback,
        this.closeDataPanelCallback,
      );
    } else {
      this.enableViewerInputMode();
    }
    // old
    // Сохранение через GraphML
    // this.initializeIO();
    if (this.savedGraphObject && !this.savedGraph) {
      this.load(dndPanelElem);
    }
    this.disableResizeInvisibleNodes();

    this.registerReshapeHandleProvider();
    this.graphComponent.graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NODES;
    // Привязка z-order у label к родителю
    this.graphComponent.graphModelManager.labelLayerPolicy = LabelLayerPolicy.AT_OWNER;
    this.onClickObject = onClickObject;
    if (isBridgesEnable) {
      this.enableBridges();
    }
  }

  /* Async methods */
  // eslint-disable-next-line class-methods-use-this,default-param-last
  async exportGraphToJSON(schemeId = 'scheme', savedGraphObject) {
    return new Promise((resolve) => {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(savedGraphObject))}`;
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `${schemeId}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      resolve();
    });
  }

  // Load
  async importGraphFromJSON(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const { result } = event.target;
        if (result) {
          this.update(JSON.parse(result));
        }
      };
      reader.readAsText(file);
      resolve();
    }).then(() => {
      this.setDefaultElementsOrder();
    });
  }

  async nodeCreator({
    dropData,
    dropLocation,
  }) {
    return new Promise((resolve) => {
      const element = {
        layout: {
          width: dropData.layout.width,
          height: dropData.layout.height,
          x: dropLocation.x - (dropData.layout.width / 2),
          y: dropLocation.y - (dropData.layout.height / 2),
        },
        icon: dropData?.style?.image,
        tag: {
          ...dropData.tag,
          nodeId: dropData?.id || dropData?.hashCode(),
        },
      };
      ElementCreator.createNode({
        element,
        graph: this.graphComponent.graph,
        elementTemplates,
      }).then((createdElement) => {
        resolve(createdElement);
      });
    });
  }

  async updateViewport() {
    await this.graphComponent.fitGraphBounds();
  }

  async createDnDPanelItems({
    iconsList,
  }) {
    this.loadingDnDPanelItems = true;
    return new Promise((resolve) => {
      const items = [];
      // Ребра
      items.push({
        panelItem: this.createDndPanelDefaultEdge(
          'Стандартные элементы',
          'default-element',
        ),
        id: 'default-edge',
      });
      if (this.elementTemplates) {
        Object.entries(this.elementTemplates).forEach(([
          key,
          value,
        ]) => {
          if (key.includes('shape-type')) {
            items.push({
              panelItem: this.createDnDPanelDefaultNode(value),
              id: 'default-node',
            });
          }
          if (key.includes('data-type')) {
            items.push(
              new DragAndDropPanelItem(
                ConstructorSchemesClass.createReactiveNode(value),
                'Элменты с данными',
                'data-node',
              ),
            );
          }
          if (key.includes('label-type')) {
            items.push(
              new DragAndDropPanelItem(
                ConstructorSchemesClass.createReactiveNode(value, true),
                'Элементы с текстом',
                'text-node',
              ),
            );
          }
        });
      }

      const portNode = new SimpleNode();
      portNode.layout = new Rect(0, 0, 5, 5);
      portNode.style = new VoidNodeStyle();
      const port = new SimplePort(portNode, FreeNodePortLocationModel.NODE_CENTER_ANCHORED);
      port.style = new NodeStylePortStyleAdapter(
        new ShapeNodeStyle({
          fill: 'transparent',
          stroke: 'cornflowerblue',
          shape: 'ellipse',
        }),
      );
      portNode.tag = port;
      portNode.ports = new ListEnumerable([port]);
      items.push(new DragAndDropPanelItem(portNode, 'Порт', 'port-node'));

      // Узел с изображением\иконкой
      if (iconsList?.length > 0) {
        this.getIconsListForGraph({
          iconsList,
          maxItemSize: this.dragAndDropPanel.getMaxItemWidth,
          minItemSize: 150,
        }).then((result) => {
          result.forEach((item) => {
            items.push(
              new DragAndDropPanelItem(
                item.icon.node,
                item.icon.tooltip,
                item.icon.dataType,
              ),
            );
          });
          resolve(items);
        });
      } else {
        resolve(items);
      }
    });
  }

  /* Methods */

  updateImageNode(node) {
    const { image } = node.style;
    if (image?.includes('icon-test-11')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-11', 'element-10')),
      );
    } else if (image?.includes('icon-test-12')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-12', 'element-11-left')),
      );
    } else if (image?.includes('icon-test-13')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-13', 'element-11-right')),
      );
    } else if (image?.includes('icon-test-14')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-14', 'element-12-top')),
      );
    } else if (image?.includes('icon-test-18')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-18', 'element-13')),
      );
    } else if (image?.includes('icon-test-10')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-10', 'element-15')),
      );
    } else if (image?.includes('icon-test-1')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-1', 'element-1')),
      );
    }
    if (image?.includes('icon-test-20')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-20', 'element-22')),
      );
    } else if (image?.includes('icon-test-2')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-2', 'element-2')),
      );
    }
    if (image?.includes('icon-test-3')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-3', 'element-3')),
      );
    }
    if (image?.includes('icon-test-4-top')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-4-top', 'element-4-top')),
      );
    } else if (image?.includes('icon-test-4-right')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-4-right', 'element-4-left')),
      );
    } else if (image?.includes('icon-test-4-left')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-4-left', 'element-4-left')),
      );
    } else if (image?.includes('icon-test-4-bottom')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-4-bottom', 'element-4-bottom')),
      );
    } else if (image?.includes('icon-test-4')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-4', 'element-4-top')),
      );
    }
    if (image?.includes('icon-test-5')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-5', 'element-5')),
      );
    }
    if (image?.includes('icon-test-6')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-6', 'element-6')),
      );
    }
    if (image?.includes('icon-test-7')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-7', 'element-7')),
      );
    }
    if (image?.includes('icon-test-8')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-8', 'element-8')),
      );
    }
    if (image?.includes('icon-test-9')) {
      this.graphComponent.graph.setStyle(
        node,
        new ImageNodeStyle(image.replace('icon-test-9', 'element-9')),
      );
    }
  }

  disableResizeInvisibleNodes() {
    const { nodeDecorator } = this.graphComponent.graph.decorator;

    // Отключаем изменение размеров у ненвидимых узлов
    nodeDecorator.reshapeHandleProviderDecorator
      .hideImplementation((node) => node?.tag?.dataType === 'invisible');
  }

  createDnDPanelDefaultNode(data) {
    const defaultNode = new SimpleNode();
    defaultNode.layout = new Rect(
      0,
      0,
      this.defaultNodeSize[0],
      this.defaultNodeSize[1],
    );
    defaultNode.style = new VuejsNodeStyle(this.elementTemplates[data.dataRest.dataType].template);
    defaultNode.tag = {
      dataType: data.dataRest.dataType,
      fill: Utils.generateColor(data.dataRest.fill),
      strokeColor: Utils.generateColor(data.dataRest.strokeColor),
      thickness: data.dataRest.strokeSize,
      shape: data.dataRest.shape,
      nodeId: 'dnd-simple-node',
    };
    return new DragAndDropPanelItem(defaultNode, 'Стандартные элементы', 'default-element');
  }

  createDndPanelDefaultEdge(tooltip, elementType) {
    const edge = new SimpleEdge({
      style: new PolylineEdgeStyle({
        smoothingLength: this.defaultEdgeStyle.smoothingLength,
        targetArrow: 'none',
        sourceArrow: 'none',
        stroke: `${this.defaultEdgeStyle.strokeSize} solid ${this.defaultEdgeStyle.strokeColor}`,
      }),
    });
    edge.tag = {
      ...edge.tag,
      edgeId: 'dnd-simple-edge',
    };
    return new DragAndDropPanelItem(edge, tooltip, elementType);
  }

  initSchemeUpdater() {
    return new SchemeUpdater({
      graph: this.graphComponent.graph,
      elementsFromStore: this.savedGraphObject,
      updateStoreCallback: this.updateStoreCallbackV2,
    });
  }

  renderVueTemplateNode() {
    this.graphComponent.graph.nodes.forEach((node) => {
      if (node.tag.dataType || node?.tag[0] === 'i' || node?.tag === 'invisible') {
        if (node.tag.dataType !== 'image-node' && node?.tag?.dataType !== 'invisible') {
          node.tag = ConstructorSchemesClass.upgradeNodeTag(node);
          if (node.tag.dataType === 'data-type-3') {
            const imagePath = node.tag.activeImage?.path || node.tag.defaultImagePath;
            this.graphComponent.graph.setStyle(
              node,
              imagePath
                ? new ImageNodeStyle(imagePath)
                : new VuejsNodeStyle(this.elementTemplates[node.tag.dataType].template),
            );
          } else {
            this.graphComponent.graph.setStyle(
              node,
              new VuejsNodeStyle(this.elementTemplates[node.tag.dataType].template),
            );
          }
        }
        this.updateImageNode(node);
      }
    });
  }

  // Settings GraphML
  initializeIO() {
    const graphmlHandler = new GraphMLIOHandler();
    // enable serialization of the VueJS node style -
    // without a namespace mapping, serialization will fail
    graphmlHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/demos/yfiles-vuejs-node-style/1.0',
      { VuejsNodeStyle: VuejsNodeStyleMarkupExtension },
    );
    graphmlHandler.addNamespace(
      'http://www.yworks.com/demos/yfiles-vuejs-node-style/1.0',
      'VuejsNodeStyle',
    );
    graphmlHandler.addHandleSerializationListener((sender, args) => {
      const { item } = args;
      const { context } = args;
      if (item instanceof VuejsNodeStyle) {
        const vuejsNodeStyleMarkupExtension = new VuejsNodeStyleMarkupExtension();
        vuejsNodeStyleMarkupExtension.template = item.template;
        context.serializeReplacement(
          VuejsNodeStyleMarkupExtension.$class,
          item,
          vuejsNodeStyleMarkupExtension,
        );
        args.handled = true;
      }
    });
    // this.zOrderSupport.configureZOrderGraphMLIOHandler(graphmlHandler);

    if (this.savedGraph) {
      graphmlHandler.readFromGraphMLText(this.graphComponent.graph, this.savedGraph).then(() => {
        this.initGraphMlSupport(graphmlHandler);
      });
    } else {
      this.initGraphMlSupport(graphmlHandler);
    }
  }

  initGraphMlSupport(graphmlHandler) {
    return new GraphMLSupport({
      graphComponent: this.graphComponent,
      graphMLIOHandler: graphmlHandler,
      storageLocation: StorageLocation.FILE_SYSTEM,
    });
  }

  saveAnObject() {
    const schemeUpdater = this.initSchemeUpdater();
    schemeUpdater.save().then((result) => {
      this.updateStoreCallbackV2(result);
    });
  }

  update(elements) {
    this.savedGraphObject = elements;
    const schemeUpdater = this.initSchemeUpdater();
    this.graphComponent.graph.clear();
    schemeUpdater.load().then(() => {
      // Применение VueJsNodeStyle
      this.renderVueTemplateNode();
      // Установка z-order по-умолчанию
      this.setDefaultElementsOrder();
      // Выравнивание графа, инициализация dnd панели
      return this.updateViewport();
    });
  }

  load(dndPanelElem) {
    const schemeUpdater = this.initSchemeUpdater();
    schemeUpdater.load().then(() => {
      // Применение VueJsNodeStyle
      this.renderVueTemplateNode();
      // Установка z-order по-умолчанию
      this.setDefaultElementsOrder();
      // Выравнивание графа, инициализация dnd панели
      this.updateViewport().then(() => {
        this.dndPanelElem = dndPanelElem;
        this.initializeDnDPanel();
      });
    });
  }

  registerReshapeHandleProvider() {
    const { nodeDecorator } = this.graphComponent.graph.decorator;

    // return customized reshape handle provider for the orange, blue and green node
    nodeDecorator.reshapeHandleProviderDecorator.setFactory(
      (node) => node?.tag?.isAspectRatio,
      (node) => {
        // Create a default reshape handle provider for nodes
        const reshapeHandler = node.lookup(IReshapeHandler.$class);
        const provider = new NodeReshapeHandleProvider(
          node,
          reshapeHandler,
          HandlePositions.BORDER,
        );
          // Show only handles at the corners and always use aspect ratio resizing
        provider.handlePositions = HandlePositions.CORNERS;
        provider.ratioReshapeRecognizer = EventRecognizers.ALWAYS;
        return provider;
      },
    );
  }

  applyStylesElements(styles) {
    if (styles) {
      this.defaultNodeStyle = {
        shape: styles.nodeShape || 0,
        fill: styles.nodeFill.rgbaString,
        strokeColor: styles.nodeStrokeColor.rgbaString,
        strokeSize: styles.nodeStrokeSize,
      };
      this.defaultEdgeStyle = {
        strokeColor: styles.edgeStrokeColor.rgbaString,
        strokeSize: styles.edgeStrokeSize,
        smoothingLength: styles.edgeSmoothingLength,
        targetArrowColor: styles.edgeStrokeColor.rgbaString,
        targetArrowType: 'none',
      };
      if (this.dragAndDropPanel) {
        this.dragAndDropPanel.updateElement(
          this.createDndPanelDefaultEdge('Стандартные элементы', 'default-element'),
          'default-edge',
        );
        const shapeNode = this.elementTemplates['shape-type-0'];
        this.dragAndDropPanel.updateElement(
          this.createDnDPanelDefaultNode(
            {
              ...shapeNode,
              dataRest: {
                ...shapeNode.dataRest,
                shape: this.defaultNodeStyle.shape,
                fill: this.defaultNodeStyle.fill,
                strokeColor: this.defaultNodeStyle.strokeColor,
                strokeSize: this.defaultNodeStyle.strokeSize,
              },
            },
          ),
          'default-node',
        );
      }
    }
    this.setDefaultStyles();
    // if (this.dndPanelElem) {
    //   this.initializeDnDPanel();
    // }
  }

  toggleInputMode() {
    if (!this.isEdit) {
      this.isEdit = true;
      this.configureInputModes(
        this.updateStoreCallback,
        this.openDataPanelCallback,
        this.closeDataPanelCallback,
      );
    } else {
      this.isEdit = false;
      this.enableViewerInputMode();
      this.closeDataPanelCallback();
    }
    return this.isEdit;
  }

  enableViewerInputMode() {
    const mode = new GraphViewerInputMode({
      focusableItems: 'none',
    });
    mode.addItemClickedListener((sender, evt) => {
      const { item } = evt;
      if (typeof this.onClickObject === 'function') {
        this.onClickObject(item?.tag.dataType, item?.tag);
      }
    });
    this.graphComponent.inputMode = mode;
  }

  // Setting up interaction with the graph
  configureInputModes(updateStoreCallback, openDataPanelCallback, closeDataPanelCallback) {
    const labelMode = new MoveLabelInputMode({
      enabled: true,
    });
    labelMode.addDragFinishedListener(() => {
      this.saveAnObject();
    });
    const mode = new GraphEditorInputMode({
      allowCreateNode: false,
      allowAddLabel: false,
      focusableItems: 'none',
      allowEditLabel: true,
      allowGroupingOperations: true,
      allowPaste: true,
      allowDuplicate: true,
      ignoreVoidStyles: true,
      moveLabelInputMode: labelMode,
      snapContext: new GraphSnapContext({
        snapPortAdjacentSegments: true,
        nodeToNodeDistance: 10,
        nodeToEdgeDistance: 0,
        snapOrthogonalMovement: false,
        snapDistance: 10,
        cropSnapLines: false,
        snapSegmentsToSnapLines: true,
        snapBendsToSnapLines: true,
        snapLineExtension: 100,
        gridSnapType: GridSnapTypes.ALL,
      }),
    });

    // Настройка dropInputMode
    // Node
    mode.nodeDropInputMode = this.settingsNodeDropInputMode();

    // Label
    mode.labelDropInputMode = this.settingsLabelDropInputMode();

    // Port
    mode.portDropInputMode = this.settingsPortDropInputMode();

    // Edge-to-edge
    mode.createEdgeInputMode.allowEdgeToEdgeConnections = true;

    mode.createBendInputMode.pressedRecognizer = EventRecognizers.createAndRecognizer(
      MouseEventRecognizers.LEFT_DOWN,
      KeyEventRecognizers.SHIFT_IS_DOWN,
    );

    // this.additionalEdgeToEdgeSettings();

    // Edge
    this.configureEdgeDropInputMode(mode);

    // Event listeners
    this.additionalEdgeToInvisibleNodeSettings(mode, updateStoreCallback);

    // Событие добавления подписи
    mode.addLabelAddedListener(() => {
      this.saveAnObject();
    });

    // Событие добавления ребра
    mode.createEdgeInputMode.addEdgeCreatedListener(() => {
      // Сохранение в store
      this.saveAnObject();
    });

    // Событие добавления узла
    mode.addNodeCreatedListener(async (sender, evt) => {
      const createdItem = await evt.item;

      // Проверяем nodeId на значение по-умолчанию
      if (typeof createdItem.tag?.nodeId === 'string') {
        // Заменяем на id элемента
        createdItem.tag.nodeId = createdItem.hashCode();
      }

      // Добавление дополнительных портов
      this.createAdditionalPorts(createdItem);

      const images = this.elem.querySelectorAll('image');
      if (images?.length > 0) {
        images.forEach((image) => {
          image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        });
      }

      // Сохранение в store

      // this.saveAnObject();
    });

    // Событие клика по элементу
    mode.addItemClickedListener((sender, evt) => {
      // Достаем элемент в отдельную переменную для дальнейшей работы с ним
      this.targetDataNode = evt.item;
      // Проверяем на наличие данных в узле
      if (
        evt.item instanceof INode
          || evt.item instanceof ILabel
      ) {
        const filteredElementTag = Utils.deleteFieldsFromObject(
          evt.item.tag,
          elementTemplates.fieldsForDelete,
        );
        // Открываем панель для редактирования данных элемента
        if (evt.item.tag?.templateType || evt.item.tag?.textTemplateType) {
          openDataPanelCallback(filteredElementTag);
        } else if (evt.item instanceof ILabel) {
          openDataPanelCallback({
            dataType: 'label',
            fontSize: evt.item.style.textSize,
            color: Utils.generateColor(evt.item.style.textFill.color),
          });
        } else {
          openDataPanelCallback({
            ...filteredElementTag,
          });
        }
      } else if (evt.item instanceof IEdge) {
        if (!evt.item?.tag) {
          evt.item.tag = {
            dataType: 'edge',
          };
        }
        openDataPanelCallback({
          ...ConstructorSchemesClass.getEdgeOptions(evt.item),
          dataType: 'edge',
          nodeId: evt.item.hashCode(),
        });
      } else {
        // Закрываем панель для редактирования данных элемента
        closeDataPanelCallback();
      }
    });

    // Событие удаления элемента
    mode.addDeletedItemListener((sender, evt) => {
      if (evt?.targetPortOwner?.tag?.dataType === 'invisible') {
        this.graphComponent.graph.remove(evt?.targetPortOwner);
      }
      if (evt?.sourcePortOwner?.tag?.dataType === 'invisible') {
        this.graphComponent.graph.remove(evt?.sourcePortOwner);
      }
      if (evt.item === this.targetDataNode) {
        closeDataPanelCallback();
      }
      this.graphComponent.updateVisual();
      // Сохранение в store

      this.saveAnObject();
    });

    // Событие копирования
    this.graphComponent.clipboard.fromClipboardCopier.addNodeCopiedListener(
      (sender, { copy, original }) => {
        copy.tag = {
          ...copy.tag,
          nodeId: copy.hashCode(),
        };
        original.tag = {
          ...original.tag,
          nodeId: original.hashCode(),
        };
      },
    );

    // Событие дублирования
    this.graphComponent.clipboard.duplicateCopier.addNodeCopiedListener(
      (sender, { copy, original }) => {
        copy.tag = {
          ...copy.tag,
          nodeId: copy.hashCode(),
        };
        original.tag = {
          ...original.tag,
          nodeId: original.hashCode(),
        };
      },
    );

    // События вставки
    this.graphComponent.clipboard.addElementsPastedListener(() => {
      this.orderTo('toFront');
      this.setDefaultElementsOrder();
    });

    // Событие редактирования положения\размеров узла
    this.graphComponent.graph.addNodeLayoutChangedListener(throttle(() => {
      // Сохранение в store

      this.saveAnObject();
    }, 500));

    // Событие добавления\редактирования углов на ребрах
    this.graphComponent.graph.addBendLocationChangedListener(throttle(() => {
      // Сохранение в store

      this.saveAnObject();
    }, 500));

    // Сохранение inputMode
    this.graphComponent.inputMode = mode;
  }

  settingsNodeDropInputMode() {
    return new NodeDropInputMode({
      showPreview: true,
      snappingEnabled: false,
      enabled: true,
      itemCreator: (
        context,
        graph,
        dropData,
        dropTarget,
        dropLocation,
      ) => this.nodeCreator({
        context,
        graph,
        dropData,
        dropTarget,
        dropLocation,
      }),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  settingsLabelDropInputMode() {
    return new LabelDropInputMode({
      showPreview: true,
      snappingEnabled: true,
      enabled: true,
      useBestMatchingParameter: true,
      // allow for nodes and edges to be the new label owner
      isValidLabelOwnerPredicate: (labelOwner) => labelOwner instanceof INode
          || labelOwner instanceof IEdge
          || labelOwner instanceof IPort,
      itemCreator: (context, graph, dropData, dropTarget, dropLocation) => {
        if (dropTarget instanceof IPort) {
          this.graphComponent.graphModelManager.graph.addLabel({
            owner: dropTarget.owner,
            style: dropData.style.clone(),
            text: dropData.text,
            tag: dropData.tag,
          });
        } else {
          graph.addLabel({
            owner: dropTarget,
            location: dropLocation,
            text: dropData.text,
            style: dropData.style.clone(),
          });
        }
        return graph;
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  settingsPortDropInputMode() {
    return new PortDropInputMode({
      showPreview: true,
      snappingEnabled: false,
      enabled: true,
      useBestMatchingParameter: true,
      // allow only for nodes to be the new port owner
      isValidPortOwnerPredicate: (portOwner) => portOwner instanceof INode,
      itemCreator: (
        context,
        graph,
        dropData,
        dropTarget,
        dropLocation,
      ) => graph.addPortAt({
        owner: dropTarget,
        location: dropLocation,
        style: new NodeStylePortStyleAdapter(
          new ShapeNodeStyle({
            fill: 'transparent',
            stroke: 'transparent',
            shape: 'ellipse',
          }),
        ),
        tag: {
          portId: dropTarget.tag?.nodeId || dropTarget.tag?.edgeId,
        },
      }),
    });
  }

  configureEdgeDropInputMode(mode) {
    const edgeDropInputMode = new EdgeDropInputMode();
    let originalEdgeDefaultStyle;

    // This method is called when an edge style is dropped onto the canvas. The edge
    // may be dropped onto a node, another edge or onto the empty canvas.
    edgeDropInputMode.itemCreator = (ctx, graph, draggedItem, dropTarget, dropLocation) => {
      if (!(draggedItem instanceof IEdge)) {
        return null;
      }
      // Use the dropped edge style for changed/created edges.
      const { style } = draggedItem;

      if (dropTarget instanceof IEdge) {
        // Set the style of the edge at the drop location to the dropped style.
        graph.setStyle(dropTarget, style);
      } else {
        // Look for a node at the drop location.
        const node = dropTarget instanceof INode
          ? dropTarget
          : this.createInvisibleNode(dropLocation);
        // Start the creation of an edge from the node at a suitable port candidate
        // for the drop location with the dropped edge style.
        const candidateLocation = graph.nodeDefaults.ports.getLocationParameterInstance(node);
        const candidate = new DefaultPortCandidate(node, candidateLocation);

        const geim = ctx.canvasComponent.inputMode;
        const { createEdgeInputMode } = geim;

        // store the previous edge style
        originalEdgeDefaultStyle = createEdgeInputMode.edgeDefaults.style;
        // change the edge style only for the one dropped onto the canvas
        createEdgeInputMode.edgeDefaults.style = style;
        // change the edge style only for the one dropped onto the canvas
        createEdgeInputMode.dummyEdgeGraph.setStyle(createEdgeInputMode.dummyEdge, style);

        createEdgeInputMode.doStartEdgeCreation(candidate);
      }
      ctx.canvasComponent.focus();
      return null;
    };

    // register the EdgeDropInputMode on the GraphEditorInputMode
    mode.add(edgeDropInputMode);

    const { createEdgeInputMode } = mode;
    createEdgeInputMode.addEdgeCreatedListener((sender, evt) => {
      evt.item.tag = {
        dataType: 'edge',
      };
      if (originalEdgeDefaultStyle) {
        createEdgeInputMode.edgeDefaults.style = originalEdgeDefaultStyle;
        originalEdgeDefaultStyle = null;
      }
    });
  }

  // Edge-to-edge
  additionalEdgeToEdgeSettings() {
    // enable edge port candidates
    this.graphComponent.graph.decorator.edgeDecorator.portCandidateProviderDecorator.setFactory(
      (edge) => new EdgePathPortCandidateProvider(edge),
    );

    // set IEdgeReconnectionPortCandidateProvider to allow re-connecting edges to other edges
    this.graphComponent.graph.decorator.edgeDecorator
      .edgeReconnectionPortCandidateProviderDecorator.setImplementation(
        IEdgeReconnectionPortCandidateProvider.ALL_NODE_AND_EDGE_CANDIDATES,
      );

    this.graphComponent.graph.decorator.edgeDecorator.handleProviderDecorator.setFactory((edge) => {
      const portRelocationHandleProvider = new PortRelocationHandleProvider(null, edge);
      portRelocationHandleProvider.visualization = Visualization.LIVE;
      return portRelocationHandleProvider;
    });
  }

  // Edge-to-invisible-node
  additionalEdgeToInvisibleNodeSettings(mode, updateStoreCallback) {
    mode.createEdgeInputMode.addGestureStartedListener(() => {
      this.isEdgeCreating = true;
    });
    mode.createEdgeInputMode.addGestureFinishedListener(() => {
      this.isEdgeCreating = false;
      this.creatingEdge = null;
    });
    mode.createEdgeInputMode.addGestureCanceledListener(() => {
      this.isEdgeCreating = false;
      this.creatingEdge = null;
    });
    mode.createEdgeInputMode.addMovingListener(throttle((sender) => {
      this.creatingEdge = {
        bends: sender.dummyEdge.bends.toArray()
          .map((bend) => new Point(bend.location.x, bend.location.y)),
        sourcePort: sender.dummyEdge.sourcePort,
        style: sender.dummyEdge.style,
      };
    }, 200));
    this.graphComponent.addMouseClickListener((sender, evt) => {
      const isShiftKeyPressed = evt.originalEvent?.shiftKey;
      if (isShiftKeyPressed && this.isEdgeCreating) {
        const sourcePortLocation = {
          x: evt.location.x,
          y: evt.location.y,
        };
        this.createEdgeToInvisibleNode({
          mode, updateStoreCallback, location: sourcePortLocation,
        });
      }
      this.closeDataPanelCallback();
    });
  }

  createEdgeToInvisibleNode({
    mode,
    location,
  }) {
    // Создаем невидимые узлы
    const targetNode = this.createInvisibleNode(location);
    targetNode.tag = {
      ...targetNode.tag,
      nodeId: targetNode?.hashCode(),
    };
    const targetPort = this.graphComponent.graph.addRelativePort(
      targetNode,
      new Point(0, 0),
    );
    targetPort.tag = {
      portType: '',
      portId: targetNode?.nodeId || targetNode?.hashCode(),
    };

    let { sourcePort } = this.creatingEdge;
    const sourcePortOwner = sourcePort.owner;
    if (sourcePortOwner instanceof INode) {
      if (!this.graphComponent.graph.ports.find((port) => port === sourcePort)) {
        sourcePort = this.graphComponent.graph.addRelativePort(
          sourcePortOwner,
          new Point(0, 0),
        );
        sourcePort.tag = {
          portType: '',
          portId: sourcePortOwner?.nodeId || sourcePortOwner?.hashCode(),
        };
      }
      // Создаем ребро
      const createdEdge = this.graphComponent.graph.createEdge(
        sourcePort,
        targetPort,
        this.creatingEdge.style,
      );
      // Добавляем на него углы
      this.graphComponent.graph.addBends(createdEdge, this.creatingEdge.bends);
      mode.createEdgeInputMode.cancel();

      this.saveAnObject();
    }
  }

  createInvisibleNode(location) {
    const createdNode = this.graphComponent.graph.createNode({
      layout: new Rect(location.x, location.y, 2, 2),
      style: new ShapeNodeStyle({
        shape: 'ellipse',
        fill: 'transparent',
        stroke: '1px transparent',
      }),
      tag: {
        dataType: 'invisible',
      },
    });
    createdNode.tag = {
      ...createdNode.tag,
      nodeId: createdNode.hashCode(),
    };
    return createdNode;
  }

  createAdditionalPorts(createdItem) {
    if (
      !createdItem.style.image
        && createdItem.tag.dataType
        !== 'shape-type-0'
    ) {
      this.graphComponent.graph.addRelativePort(
        createdItem,
        new Point((createdItem.layout.width / 6) * 2, 0),
      ).tag = {
        portType: 'right',
        portId: createdItem?.nodeId || createdItem?.edgeId || createdItem.hashCode(),
      };
      this.graphComponent.graph.addRelativePort(
        createdItem,
        new Point(-(createdItem.layout.width / 6) * 2, 0),
      ).tag = {
        portType: 'left',
        portId: createdItem?.nodeId || createdItem?.edgeId || createdItem.hashCode(),
      };
      this.graphComponent.graph.addRelativePort(
        createdItem,
        new Point(0, (createdItem.layout.height / 6) * 2),
      ).tag = {
        portType: 'top',
        portId: createdItem?.nodeId || createdItem?.edgeId || createdItem.hashCode(),
      };
      this.graphComponent.graph.addRelativePort(
        createdItem,
        new Point(0, -(createdItem.layout.height / 6) * 2),
      ).tag = {
        portType: 'bottom',
        portId: createdItem?.nodeId || createdItem?.edgeId || createdItem.hashCode(),
      };
    }
    // Center
    this.graphComponent.graph.addRelativePort(
      createdItem,
      new Point(0, 0),
    ).tag = {
      portType: 'center',
      portId: createdItem?.nodeId || createdItem?.edgeId || createdItem.hashCode(),
    };
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
    const {
      smoothingLength,
      strokeSize,
      strokeColor,
      targetArrowColor,
      targetArrowType,
    } = this.defaultEdgeStyle;
    graph.edgeDefaults.style = new PolylineEdgeStyle({
      smoothingLength,
      stroke: `${strokeSize} solid ${strokeColor}`,
      targetArrow: `${targetArrowColor} ${targetArrowType}`,
    });

    graph.edgeDefaults.ports.style = new NodeStylePortStyleAdapter({
      nodeStyle: new ShapeNodeStyle({
        shape: 'ellipse',
        fill: 'black',
        stroke: null,
      }),
      renderSize: [3, 3],
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

  initializeDnDPanel(updatedPrimitives) {
    if (this.dragAndDropPanel) {
      this.dragAndDropPanel = null;
    }
    this.toggleLoadingCallback(true);
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
            Utils.removeClass(dragPreview, 'hidden');
          } else {
            Utils.addClass(dragPreview, 'hidden');
          }
        });
      }
    };

    this.dragAndDropPanel.maxItemWidth = 160;
    this.createDnDPanelItems({
      iconsList: updatedPrimitives || this.iconsList,
    }).then((response) => {
      this.dragAndDropPanel.populatePanel(response);
      this.toggleLoadingCallback(false);
    });
  }

  refreshDnDPanel(updatedPrimitives) {
    if (this.dragAndDropPanel) {
      this.dragAndDropPanel.clearDnDPanel();
    }
    this.initializeDnDPanel(updatedPrimitives);
  }

  updateDataInNode(updatedData) {
    new Promise((resolve) => {
      this.graphComponent.graph.nodes.forEach((node) => {
        const { dataType } = node.tag;
        if (elementTemplates.templates[dataType]?.dataRest?.updateData) {
          elementTemplates.templates[dataType].dataRest.updateData(node, updatedData);
        }
        if (dataType === 'data-type-3') {
          this.updateDynamicImageNode(node);
        }
      });
      resolve();
    }).then(() => {
      this.graphComponent.updateVisual();
    });
  }

  updateSelectedNode(dataFromComponent) {
    let updatedData = null;
    const dataType = this.targetDataNode.tag?.dataType;
    updatedData = dataFromComponent;
    if (dataFromComponent.dataType === 'edge') {
      this.updateEdgeVisual(dataFromComponent);
      updatedData = dataFromComponent;
    } else if (dataFromComponent.dataType === 'label') {
      this.updateLabelVisual(dataFromComponent);
    } else if (dataType === 'label-type-0' || dataType === 'shape-type-0') {
      updatedData = dataFromComponent;
    } else if (elementTemplates.templates[dataType]) {
      updatedData = elementTemplates.templates[dataType].dataRest.updateSettings(
        this.dataRest,
        dataFromComponent,
        this.targetDataNode,
      );
    }
    this.targetDataNode.tag = {
      ...this.targetDataNode.tag,
      ...updatedData,
    };
    // Обновляем состояние графа
    this.graphComponent.updateVisual();
    // Сохраняем изменения
    if (dataType === 'data-type-3') {
      this.updateDynamicImageNode(this.targetDataNode);
    }
    this.saveAnObject();
  }

  updateEdgeVisual(updatedData) {
    this.graphComponent.graphModelManager.graph.setStyle(
      this.targetDataNode,
      new PolylineEdgeStyle({
        stroke: `${updatedData.thickness} solid ${updatedData.strokeColor.rgbaString}`,
        targetArrow: 'none',
        sourceArrow: 'none',
        smoothingLength: updatedData.smoothingLength || 0,
      }),
    );
  }

  updateLabelVisual(updatedData) {
    this.graphComponent.graphModelManager.graph.setStyle(
      this.targetDataNode,
      new DefaultLabelStyle({
        backgroundStroke: 'transparent',
        backgroundFill: 'transparent',
        insets: [3, 5, 3, 5],
        textFill: updatedData.color.rgbaString,
        textSize: +updatedData.fontSize,
      }),
    );
  }

  updateDynamicImageNode(node) {
    const updatedNodeTag = {};
    const GenerateIconClass = new GenerateIcons(
      'dynamic-image',
      'dynamic-image-node',
    );
    // Основное(по-умолчанию) изображение
    const { defaultImage } = node.tag;
    let {
      // Основные размеры изображения
      imageLayout,
      // Полная ссылка на основное(по-умолчанию) изображение
      defaultImagePath,
    } = node.tag;

    if (!imageLayout) {
      GenerateIconClass.generateIconNodes([{
        icon: defaultImage,
      }]).then((response) => {
        response.forEach((item) => {
          imageLayout = {
            x: +node.layout.x,
            y: +node.layout.y,
            width: +item.layout.width,
            height: +item.layout.height,
          };
          defaultImagePath = item.icon.node.style.image;
          this.graphComponent.graph.setNodeLayout(
            node,
            new Rect(
              +node.layout.x,
              +node.layout.y,
              +item.layout.width,
              +item.layout.height,
            ),
          );
          updatedNodeTag.imageLayout = imageLayout;
          updatedNodeTag.defaultImagePath = defaultImagePath;
        });
        this.updateActiveImageInDynamicNode(
          node,
          GenerateIconClass,
          defaultImagePath,
        ).then(() => {
          node.tag = {
            ...node.tag,
            imageLayout,
            defaultImage,
            defaultImagePath,
          };
          this.saveAnObject();
        });
      });
    } else {
      this.updateActiveImageInDynamicNode(
        node,
        GenerateIconClass,
        defaultImagePath,
      ).then(() => {
        this.saveAnObject();
      });
    }
    return node;
  }

  async setImageRatio(path, node) {
    return new Promise((resolve) => {
      const imageAspectRatio = ImageNodeStyle.getAspectRatio(path);
      imageAspectRatio.then((result) => {
        const style = new ImageNodeStyle({
          image: path,
          // always keep the intrinsic aspect ratio independent of the node's size
          aspectRatio: result,
        });
        this.graphComponent.graph.setStyle(
          node,
          style,
        );
        resolve();
      });
    });
  }

  updateActiveImageInDynamicNode(node, GenerateIconClass, defaultImagePath) {
    let imageListFromIconClass = [];
    // Список изображений из элемента(node)
    const mappedImageListFromNode = node.tag.imageList.map((item) => ({
      ...item,
      icon: item.image,
    }));
    return GenerateIconClass.generateIconNodes(mappedImageListFromNode)
      .then((response) => new Promise((resolve) => {
        imageListFromIconClass = response.map(({ value, image, icon }) => ({
          value,
          image,
          path: icon?.node?.style?.image || '',
        }));
        // Ранее установленное изображение
        const activeImageFromNode = node.tag.activeImage;
        // Новое изображение(по значению из дата-сета)
        const activeImageFromData = imageListFromIconClass
          .find((el) => `${el.value}` === `${node.tag.value}`);
        const activeImageIsChanged = activeImageFromData?.image !== activeImageFromNode?.image;
        // Если есть новое изображениие
        if (activeImageFromData) {
          // Если оно отличается от старого
          if (activeImageIsChanged) {
            // Обновляем
            node.tag.activeImage = activeImageFromData;
          }
        }
        // Отправляем изображение далее...
        resolve(activeImageFromData);
      }))
      .then((activeImage) => new Promise((resolve, reject) => {
        if (activeImage) {
          this.setImageRatio(activeImage.path, node).then(() => {
            resolve();
          });
        } else if (defaultImagePath) {
          this.setImageRatio(defaultImagePath, node).then(() => {
            resolve();
          });
        } else {
          reject();
        }
      }))
      .catch(() => {
        // Если изображение не найдено на сервере
        // Или по какой-то причине не загрузилось
        // Или не указано в настройках элемента
        this.graphComponent.graph.setStyle(
          node,
          new VuejsNodeStyle(this.elementTemplates['data-type-3'].template),
        );
      });
  }

  // Order commands
  changeOrderSelectedElements(method, command) {
    const nodes = this.graphComponent.selection.selectedNodes;
    const edges = this.graphComponent.selection.selectedEdges;
    const elements = [...nodes.toArray(), ...edges.toArray()];

    this.changeOrderElements(method, command, elements);
  }

  changeOrderElements(method, command, elements) {
    if (elements?.length > 0) {
      this.graphComponent.graphModelManager[method](elements);
      elements.forEach((element) => {
        if ((element instanceof IEdge) || (element instanceof ILabel)) {
          ICommand[command].execute(element, this.graphComponent);
        }
        this.graphComponent.graphModelManager.update(element);
      });
    }
  }

  orderTo(key, elements) {
    const orderCommands = {
      toFront: 'TO_FRONT',
      toBack: 'TO_BACK',
      raise: 'RAISE',
      lower: 'LOWER',
    };
    if (elements) {
      this.changeOrderElements(key, orderCommands[key], elements);
    } else {
      this.changeOrderSelectedElements(key, orderCommands[key]);
    }
  }

  // TODO: Временное решения для выставления z-order по уполчанию
  setDefaultElementsOrder() {
    // default-node
    this.graphComponent.graph.nodes.forEach((node) => {
      if (node.tag.dataType === 'default-node') {
        this.graphComponent.graphModelManager.toFront([node]);
        this.graphComponent.graphModelManager.update(node);
      }
    });
    // image-node
    this.graphComponent.graph.nodes.forEach((node) => {
      if (node.tag.dataType === 'image-node') {
        this.graphComponent.graphModelManager.toFront([node]);
        this.graphComponent.graphModelManager.update(node);
      }
    });
    // data-node
    this.graphComponent.graph.nodes.forEach((node) => {
      if (node.tag.templateType) {
        this.graphComponent.graphModelManager.toFront([node]);
        this.graphComponent.graphModelManager.update(node);
      }
    });
    // text-node
    this.graphComponent.graph.nodes.forEach((node) => {
      if (node.tag.textTemplateType) {
        this.graphComponent.graphModelManager.toFront([node]);
        this.graphComponent.graphModelManager.update(node);
      }
    });
    // label
    this.graphComponent.graph.nodes.forEach((node) => {
      if (node?.labels.toArray()?.length > 0) {
        this.graphComponent.graphModelManager.toFront([node]);
        this.graphComponent.graphModelManager.update(node);
      }
    });
  }

  updateDataRest(updatedData) {
    this.dataRest = updatedData;
  }

  fitGraphContent() {
    this.graphComponent.fitGraphBounds().then(() => {
      this.graphComponent.fitContent();
      this.graphComponent.updateVisual();
    });
  }

  // iconsList:Array<string>, maxItemSize:number, minItemSize:number
  getIconsListForGraph({ iconsList, maxItemSize, minItemSize }) {
    return new Promise((resolve) => {
      const GenerateIconsClass = new GenerateIcons();
      const localIconList = [];
      const resultList = [];
      if (iconsList.some((item) => item.obj_description)) {
        iconsList.forEach((item) => {
          if (item.obj_description) {
            const node = ConstructorSchemesClass.createReactiveNode(this.elementTemplates['label-type-0']);
            localIconList.push({
              ...item,
              description: {
                text: item.obj_description,
                node,
                tooltip: 'Элементы с текстом',
                dataType: 'label-type-0',
              },
            });
          }
        });
      } else {
        localIconList.push(...iconsList);
      }
      GenerateIconsClass.generateIconNodes(
        localIconList,
        maxItemSize,
        minItemSize,
      ).then((result) => {
        resultList.push(...result);
        resolve(resultList);
      });
    });
  }

  enableUndo() {
    const { graph } = this.graphComponent;
    // Enables undo on the graph.
    // This will make the graph store the edits and will make the undo/redo commands work.
    graph.undoEngineEnabled = true;

    // Basically this means that from now on the following functionality will be available
    // and do something useful as soon as edits have been made.
    if (graph.undoEngineEnabled && graph.undoEngine) {
      if (graph.undoEngine.canUndo()) {
        graph.undoEngine.undo();
      }
      if (graph.undoEngine.canRedo()) {
        graph.undoEngine.redo();
      }
      graph.undoEngine.clear();
    }
  }

  enableEdgeRouter({
    minimumEdgeToEdgeDistance,
    minimumLastSegmentLength,
  }) {
    const layoutData = new EdgeRouterData();
    layoutData.targetPortConstraints = ItemMapping
      .from((edge) => PortConstraint
        .create(PortSide[edge.targetNode.tag?.fromOtl?.target_port_constraint || 'ALL'], true));
    // Source ports
    layoutData.sourcePortConstraints = ItemMapping
      .from((edge) => PortConstraint
        .create(PortSide[edge.sourceNode.tag?.fromOtl?.source_port_constraint || 'ALL'], false));
    const edgeRouter = new EdgeRouter();
    // чтобы узлы не сливались
    edgeRouter.defaultEdgeLayoutDescriptor
      .minimumEdgeToEdgeDistance = Number(minimumEdgeToEdgeDistance);
    edgeRouter.defaultEdgeLayoutDescriptor
      .minimumLastSegmentLength = Number(minimumLastSegmentLength);
    edgeRouter.scope = EdgeRouterScope.ROUTE_ALL_EDGES;

    this.graphComponent.graph.applyLayout(edgeRouter, layoutData);
  }

  enableBridges() {
    const bridgeManager = new BridgeManager();
    bridgeManager.canvasComponent = this.graphComponent;
    bridgeManager.addObstacleProvider(new GraphObstacleProvider());
  }

  buildSchemeFromSearch(
    {
      dataFrom,
      minimumEdgeToEdgeDistance = 10,
      minimumLastSegmentLength = 30,
    },
  ) {
    const descriptionNodeStyles = {
      tag: {
        nodeId: 'label-node-default',
        dataType: 'label-type-0',
        textTemplateType: 'template-0',
        text: 'Description',
        bordered: true,
        borderType: 'solid',
        borderSize: 3,
        borderDashed: false,
        fontSize: 24,
        borderColor: Utils.generateColor(Color.from('#FFFFFF')),
        bgColor: Utils.generateColor(Color.from('rgba(60, 59, 69, 1)')),
        textColor: Utils.generateColor(Color.from('#FFFFFF')),
      },
      layout: {
        width: 120,
        height: 34,
        x: 0,
        y: 0,
      },
    };
    const generateElementFromSearch = new GenerateElementsFromSearch({
      elements: dataFrom,
      graphComponent: this.graphComponent,
      defaultEdgeStyles: {
        ...this.defaultEdgeStyle,
        strokeSize: '2px',
      },
      defaultDescriptionStyles: descriptionNodeStyles,
    });
    generateElementFromSearch.generate().then((response) => {
      if (response?.length > 0) {
        const elementCreator = new ElementCreator({
          graph: this.graphComponent.graph,
          elements: response,
        });
        elementCreator.buildGraph().then(() => {
          this.enableEdgeRouter({
            minimumEdgeToEdgeDistance,
            minimumLastSegmentLength,
          });
          this.fitGraphContent();
          this.setDefaultElementsOrder();
          this.saveAnObject();
        });
      } else {
        this.graphComponent.graph.clear();
      }
    }).catch((e) => {
      console.error(e);
    });
  }
}

export default ConstructorSchemesClass;
