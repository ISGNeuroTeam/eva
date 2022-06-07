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
  Color, YString, Mapper, IMapper, IPortOwner, FreeNodePortLocationModel,
} from 'yfiles';

import { throttle } from '../../utils/throttle';
import licenseData from '../../../license/license.json';
import { DragAndDropPanelItem, DragAndDropPanel } from './DnDPanelClass';
import HtmlLabelStyle from './HtmlLabelStyles';
import VuejsNodeStyle from './VueNodeStyle';

License.value = licenseData; // Проверка лицензии

class ConstructorSchemesClass {
  createdElements = {
    nodes: [],
    edges: [],
  }

  get getSavedNodes() {
    return this.createdElements.nodes;
  }

  set setSavedNodes(newValue) {
    this.createdElements.nodes = newValue;
  }

  get getSavedEdges() {
    return this.createdElements.edges;
  }

  set setSavedEdges(newValue) {
    this.createdElements.edges = newValue;
  }

  dndDataPanelItems = [
    // TemplateType: template-0
    // Frame-1376
    {
      template: `<g class="b-data-node">
          <!--Area-->
          <defs>
           <!--Border-radius-bg-->
           <clipPath id="border-radius">
             <rect 
               x="0" 
               y="0" 
               :width="layout.width" 
               :height="(16 * tag.items.length) - 1" 
               fill="transparent" 
               rx="3" 
               ry="3" 
             />
           </clipPath>
           <!--Separator-line-->
           <rect 
             id="separator-line" 
             :width="layout.width" 
             height="1" 
             fill="#E0E0EC" 
           />
          </defs>
          <!--Bg-left-->
          <rect
           x="0"
           y="0"
           :width="layout.width / 2"
           :height="16 * tag.items.length"
           fill="#FFFFFF"
           clip-path="url(#border-radius)"
          />
          <!--Bg-right-->
          <rect
           x="0"
           y="0"
           :width="layout.width / 2"
           :height="16 * tag.items.length"
           fill="#000000"
           clip-path="url(#border-radius)"
           :transform="'translate(' + layout.width + ',' + ((16 * tag.items.length) - 1) + '), rotate(180)'"
          />
          <template v-if="tag && tag.items && tag.items.length > 0">
           <g
            v-for="(item, index) in tag.items"
            :key="'row-' + item.id"
            class="b-data-node__items"
           >
             <text
              dx="0.5em"
              class="b-data-node__text b-data-node__text--left"
              fill="#3C3B45"
              :dy="index > 0 ? 1 + (1.45 * index) + 'em' : '1em'"
             >
               {{ item.textLeft }}
             </text>
             <text
               text-anchor="end"
               :dy="index > 0 ? 1 + (1.45 * index) + 'em' : '1em'"
               :dx="(layout.width / 2) - 1"
               class="b-data-node__text b-data-node__text--right"
               :transform="'translate(' + (layout.width - 8) / 2 + ')'"
               fill="white"
             >
               {{ item.textRight }}
             </text>
             <use href="#separator-line" x="0" :y="15.5 * (index + 1)" v-if="index < (tag.items.length - 1)"/>
           </g>
          </template>
        </g>`,
      width: 150,
      rowHeight: 15,
      dataRest: {
        // Идентификатор для связки данных с элементом,
        // в дальнейшем должен приходить с сервера
        id: '0',
        templateType: 'template-0',
        items: [
          {
            id: 111111,
            textLeft: 'F,m3/час',
            textRight: '1279.1',
          },
          {
            id: 222222,
            textLeft: 'F,m3[сут]',
            textRight: '12055',
          },
          {
            id: 333333,
            textLeft: 'Р,кГс/см3',
            textRight: '7.39',
          },
          {
            id: 444444,
            textLeft: 'Т,Со',
            textRight: '23.56',
          },
        ],
      },
    },
    // TemplateType: template-1
    // Frame-1367
    {
      template: `<g class="b-data-node">
       <!--Area-->
       <defs>
         <clipPath :id="'border-radius-' + tag.id">
           <rect 
             x="0" 
             y="0" 
             :width="layout.width" 
             :height="(16 * tag.items.length) - 2" 
             fill="transparent" 
             rx="3" 
             ry="3" 
           />
         </clipPath>
         <rect 
           :id="'separator-line-' + tag.id" 
           :width="layout.width" 
           height="1" 
           fill="#E0E0EC" 
         />
       </defs>
       <!--Bg-left-->
       <rect
         x="0"
         y="0"
         :width="layout.width / 3"
         :height="(16 * tag.items.length) - 2"
         fill="#FFFFFF"
         :clip-path="'url(#border-radius-' + tag.id + ')'"
       />
       <!--Bg-right-->
       <rect
         x="0"
         y="0"
         :width="((layout.width / 3) * 2)"
         :height="(16 * tag.items.length) - 2"
         fill="#000000"
         :clip-path="'url(#border-radius-' + tag.id + ')'"
         :transform="'translate(' + layout.width + ',' + ((16 * tag.items.length) - 2) + '), rotate(180)'"
       />
       <template v-if="tag && tag.items && tag.items.length > 0">
         <g
          v-for="(item, index) in tag.items"
          :key="'row-' + item.id"
          class="b-data-node__items"
         >
           <text
            :dx="layout.width / 6"
            text-anchor="middle"
            class="b-data-node__text b-data-node__text--left"
            fill="#3C3B45"
            :dy="index > 0 ? 1 + (1.45 * index) + 'em' : '1em'"
           >
             {{ item.textLeft }}
           </text>
           <text
             text-anchor="middle"
             :dy="index > 0 ? 1 + (1.45 * index) + 'em' : '1em'"
             :dx="layout.width / 5"
             class="b-data-node__text b-data-node__text--right"
             :transform="'translate(' + (layout.width - 8) / 2 + ')'"
             fill="white"
           >
             {{ item.textRight }}
           </text>
           <use 
             :href="'#separator-line-' + tag.id"
             x="0" 
             :y="15.5 * (index + 1)" 
             v-if="index < (tag.items.length - 1)"
           />
         </g>
       </template>
     </g>`,
      width: 150,
      rowHeight: 15,
      dataRest: {
        id: '1',
        templateType: 'template-1',
        items: [
          {
            id: 111111,
            textLeft: 'Р',
            textRight: '4.33',
          },
          {
            id: 222222,
            textLeft: 'Т',
            textRight: '53.43',
          },
        ],
      },
    },
    // TemplateType: template-2
    // Frame-1366
    {
      template: `<g class="b-data-node">
      <!--Area-->
      <defs>
        <clipPath id="border-radius">
          <rect 
            x="0" 
            y="0" 
            :width="layout.width" 
            :height="30" 
            fill="transparent" 
            rx="3" 
            ry="3" 
          />
        </clipPath>
        <rect 
          id="separator-line" 
          :width="layout.width" 
          height="1" 
          fill="#E0E0EC" 
        />
      </defs>
      <!--Bg-top-->
      <rect
        x="0"
        y="0"
        :width="layout.width"
        :height="layout.height / 2"
        fill="#000000"
        clip-path="url(#border-radius)"
      />
      <!--Bg-bottom-->
      <rect
        x="0"
        y="0"
        :width="layout.width"
        :height="layout.height / 2"
        fill="#FFFFFF"
        clip-path="url(#border-radius)"
        :transform="'translate(' + layout.width + ',' + layout.height + '), rotate(180)'"
      />
      <text
       :dx="layout.width / 2"
       text-anchor="middle"
       class="b-data-node__text"
       fill="#FFFFFF"
       dy="1em"
      >
        {{ tag.textFirst }}
      </text>
      <text
       :dx="layout.width / 2"
       text-anchor="middle"
       class="b-data-node__text"
       fill="#3C3B45"
       dy="2.45em"
      >
        {{ tag.textSecond }}
      </text>
    </g>`,
      width: 150,
      rowHeight: 30,
      dataRest: {
        id: '2',
        templateType: 'template-2',
        textFirst: '17',
        textSecond: 'F,m3/час',
      },
    },
    // TemplateType: template-3
    // Frame-1375
    {
      template: `<g class="b-data-node">
        <!--Area-->
        <defs>
          <clipPath id="border-radius">
            <rect 
              x="0" 
              y="0" 
              :width="layout.width" 
              height="30" 
              fill="transparent" 
              rx="3" 
              ry="3" 
            />
          </clipPath>
          <rect 
            id="separator-line" 
            :width="layout.width" 
            height="1" 
            fill="#E0E0EC" 
          />
        </defs>
        <!--Bg-top-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height / 2"
          fill="#000000"
          clip-path="url(#border-radius)"
        />
        <!--Bg-bottom-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height / 2"
          fill="#FFFFFF"
          clip-path="url(#border-radius)"
          :transform="'translate(' + layout.width + ',' + layout.height + '), rotate(180)'"
        />
        <text
            :dx="layout.width / 2"
            text-anchor="middle"
            class="b-data-node__text"
            fill="#FFFFFF"
            dy="1em"
        >
          {{ tag.textFirst }}
        </text>
        <text
            :dx="layout.width / 2"
            text-anchor="middle"
            class="b-data-node__text"
            fill="#3C3B45"
            dy="2.45em"
        >
          {{ tag.textSecond }}
        </text>
      </g>`,
      width: 150,
      rowHeight: 30,
      dataRest: {
        id: '3',
        templateType: 'template-3',
        textFirst: '17',
        textSecond: 'F,m3/час',
      },
    },
    // TemplateType: template-4
    // Frame-1374
    {
      template: `<g class="b-data-node">
       <!--Area-->
       <defs>
         <clipPath id="border-radius">
           <rect 
             x="0" 
             y="0" 
             :width="layout.width" 
             :height="(16 * tag.items.length) - 2" 
             fill="transparent" 
             rx="3" 
             ry="3" 
           />
         </clipPath>
         <rect 
           id="separator-line" 
           :width="layout.width" 
           height="1" 
           fill="#E0E0EC" 
         />
       </defs>
       <!--Bg-left-->
       <rect
         x="0"
         y="0"
         :width="layout.width / 3"
         :height="(16 * tag.items.length) - 2"
         fill="#FFFFFF"
         clip-path="url(#border-radius)"
       />
       <!--Bg-right-->
       <rect
         x="0"
         y="0"
         :width="((layout.width / 3) * 2)"
         :height="(16 * tag.items.length) - 2"
         fill="#000000"
         clip-path="url(#border-radius)"
         :transform="'translate(' + layout.width + ',' + ((16 * tag.items.length) - 2) + '), rotate(180)'"
       />
       <template v-if="tag && tag.items && tag.items.length > 0">
         <g
          v-for="(item, index) in tag.items"
          :key="'row-' + item.id"
          class="b-data-node__items"
         >
           <text
            :dx="layout.width / 6"
            text-anchor="middle"
            class="b-data-node__text b-data-node__text--left"
            fill="#3C3B45"
            :dy="index > 0 ? 1 + (1.45 * index) + 'em' : '1em'"
           >
             {{ item.textLeft }}
           </text>
           <text
             text-anchor="middle"
             :dy="index > 0 ? 1 + (1.45 * index) + 'em' : '1em'"
             :dx="layout.width / 5"
             class="b-data-node__text b-data-node__text--right"
             :transform="'translate(' + (layout.width - 8) / 2 + ')'"
             fill="white"
           >
             {{ item.textRight }}
           </text>
           <use href="#separator-line" x="0" :y="15.5 * (index + 1)" v-if="index < (tag.items.length - 1)"/>
         </g>
       </template>
     </g>`,
      width: 150,
      rowHeight: 15,
      dataRest: {
        id: '4',
        templateType: '4',
        items: [
          {
            textLeft: 'Р',
            textRight: '4.33',
          },
        ],
      },
    },
    // TemplateType: template-5
    // Frame-1364, Frame-1368
    {
      template: `<g class="b-data-node">
       <!--Area-->
       <defs>
         <clipPath id="border-radius">
           <rect x="0" y="0" :width="layout.width" :height="layout.height" fill="transparent" rx="3" ry="3" />
         </clipPath>
         <rect id="separator-line" :width="layout.width" height="1" fill="#E0E0EC" />
       </defs>
       <!--Bg-left-->
       <rect
         x="0"
         y="0"
         :width="layout.width"
         :height="layout.height"
         :fill="tag.maxValueColor"
         clip-path="url(#border-radius)"
       />
       <!--Bg-right-->
       <rect
         x="0"
         y="0"
         :width="layout.width"
         :height="((layout.height / 100) * (tag.currentValue * 100 / tag.maxValue))"
         :fill="tag.currentValueColor"
         clip-path="url(#border-radius)"
         :transform="'translate(' + layout.width + ',' + layout.height + '), rotate(180)'"
       />
       <text
         class="b-data-node__text"
         :dx="layout.width / 2"
         :dy="layout.height / 2"
         alignment-baseline="middle"
         text-anchor="middle"
         :fill="tag.textColor"
       >
           {{ tag.currentValue }}
       </text>
     </g>`,
      width: 150,
      height: 30,
      dataRest: {
        id: '5',
        templateType: 'template-5',
        currentValue: 1.5,
        currentValueColor: '#FFFFFF',
        maxValue: 3,
        maxValueColor: '#000000',
        textColor: 'red',
      },
    },
    // TemplateType: template-6
    // Frame-1369
    {
      template: `<g class="b-data-node">
      <!--Area-->
      <defs>
        <clipPath id="border-radius">
          <rect x="0" y="0" :width="layout.width" :height="layout.height" fill="transparent" rx="3" ry="3" />
        </clipPath>
        <rect id="separator-line" :width="layout.width" height="1" fill="#E0E0EC" />
      </defs>
      <!--Bg-left-->
      <rect
        x="0"
        y="0"
        :width="layout.width"
        :height="(layout.height / 100) * ((tag.firstValue * 100) / (tag.firstValue + tag.secondValue))"
        :fill="tag.firstValueColor"
        clip-path="url(#border-radius)"
      />
      <!--Bg-right-->
      <rect
        x="0"
        y="0"
        :width="layout.width"
        :height="(layout.height / 100) * ((tag.secondValue * 100) / (tag.firstValue + tag.secondValue))"
        :fill="tag.secondValueColor"
        clip-path="url(#border-radius)"
        :transform="'translate(' + layout.width + ',' + layout.height + '), rotate(180)'"
      />
      <text
        class="b-data-node__text"
        :dx="layout.width / 2"
        :dy="(layout.height / 6) * 2"
        alignment-baseline="middle"
        text-anchor="middle"
        :fill="tag.textColor"
      >
          {{ tag.firstValue }}
      </text>
      <text
        class="b-data-node__text"
        :dx="layout.width / 2"
        :dy="(layout.height / 6) * 4"
        alignment-baseline="middle"
        text-anchor="middle"
        :fill="tag.textColor"
      >
          {{ tag.secondValue }}
      </text>
    </g>`,
      width: 150,
      height: 70,
      dataRest: {
        id: '6',
        templateType: 'template-6',
        firstValue: 5,
        firstValueColor: '#3366FF',
        secondValue: 5,
        secondValueColor: '#FF5147',
        textColor: '#FFFFFF',
      },
    },
  ]

  options = {
    defaultNodeStyle: {
      fill: '#FFFFFF',
      strokeColor: '#F4F4F4',
      strokeSize: '1.5px',
      size: [150, 150], // Width, height
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

  allDataNodes = []

  get allDataNodes() {
    return this.allDataNodes;
  }

  set allDataNode(value) {
    this.allDataNode = value;
  }

  get dndDataPanelItems() {
    return this.dndDataPanelItems;
  }

  get defaultNodeStyle() {
    return this.options.defaultNodeStyle;
  }

  set defaultNodeStyle({
    fill = Color.TRANSPARENT,
    strokeColor = Color.TRANSPARENT,
    strokeSize = '1.5px',
    size = [150, 150],
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
    savedElements,
    saveGraphItemCallback,
    openDataPanelCallback,
  }) {
    // this.applyStylesElements();
    this.dragAndDropPanel = null;
    this.mapper = null;
    this.iconsList = iconsList;
    this.savedElements = JSON.parse(JSON.stringify(savedElements));
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
    // this.parseDataJson();
    // this.setDefaultStyles();
    // Populates the graph and overrides some styles and label models
    // this.populateGraph();
    // Manages the viewport
    this.updateViewport();
    this.dndPanelContainerElem = dndPanelContainerElem;
    this.dndPanelElem = dndPanelElem;
    this.configureInputModes(saveGraphItemCallback, openDataPanelCallback);
    this.initializeDnDPanel();
    if (this.savedElements?.length > 0) {
      this.createLoadedElements();
    }
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

  createLoadedElements() {
    this.savedElements.forEach((element) => {
      if (element.type.indexOf('node') !== -1) {
        this.createLoadedNodes(element);
      }
      if (element.type.indexOf('edge') !== -1) {
        this.createLoadedEdge(element);
      }
    });
  }

  createLoadedNodes(data) {
    let createElement = null;
    if (data.type === 'data-node') {
      createElement = this.graphComponent.graph.createNode({
        layout: new Rect(
          data.layout.x,
          data.layout.y,
          data.layout.width,
          data.layout.height,
        ),
        style: new VuejsNodeStyle(
          this.dndDataPanelItems[data.tag.templateType.replace('template-', '')].template,
        ),
        tag: data.tag,
      });
    }
    if (data.type === 'image-node') {
      createElement = this.graphComponent.graph.createNode({
        layout: new Rect(
          data.layout.x,
          data.layout.y,
          data.layout.width,
          data.layout.height,
        ),
        style: new ImageNodeStyle(data.image),
        tag: data.tag,
      });
    }
    if (data.type === 'default-node') {
      createElement = this.graphComponent.graph.createNode({
        layout: new Rect(
          data.layout.x,
          data.layout.y,
          data.layout.width,
          data.layout.height,
        ),
        style: new ShapeNodeStyle({
          shape: 'round-rectangle',
          fill: `${ConstructorSchemesClass.colorToString(data.stroke.color)}`,
          stroke: `${data.stroke.thickness}px ${ConstructorSchemesClass.colorToString(data.stroke.color)}`,
        }),
        tag: data.tag,
      });
    }
    // Добавление дополнительных портов
    this.createAdditionalPorts(createElement);
  }

  createLoadedEdge(data) {
    const sourceNode = this.findNodeById(data.sourceNode);
    const targetNode = this.findNodeById(data.targetNode);
    const strokeColor = ConstructorSchemesClass.colorToString(data.style.fill);
    const createdEdge = this.graphComponent.graph.createEdge({
      sourcePort: ConstructorSchemesClass.findPortByType(data.sourcePort, sourceNode),
      targetPort: ConstructorSchemesClass.findPortByType(data.targetPort, targetNode),
      style: new PolylineEdgeStyle({
        smoothingLength: data.style.smoothingLength,
        stroke: `${data.style.thickness}px solid ${strokeColor}`,
        // targetArrow: `${data.style.targetArrowColor} ${data.style.targetArrowType}`,
        // sourceArrow: `${data.style.targetArrowColor} ${data.style.targetArrowType}`,
      }),
    });
    createdEdge.tag = {
      edgeId: `${sourceNode.tag.nodeId}-${targetNode.tag.nodeId}`,
    };
    this.graphComponent.graph.addBends(
      createdEdge,
      data.bends.map((item) => new Point(item.x, item.y)),
    );
  }

  findNodeById(nodeId) {
    return this.graphComponent.graph.nodes.find((item) => item.tag.nodeId === nodeId);
  }

  static findPortByType(type, node) {
    return node.ports.toArray().find((item) => item.tag.portType === type);
  }

  configureInputModes(saveGraphItemCallback, openDataPanelCallback) {
    // configure the snapping context
    const mode = new GraphEditorInputMode({
      allowCreateNode: false,
      allowGroupingOperations: true,
      deletableItems: INode | IEdge | ILabel,
      ignoreVoidStyles: true,
      snapContext: new GraphSnapContext({
        nodeToNodeDistance: 10,
        nodeToEdgeDistance: -100,
        snapOrthogonalMovement: false,
        snapDistance: 10,
        cropSnapLines: false,
        snapSegmentsToSnapLines: true,
        snapBendsToSnapLines: true,
        snapLineExtension: 100,
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
        let createdNode = null;
        if (dropData?.tag?.templateType) {
          createdNode = graph.createNodeAt({
            location: dropLocation,
            style: new VuejsNodeStyle(this.dndDataPanelItems[dropData.tag.id].template),
            labels: dropData.labels,
            tag: { ...dropData.tag, nodeId: dropData.hashCode() },
          });
        } else {
          createdNode = graph.createNodeAt({
            location: dropLocation,
            style: dropData.style,
            labels: dropData.labels,
            tag: {
              nodeId: dropData.hashCode(),
            },
          });
        }
        // Позиция и размеры нового элемента
        graph.setNodeLayout(createdNode, new Rect(
          dropLocation.x - (dropData.layout.width / 2),
          dropLocation.y - (dropData.layout.height / 2),
          dropData.layout.width,
          dropData.layout.height,
        ));
        return createdNode;
      },
    });

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

    mode.addLabelAddedListener((sender, evt) => {
      // Сохранять label в объект с сохраненным node
      console.log('addLabelAddedListener', sender, evt);
    });

    mode.addNodeCreatedListener(async (sender, evt) => {
      const createdItem = await evt.item;
      // Добавление элемента в список для сохранения
      this.savedElements.push(ConstructorSchemesClass.extractDataToSave(createdItem));
      // Добавление дополнительных портов
      this.createAdditionalPorts(createdItem);
      // Обновление списка сохраненных элементов
      saveGraphItemCallback(this.savedElements);
    });

    mode.addItemClickedListener((sender, evt) => {
      console.log('addItemClickedListener', sender, evt.item);
      if (evt.item instanceof INode) {
        openDataPanelCallback({
          dataType: evt.item.tag.id,
          nodeId: evt.item.tag.nodeId,
        });
      }
    });

    // Узел создан
    mode.createEdgeInputMode.addEdgeCreatedListener(async (sender, evt) => {
      const createdEdge = await evt.item;
      createdEdge.tag = {
        edgeId: `${createdEdge.sourceNode.tag.nodeId}-${createdEdge.targetNode.tag.nodeId}`,
      };
      this.savedElements.push(ConstructorSchemesClass.extractEdgeDataToSave(createdEdge));
      // Обновление списка сохраненных элементов
      saveGraphItemCallback(this.savedElements);
    });

    mode.addDeletedItemListener(async (sender, evt) => {
      const deletedItem = await evt.item;
      this.deleteSavedElement(deletedItem, saveGraphItemCallback);
    });

    this.graphComponent.graph.addNodeLayoutChangedListener(throttle((source, node) => {
      this.changeSavedNodes(node?.tag?.nodeId || node.hashCode(), node);
      // Обновление списка сохраненных элементов
      saveGraphItemCallback(this.savedElements);
    }, 200));

    this.graphComponent.graph.addBendLocationChangedListener(throttle((sender, evt) => {
      this.changeSavedEdges(evt.owner.tag.edgeId, evt.owner, {
        location: {
          x: evt.location.x,
          y: evt.location.y,
        },
        index: evt.index,
      });
      // Обновление списка сохраненных элементов
      saveGraphItemCallback(this.savedElements);
    }, 200));

    this.graphComponent.inputMode = mode;
  }

  deleteSavedElement(element, callback) {
    // Удаление узла
    if (element instanceof INode) {
      // Удаление элемента из сохраненных(Node и связанных с ними Edge)
      this.savedElements = this.savedElements
        .filter((item) => (item.tag?.nodeId !== element?.tag?.nodeId)
          && (String(item?.edgeId).indexOf(String(element?.tag?.nodeId)) === -1));
    }
    // Удаление ребра
    if (element instanceof IEdge) {
      // Удаление элемента из сохраненных(Edge)
      this.savedElements = this.savedElements
        .filter((item) => item?.edgeId !== element.tag?.edgeId);
    }

    // Обновление списка сохраненных элементов
    callback(this.savedElements);
  }

  static extractEdgeDataToSave(createdEdge, newBendsData) {
    const fillColor = createdEdge.style.stroke.fill.color;
    const bends = createdEdge.bends.toArray().map((item) => ({
      x: item.location.x,
      y: item.location.y,
    }));
    if (newBendsData) {
      bends[newBendsData.index] = newBendsData.location;
    }
    return {
      type: 'edge',
      edgeId: `${createdEdge.sourceNode.tag.nodeId}-${createdEdge.targetNode.tag.nodeId}`,
      sourceNode: createdEdge.sourceNode.tag.nodeId,
      targetNode: createdEdge.targetNode.tag.nodeId,
      sourcePort: createdEdge.sourcePort.tag.portType,
      targetPort: createdEdge.targetPort.tag.portType,
      style: {
        smoothingLength: createdEdge.style.smoothingLength,
        // targetArrow: '',
        // sourceArrow: '',
        thickness: createdEdge.style.stroke.thickness,
        fill: {
          r: fillColor.r,
          g: fillColor.g,
          b: fillColor.b,
          a: fillColor.a,
        },
      },
      bends,
    };
  }

  // Подготовка данных для сохранения
  static extractDataToSave(node) {
    if (node?.tag?.templateType) {
      return {
        type: 'data-node',
        layout: {
          height: node.layout.height,
          width: node.layout.width,
          x: node.layout.x,
          y: node.layout.y,
        },
        tag: {
          ...node.tag,
          nodeId: node.tag?.nodeId || node.hashCode(),
        },
      };
    }
    if (node.style?.image) {
      return {
        type: 'image-node',
        image: node.style?.image,
        layout: {
          height: node.layout.height,
          width: node.layout.width,
          x: node.layout.x,
          y: node.layout.y,
        },
        tag: {
          nodeId: node.tag?.nodeId || node.hashCode(),
        },
      };
    }
    const strokeThickness = node.style.stroke.thickness;
    const strokeColor = node.style.stroke.fill.color;
    const fill = node.style.fill.color;
    return {
      type: 'default-node',
      fill: {
        r: fill.r,
        g: fill.g,
        b: fill.b,
        a: fill.a,
      },
      stroke: {
        thickness: strokeThickness,
        color: {
          r: strokeColor.r,
          g: strokeColor.g,
          b: strokeColor.b,
          a: strokeColor.a,
        },
      },
      layout: {
        height: node.layout.height,
        width: node.layout.width,
        x: node.layout.x,
        y: node.layout.y,
      },
      tag: {
        nodeId: node.tag?.nodeId || node.hashCode(),
      },
    };
  }

  // Изменение ранее сохраненных узлов
  changeSavedNodes(hashCode, newData) {
    this.savedElements = this.savedElements.map((item) => {
      if (item?.tag?.nodeId === hashCode) {
        return ConstructorSchemesClass.extractDataToSave(newData);
      }
      return item;
    });
  }

  // Изменение ранее сохраненных ребер
  changeSavedEdges(edgeId, newEdgeData, newBendsData) {
    this.savedElements = this.savedElements.map((item) => {
      if (item?.edgeId === edgeId) {
        return ConstructorSchemesClass.extractEdgeDataToSave(newEdgeData, newBendsData);
      }
      return item;
    });
  }

  createAdditionalPorts(createdItem) {
    this.graphComponent.graph.addRelativePort(
      createdItem,
      new Point((createdItem.layout.width / 6) * 2, 0),
    ).tag = {
      portType: 'right',
    };
    this.graphComponent.graph.addRelativePort(
      createdItem,
      new Point(-(createdItem.layout.width / 6) * 2, 0),
    ).tag = {
      portType: 'left',
    };
    this.graphComponent.graph.addRelativePort(
      createdItem,
      new Point(0, (createdItem.layout.height / 6) * 2),
    ).tag = {
      portType: 'top',
    };
    this.graphComponent.graph.addRelativePort(
      createdItem,
      new Point(0, -(createdItem.layout.height / 6) * 2),
    ).tag = {
      portType: 'bottom',
    };
    // Center
    this.graphComponent.graph.addRelativePort(
      createdItem,
      new Point(0, 0),
    ).tag = {
      portType: 'center',
    };
  }

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
    if (color?.a) {
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    }
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  static async webGl2CreateIcon({
    dropData,
    graph,
    createdNode,
  }) {
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
    graph.nodeDefaults.style = new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: this.defaultNodeStyle.fill,
      stroke: `${this.defaultNodeStyle.strokeSize} ${this.defaultNodeStyle.strokeColor}`,
    });
    // Sets the default size for nodes explicitly to 40x40
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
      this.createDnDPanelItems({
        iconsList: this.iconsList,
        defaultEdgeStyle: this.defaultEdgeStyle,
        defaultNodeStyle: this.defaultNodeStyle,
        defaultLabelStyle: this.defaultLabelStyle,
      }),
    );
  }

  addingDataToNode({
    jsonData, targetNode,
  }) {
    this.graphComponent.graph.nodes.forEach((node) => {
      if (node === targetNode) {
        try {
          node.tag = jsonData;
        } catch (err) {
          console.log('ERROR', err);
        }
      }
    });
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
  createDnDPanelItems({
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
    this.dndDataPanelItems.forEach((item, index) => {
      const dataNode = new SimpleNode();
      dataNode.tag = item.dataRest;
      dataNode.style = new VuejsNodeStyle(item.template);
      dataNode.layout = new Rect(
        0,
        0,
        item?.width,
        item?.height
          ? item.height
          : item.rowHeight * (item?.dataRest?.items?.length || 1),
      );
      itemContainer.push(new DragAndDropPanelItem(dataNode, `Data node - ${index}`));
    });
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
}

export default ConstructorSchemesClass;
