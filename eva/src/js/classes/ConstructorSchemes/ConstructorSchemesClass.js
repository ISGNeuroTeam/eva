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
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphMLSupport,
  GraphSnapContext,
  GridSnapTypes,
  HandlePositions,
  ICommand,
  IEdge,
  IEdgeReconnectionPortCandidateProvider,
  ILabel,
  ImageNodeStyle,
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
  SimpleLabel,
  SimpleNode,
  Size,
  StorageLocation,
  VoidNodeStyle,
} from 'yfiles';

import { throttle } from '../../utils/throttle';
import licenseData from '../../../license/license.json';
import { DragAndDropPanel, DragAndDropPanelItem } from './DnDPanelClass';
import HtmlLabelStyle from './HtmlLabelStyles';
import VuejsNodeStyle from './VueNodeStyle.js';
import { EdgePathPortCandidateProvider } from './EdgePathPortCandidateProvider';
import VuejsNodeStyleMarkupExtension from './VuejsNodeStyleMarkupExtension.js';
import EdgeDropInputMode from './EdgeDropInputModeClass';

License.value = licenseData; // Проверка лицензии

const regexpSize = /<svg width="(?<width>.*?)" height="(?<height>.*?)"/;

class ConstructorSchemesClass {
  dndDataPanelItems = [
    // TemplateType: template-0
    // Frame-1376
    {
      template: `<g class="b-data-node">
        <!--Area-->
        <defs>
         <!--Border-radius-bg-->
         <clipPath :id="'border-radius-' + tag.nodeId">
           <rect 
             x="0" 
             y="0" 
             :width="layout.width" 
             :height="layout.height" 
             fill="transparent" 
             rx="3" 
             ry="3" 
           />
         </clipPath>
         <!--Separator-line-->
         <rect 
           :id="'separator-line-' + tag.nodeId"
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
         :height="layout.height"
         fill="#FFFFFF"
         :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-right-->
        <rect
         :x="layout.width / 2"
         y="0"
         :width="layout.width / 2"
         :height="layout.height"
         fill="#000000"
         :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <template v-if="tag && tag.items && tag.items.length > 0">
         <template
          v-for="(item, index) in tag.items"
         >
           <text
            dx="0.5em"
            class="b-data-node__text b-data-node__text--left"
            fill="#3C3B45"
            :dy="(((layout.height / tag.items.length) * (index + 1)) - ((layout.height / tag.items.length) / 2))"
            alignment-baseline="middle"
            :key="'row-' + tag.nodeId + '-' + index + '-text-left'"
           >
             {{ item.textLeft }}
           </text>
           <text
             text-anchor="end"
             :dy="(((layout.height / tag.items.length) * (index + 1)) - ((layout.height / tag.items.length) / 2))"
             alignment-baseline="middle"
             :dx="(layout.width / 2) - 1"
             class="b-data-node__text b-data-node__text--right"
             :transform="'translate(' + (layout.width - 8) / 2 + ')'"
             fill="white"
             :key="'row-' + tag.nodeId + '-' + index + '-text-right'"
           >
             {{ item.textRight }}
           </text>
           <use
            v-if="index < (tag.items.length - 1)"
            :href="'#separator-line-' + tag.nodeId"
            x="0" 
            :y="(layout.height / tag.items.length) * (index + 1)"
            :key="'row-' + tag.nodeId + '-' + index + '-separator'"
           />
         </template>
        </template>
        </g>`,
      width: 150,
      rowHeight: 16,
      dataRest: {
        nodeId: 'template-0',
        // Идентификатор для связки данных с элементом,
        // в дальнейшем должен приходить с сервера
        dataType: '0',
        templateType: 'template-0',
        items: [
          {
            id: '',
            textLeft: 'Label',
            textRight: 'Value',
          },
          {
            id: '',
            textLeft: 'Label',
            textRight: 'Value',
          },
          {
            id: '',
            textLeft: 'Label',
            textRight: 'Value',
          },
          {
            id: '',
            textLeft: 'Label',
            textRight: 'Value',
          },
        ],
      },
    },
    // TemplateType: template-1
    // Frame-1367, Frame-1374
    {
      template: `<g class="b-data-node">
        <!--Area-->
        <defs>
         <clipPath :id="'border-radius-' + tag.nodeId">
           <rect 
             x="0" 
             y="0" 
             :width="layout.width" 
             :height="layout.height" 
             fill="transparent" 
             rx="3" 
             ry="3" 
           />
         </clipPath>
         <rect 
           :id="'separator-line-' + tag.nodeId" 
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
         :height="layout.height"
         fill="#FFFFFF"
         :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-right-->
        <rect
         :x="layout.width / 3"
         y="0"
         :width="((layout.width / 3) * 2)"
         :height="layout.height"
         fill="#000000"
         :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <template v-if="tag && tag.items && tag.items.length > 0">
         <template
          v-for="(item, index) in tag.items"
         >
           <text
            :dx="layout.width / 6"
            text-anchor="middle"
            class="b-data-node__text b-data-node__text--left"
            fill="#3C3B45"
            :dy="(((layout.height / tag.items.length) * (index + 1)) - ((layout.height / tag.items.length) / 2))"
            alignment-baseline="middle"
            :key="'row-' + tag.nodeId + '-' + index + '-text-left'"
           >
             {{ item.textLeft }}
           </text>
           <text
             text-anchor="middle"
             :dy="(((layout.height / tag.items.length) * (index + 1)) - ((layout.height / tag.items.length) / 2))"
             alignment-baseline="middle"
             :dx="layout.width / 5"
             class="b-data-node__text b-data-node__text--right"
             :transform="'translate(' + (layout.width - 8) / 2 + ')'"
             fill="white"
             :key="'row-' + tag.nodeId + '-' + index + '-text-right'"
           >
             {{ item.textRight }}
           </text>
           <use 
             :href="'#separator-line-' + tag.nodeId"
             x="0" 
             :y="(layout.height / tag.items.length) * (index + 1)"
             v-if="index < (tag.items.length - 1)"
             :key="'row-' + tag.nodeId + '-' + index + '-separator'"
           />
         </template>
        </template>
     </g>`,
      width: 150,
      rowHeight: 15,
      dataRest: {
        dataType: '1',
        nodeId: 'template-1',
        templateType: 'template-1',
        items: [
          {
            id: '',
            textLeft: 'Label',
            textRight: 'Value',
          },
          {
            id: '',
            textLeft: 'Label',
            textRight: 'Value',
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
        <clipPath :id="'border-radius-' + tag.nodeId">
          <rect 
            x="0" 
            y="0" 
            :width="layout.width" 
            :height="layout.height" 
            fill="transparent" 
            rx="3" 
            ry="3" 
          />
        </clipPath>
      </defs>
      <!--Bg-top-->
      <rect
        x="0"
        y="0"
        :width="layout.width"
        :height="layout.height / 2"
        fill="#000000"
        :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
      />
      <!--Bg-bottom-->
      <rect
        x="0"
        y="0"
        :width="layout.width"
        :height="layout.height / 2"
        fill="#FFFFFF"
        :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        :transform="'translate(' + layout.width + ',' + layout.height + '), rotate(180)'"
      />
      <text
       :dx="layout.width / 2"
       text-anchor="middle"
       class="b-data-node__text"
       fill="#FFFFFF"
       :dy="((layout.height / 2) - (layout.height / 4))"
       alignment-baseline="middle"
      >
        {{ tag.textFirst }}
      </text>
      <text
       :dx="layout.width / 2"
       text-anchor="middle"
       class="b-data-node__text"
       fill="#3C3B45"
       :dy="(layout.height - (layout.height / 4))"
       alignment-baseline="middle"
      >
        {{ tag.textSecond }}
      </text>
    </g>`,
      width: 150,
      rowHeight: 30,
      dataRest: {
        dataType: '2',
        nodeId: 'template-2',
        templateType: 'template-2',
        id: '',
        textFirst: 'Value',
        textSecond: 'Label',
      },
    },
    // TemplateType: template-3
    // Frame-1375
    {
      template: `<g class="b-data-node">
        <!--Area-->
        <defs>
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect 
              x="0" 
              y="0" 
              :width="layout.width" 
              :height="layout.height" 
              fill="transparent" 
              rx="3" 
              ry="3" 
            />
          </clipPath>
        </defs>
        <!--Bg-top-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height / 2"
          fill="#000000"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-bottom-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height / 2"
          fill="#FFFFFF"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
          :transform="'translate(' + layout.width + ',' + layout.height + '), rotate(180)'"
        />
        <text
          text-anchor="end"
          :dx="(layout.width / 2) - 1"
          :transform="'translate(' + (layout.width - 8) / 2 + ')'"
          class="b-data-node__text"
          fill="#FFFFFF"
          :dy="((layout.height / 2) - (layout.height / 4))"
          alignment-baseline="middle"
        >
          {{ tag.textFirst }}
        </text>
        <text
          :dx="layout.width / 2"
          text-anchor="middle"
          class="b-data-node__text"
          fill="#3C3B45"
          :dy="(layout.height - (layout.height / 4))"
          alignment-baseline="middle"
        >
          {{ tag.textSecond }}
        </text>
      </g>`,
      width: 150,
      rowHeight: 30,
      dataRest: {
        dataType: '3',
        nodeId: 'template-3',
        templateType: 'template-3',
        id: '',
        textFirst: 'Value',
        textSecond: 'Label',
      },
    },
    // TemplateType: template-4
    // Frame-1364, Frame-1368
    {
      template: `<g class="b-data-node">
       <!--Area-->
       <defs>
         <clipPath :id="'border-radius-' + tag.nodeId">
           <rect 
             x="0" 
             y="0" 
             :width="layout.width" 
             :height="layout.height" 
             fill="transparent" 
             rx="3" 
             ry="3" 
           />
         </clipPath>
       </defs>
       <!--Bg-left-->
       <rect
         x="0"
         y="0"
         :width="layout.width"
         :height="layout.height"
         :fill="tag.maxValueColor"
         :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
       />
       <!--Bg-right-->
       <rect
         x="0"
         y="0"
         :width="layout.width"
         :height="((layout.height / 100) * (tag.currentValue * 100 / tag.maxValue))"
         :fill="tag.currentValueColor"
         :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
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
        dataType: '4',
        nodeId: 'template-4',
        id: '',
        templateType: 'template-4',
        currentValue: 1.5,
        currentValueColor: '#FFFFFF',
        maxValue: 3,
        maxValueColor: '#000000',
        textColor: 'red',
      },
    },
    // TemplateType: template-5
    // Frame-1369
    {
      template: `<g class="b-data-node">
      <!--Area-->
      <defs>
        <clipPath :id="'border-radius-' + tag.nodeId">
          <rect 
            x="0" 
            y="0" 
            :width="layout.width" 
            :height="layout.height" 
            fill="transparent" 
            rx="3" 
            ry="3" 
          />
        </clipPath>
      </defs>
      <!--Bg-left-->
      <rect
        x="0"
        y="0"
        :width="layout.width"
        :height="(layout.height / 100) * ((tag.firstValue * 100) / (tag.firstValue + tag.secondValue))"
        :fill="tag.firstValueColor"
        :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
      />
      <!--Bg-right-->
      <rect
        x="0"
        y="0"
        :width="layout.width"
        :height="(layout.height / 100) * ((tag.secondValue * 100) / (tag.firstValue + tag.secondValue))"
        :fill="tag.secondValueColor"
        :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
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
        dataType: '5',
        nodeId: 'template-5',
        id: '',
        templateType: 'template-5',
        firstValue: 5,
        firstValueColor: '#3366FF',
        secondValue: 5,
        secondValueColor: '#FF5147',
        textColor: '#FFFFFF',
      },
    },
  ]

  dndLabelPanelItems = [
    {
      template: `<g class="b-label-node">
        <!--Area-->
        <defs>
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect 
              x="0" 
              y="0" 
              :width="layout.width" 
              :height="layout.height" 
              fill="transparent" 
              rx="3" 
              ry="3" 
            />
          </clipPath>
        </defs>
        <!--Bg-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height"
          :fill="tag.bgColor || 'transparent'"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
          :stroke="tag.bordered && tag.borderColor || 'transparent'" 
          :stroke-width="tag.bordered && tag.borderSize || '0'" 
          :stroke-dasharray="tag.bordered && tag.borderDashed ? '4' : '0'" 
          rx="4" 
          ry="4" 
        />
        <foreignObject :height="layout.height" :width="layout.width">
          <div
           class="b-data-node__label" 
           :style="{
             height: '100%', 
             display: 'flex', 
             justifyContent: 'center', 
             alignItems: 'center',
           }" 
          >
            <div 
             class="b-data-node__text-label" 
             :style="{
              width: layout.width + 'px',
              height: layout.height + 'px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              writingMode: tag.isVertical ? 'vertical-rl' : 'horizontal-tb',
              textOrientation: 'mixed', 
              transform: tag.isVertical ? 'rotate(180deg)' : 'rotate(0deg)',
              color: tag.textColor,
             }"
            >
              {{ tag.text }}
            </div>
          </div>
        </foreignObject>
      </g>`,
      width: 150,
      height: 30,
      dataRest: {
        dataType: '0',
        nodeId: 'label-template-0',
        id: '',
        textTemplateType: 'template-0',
        text: 'Text',
        isVertical: false,
        bordered: true,
        borderType: 'solid',
        borderSize: 1,
        borderDashed: true,
        borderColor: '#000000',
        bgColor: '#FFFFFF',
        textColor: '#000000',
      },
    },
  ]

  shapeNodeStyleList = [
    {
      label: 'Параллелограмм',
      value: 'DIAMOND',
    },
    {
      label: 'Эллиптическая форма',
      value: 'ELLIPSE',
    },
    {
      label: 'Стрелка вправо',
      value: 'FAT_ARROW',
    },
    {
      label: 'Стрелка влево',
      value: 'FAT_ARROW2',
    },
    {
      label: 'Шестигранник',
      value: 'HEXAGON',
    },
    {
      label: 'Восьмигранник',
      value: 'OCTAGON',
    },
    {
      label: 'Прямоугольник',
      value: 'RECTANGLE',
    },
    {
      label: 'Прямоугольник(rounded)',
      value: 'ROUND_RECTANGLE',
    },
    {
      label: 'Пятиконечная звезда',
      value: 'STAR5',
    },
    {
      label: 'Шестиконечная звезда',
      value: 'STAR6',
    },
    {
      label: 'Восьмиконечная звезда',
      value: 'STAR8',
    },
    {
      label: 'Трапеция вниз',
      value: 'TRAPEZ',
    },
    {
      label: 'Трапеция вверх',
      value: 'TRAPEZ2',
    },
    {
      label: 'Треугольник вверх',
      value: 'TRIANGLE',
    },
    {
      label: 'Треугольник вниз',
      value: 'TRIANGLE2',
    },
  ]

  get dndDataPanelItems() {
    return this.dndDataPanelItems;
  }

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
    selectedShapeNodeStyle: '',
  }

  localVariables = {
    isEdgeCreating: false,
    creatingEdge: null,
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

  generateIconNodes(iconsList) {
    return Promise.all(iconsList.map(async (icon) => {
      const imageStyleNode = new SimpleNode();
      const layout = await ConstructorSchemesClass.getSvgLayoutSize(icon.src);
      const nodeSize = this.generateImageSize(layout);
      imageStyleNode.layout = new Rect(0, 0, +nodeSize.width, +nodeSize.height);
      imageStyleNode.style = new ImageNodeStyle(icon.src);
      imageStyleNode.tag = {
        isAspectRatio: true,
      };
      return new DragAndDropPanelItem(imageStyleNode, 'image-node');
    }));
  }

  generateImageSize({
    width,
    height,
  }) {
    const increaseSizeFn = (resultWidth, resultHeight) => {
      if ((this.dragAndDropPanel.getMaxItemWidth * 2) < (resultWidth + resultHeight)) {
        return increaseSizeFn(+resultWidth / 2, +resultHeight / 2);
      }
      return {
        width: +resultWidth,
        height: +resultHeight,
      };
    };
    return increaseSizeFn(width, height);
  }

  static async getSvgLayoutSize(iconUrl) {
    return fetch(iconUrl)
      .then((response) => response.body)
      .then((rb) => {
        const reader = rb.getReader();

        return new ReadableStream({
          start(controller) {
            // The following function handles each data chunk
            function push() {
              // "done" is a Boolean and value a "Uint8Array"
              reader.read()
                .then(({ done, value }) => {
                  // If there is no more data to read
                  if (done) {
                    controller.close();
                    return;
                  }
                  // Get the data and send it to the browser via the controller
                  controller.enqueue(value);
                  push();
                });
            }

            push();
          },
        });
      })
      .then((stream) => new Response(
        stream,
        {
          headers: {
            'Content-Type': 'text/html',
          },
        },
      ).text())
      .then((svgText) => svgText.match(regexpSize).groups);
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
    return new DragAndDropPanelItem(defaultNode, 'default-node');
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

  constructor({
    dndPanelElem,
    elem,
    dataRest,
    iconsList,
    edgeCustomStyles,
    nodeCustomStyles,
    labelCustomStyles,
    // Сохранение через GraphML
    savedGraph,
    // Callbacks
    updateStoreCallback,
    openDataPanelCallback,
    closeDataPanelCallback,
  }) {
    this.dragAndDropPanel = null;
    this.mapper = null;
    this.elem = elem;
    this.dataRest = dataRest;
    this.iconsList = iconsList;
    // Сохранение через GraphML
    this.savedGraph = savedGraph;
    // Вторая реализация сохранения данных
    this.targetDataNode = {};
    this.graphComponent = new GraphComponent(elem);
    this.setDefaultLabelParameters();
    // Configures default styles for newly created graph elements
    this.applyStylesElements({
      nodeCustomStyles,
      edgeCustomStyles,
      labelCustomStyles,
    });
    this.configureInputModes(updateStoreCallback, openDataPanelCallback, closeDataPanelCallback);

    // Сохранение через GraphML
    this.initializeIO();
    if (this.savedGraph) {
      this.loadGraph().then(() => {
        // Выравнивание графа, инициализация dnd панели
        this.updateViewport().then(() => {
          this.dndPanelElem = dndPanelElem;
          this.initializeDnDPanel();
        });
      });
    } else {
      // Выравнивание графа, инициализация dnd панели
      this.updateViewport().then(() => {
        this.dndPanelElem = dndPanelElem;
        this.initializeDnDPanel();
      });
    }
    const { nodeDecorator } = this.graphComponent.graph.decorator;

    // Отключаем изменение размеров у ненвидимых узлов
    nodeDecorator.reshapeHandleProviderDecorator
      .hideImplementation((node) => node.tag === 'invisible');

    this.registerReshapeHandleProvider();
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

  // Сохранение через GraphML
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
      storageLocation: StorageLocation.LOCAL_STORAGE,
    });
  }

  // Сохранение
  async saveGraphToLocalStorage() {
    return new Promise((resolve) => {
      ICommand.SAVE.execute(null, this.graphComponent);
      resolve();
    });
  }

  // Загрузка
  async loadGraph() {
    return new Promise((resolve) => {
      ICommand.OPEN.execute(null, this.graphComponent);
      resolve();
    });
  }

  // Выгразука из LocalStorage в Store через callback фукцию
  updateGraphFromLocalStorage(updateStoreCallback) {
    this.savedGraph = window.localStorage.getItem('www.yworks.com/yFilesHTML/GraphML//unnamed.graphml') || '';
    window.localStorage.removeItem('www.yworks.com/yFilesHTML/GraphML//unnamed.graphml');
    if (updateStoreCallback && this.savedGraph) {
      updateStoreCallback(this.savedGraph);
    }
  }

  save(updateStoreCallback) {
    this.saveGraphToLocalStorage().then(() => {
      this.updateGraphFromLocalStorage(updateStoreCallback);
    });
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

  updateDataNode(nodeId, newData) {
    if (this.targetDataNode) {
      this.targetDataNode.tag = structuredClone(newData);
      this.graphComponent.updateVisual();
      return this.saveGraphToLocalStorage();
    }
    return new Promise((resolve) => {
      resolve();
    });
  }

  getDataNodeTemplate(templateType) {
    return this.dndDataPanelItems[templateType.replace('template-', '')].template;
  }

  getTextNodeTemplate(templateType) {
    return this.dndLabelPanelItems[templateType.replace('template-', '')].template;
  }

  // Настройка взаимодействия с графом
  configureInputModes(updateStoreCallback, openDataPanelCallback, closeDataPanelCallback) {
    // configure the snapping context
    const mode = new GraphEditorInputMode({
      allowCreateNode: false,
      allowAddLabel: false,
      allowEditLabel: true,
      allowGroupingOperations: true,
      deletableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL,
      ignoreVoidStyles: true,
      snapContext: new GraphSnapContext({
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

    // Settings dropInputMode
    // Node
    mode.nodeDropInputMode = this.settingsNodeDropInputMode();

    // Label
    mode.labelDropInputMode = this.settingsLabelDropInputMode();

    mode.addLabelAddedListener(() => {
      this.save(updateStoreCallback);
    });

    // Port
    mode.portDropInputMode = this.settingsPortDropInputMode();

    // Edge-to-edge
    mode.createEdgeInputMode.allowEdgeToEdgeConnections = true;

    // create bends only when shift is pressed
    mode.createBendInputMode.pressedRecognizer = EventRecognizers.createAndRecognizer(
      MouseEventRecognizers.LEFT_DOWN,
      KeyEventRecognizers.SHIFT_IS_DOWN,
    );

    // Init edge-to-edge settings
    this.additionalEdgeToEdgeSettings();

    this.configureEdgeDropInputMode(mode);

    // Event listeners
    this.additionalEdgeToInvisibleNodeSettings(mode, updateStoreCallback);
    // Событие добавления ребра
    mode.createEdgeInputMode.addEdgeCreatedListener(() => {
      // Сохранение в store
      this.save(updateStoreCallback);
    });

    // Событие добавления узла
    mode.addNodeCreatedListener(async (sender, evt) => {
      const createdItem = await evt.item;

      // Проверяем на значение по-умолчанию
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
      this.save(updateStoreCallback);
    });

    // Событие клика по элементу
    mode.addItemClickedListener((sender, evt) => {
      // Проверяем на наличие данных в узле
      if (evt.item instanceof INode && evt.item.tag?.templateType) {
        // Достаем элемент в отдельную переменную для дальнейшей работы с ним
        this.targetDataNode = evt.item;
        // Открываем панель для редактирования данных элемента
        openDataPanelCallback(evt.item.tag);
      } else {
        // Закрываем панель для редактирования данных элемента
        closeDataPanelCallback();
      }
    });

    // Событие удаления элемента
    mode.addDeletedItemListener((sender, evt) => {
      if (evt?.targetPortOwner?.tag === 'invisible') {
        this.graphComponent.graph.remove(evt?.targetPortOwner);
      }
      if (evt?.sourcePortOwner?.tag === 'invisible') {
        this.graphComponent.graph.remove(evt?.sourcePortOwner);
      }
      this.graphComponent.updateVisual();
      // Сохранение в store
      this.save(updateStoreCallback);
    });

    // Событие редактирования положения\размеров узла
    this.graphComponent.graph.addNodeLayoutChangedListener(throttle(() => {
      // Сохранение в store
      this.save(updateStoreCallback);
    }, 500));

    // Событие добавления\редактирования углов на ребрах
    this.graphComponent.graph.addBendLocationChangedListener(throttle(() => {
      // Сохранение в store
      this.save(updateStoreCallback);
    }, 500));

    // Сохранение inputMode
    this.graphComponent.inputMode = mode;
  }

  settingsNodeDropInputMode() {
    return new NodeDropInputMode({
      // enables the display of the dragged element during the drag
      showPreview: true,
      // initially disables snapping fo the dragged element to existing elements
      snappingEnabled: false,
      // by default the mode available in GraphEditorInputMode is disabled, so first enable it
      enabled: true,
      itemCreator: async (
        context,
        graph,
        dropData,
        dropTarget,
        dropLocation,
      ) => {
        let createdNode = null;
        if (dropData?.tag?.templateType) {
          // Узел с данными
          createdNode = graph.createNodeAt({
            location: dropLocation,
            style: new VuejsNodeStyle(this.getDataNodeTemplate(dropData.tag.templateType)),
            labels: dropData.labels,
            tag: { ...dropData.tag, nodeId: dropData.hashCode() },
          });
        } else if (dropData?.tag?.textTemplateType) {
          // Узел с текстом
          createdNode = graph.createNodeAt({
            location: dropLocation,
            style: new VuejsNodeStyle(this.getTextNodeTemplate(dropData.tag.textTemplateType)),
            labels: dropData.labels,
            tag: { ...dropData.tag, nodeId: dropData.hashCode() },
          });
        } else if (dropData?.tag?.isAspectRatio) {
          // Узел с картинкой
          createdNode = graph.createNodeAt({
            location: dropLocation,
            style: dropData.style,
            tag: {
              ...dropData.tag,
              nodeId: dropData.hashCode(),
            },
          });
        } else {
          // Обычный узел
          createdNode = graph.createNodeAt({
            location: dropLocation,
            style: dropData.style,
            labels: dropData.labels,
            tag: {
              nodeId: dropData.hashCode(),
            },
          });
        }
        // Позиция и размеры нового узла
        graph.setNodeLayout(createdNode, new Rect(
          dropLocation.x - (dropData.layout.width / 2),
          dropLocation.y - (dropData.layout.height / 2),
          dropData.layout.width,
          dropData.layout.height,
        ));
        return createdNode;
      },
    });
  }

  static createUrlIcon(ctx, url, imageSize, iconSize) {
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
      image.preserveAspectRatio = 'xMidYMid meet';
    });
  }

  static createCanvasContext(iconSize) {
    // canvas used to pre-render the icons
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', `${iconSize.width}`);
    canvas.setAttribute('height', `${iconSize.height}`);
    return canvas.getContext('2d');
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
    createEdgeInputMode.addEdgeCreatedListener(() => {
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
    });
  }

  createEdgeToInvisibleNode({
    mode,
    updateStoreCallback,
    location,
  }) {
    // Создаем невидимые узлы
    const targetNode = this.createInvisibleNode(location);
    const targetPort = this.graphComponent.graph.addRelativePort(
      targetNode,
      new Point(0, 0),
    );

    let { sourcePort } = this.creatingEdge;
    const sourcePortOwner = sourcePort.owner;
    if (sourcePortOwner instanceof INode) {
      if (!this.graphComponent.graph.ports.find((port) => port === sourcePort)) {
        sourcePort = this.graphComponent.graph.addRelativePort(
          sourcePortOwner,
          new Point(0, 0),
        );
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
      this.save(updateStoreCallback);
    }
  }

  createInvisibleNode(location) {
    return this.graphComponent.graph.createNode({
      layout: new Rect(location.x, location.y, 2, 2),
      style: new ShapeNodeStyle({
        shape: 'ellipse',
        fill: 'transparent',
        stroke: '1px transparent',
      }),
      tag: 'invisible',
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

  async updateViewport() {
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
    this.createDnDPanelItems({
      iconsList: this.iconsList,
      defaultEdgeStyle: this.defaultEdgeStyle,
      defaultNodeStyle: this.defaultNodeStyle,
      defaultLabelStyle: this.defaultLabelStyle,
    }).then((response) => {
      this.dragAndDropPanel.populatePanel(response);
    });
  }

  static createReactiveNode(data, type) {
    const dataNode = new SimpleNode();
    dataNode.tag = data.dataRest;
    dataNode.style = new VuejsNodeStyle(data.template);
    dataNode.layout = new Rect(
      0,
      0,
      data?.width,
      data?.height
        ? data.height
        : data.rowHeight * (data?.dataRest?.items?.length || 1),
    );
    return new DragAndDropPanelItem(dataNode, type);
  }

  async createDnDPanelItems({
    iconsList,
    defaultNodeStyle,
    defaultEdgeStyle,
    defaultLabelStyle,
  }) {
    return new Promise((resolve) => {
      const items = [];
      // Стандартный узел
      items.push(ConstructorSchemesClass.createDnDPanelDefaultNode(defaultNodeStyle));

      // Ребра
      const edge1 = new SimpleEdge({
        style: new PolylineEdgeStyle({
          smoothingLength: defaultEdgeStyle.smoothingLength,
          targetArrow: 'none',
          sourceArrow: 'none',
          stroke: `${defaultEdgeStyle.strokeSize} solid ${defaultEdgeStyle.strokeColor}`,
        }),
      });
      items.push(new DragAndDropPanelItem(edge1, 'edge-node'));

      // Узел с данными
      this.dndDataPanelItems.forEach((item) => {
        items.push(ConstructorSchemesClass.createReactiveNode(item, 'data-node'));
      });

      // Узел с текстом
      this.dndLabelPanelItems.forEach((item) => {
        items.push(ConstructorSchemesClass.createReactiveNode(item, 'text-node'));
      });

      // Подписи к узлам\ребрам
      const labelNode = new SimpleNode();
      labelNode.layout = new Rect(0, 0, defaultNodeStyle.size[0], 16);
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
      items.push(new DragAndDropPanelItem(labelNode, 'label-node'));

      // Узел с изображением\иконкой
      if (iconsList?.length > 0) {
        this.generateIconNodes(iconsList).then((result) => {
          items.push(...result);
          resolve(items);
        });
      } else {
        resolve(items);
      }
    });
  }

  getDataItemById(dataId) {
    return this.dataRest.find((dataItem) => dataItem.metric_name === dataId);
  }

  updateDataInNode(updatedData) {
    new Promise((resolve) => {
      this.graphComponent.graph.nodes.forEach((node) => {
        if (node.tag.dataType === '0') {
          const updatedItems = node.tag.items.map((nodeDataItem) => {
            const targetData = updatedData.find((item) => item.metric_name === nodeDataItem.id);
            if (targetData) {
              nodeDataItem = {
                ...nodeDataItem,
                textLeft: targetData.metric_long_name,
                textRight: targetData.value,
              };
            }
            return nodeDataItem;
          });
          node.tag = {
            ...node.tag,
            items: updatedItems,
          };
        }
      });
      resolve();
    }).then(() => {
      this.graphComponent.updateVisual();
    });
  }

  updateSelectedNode(updatedData, updateStoreCallback) {
    if (this.targetDataNode.tag.dataType === '0') {
      const items = updatedData.items.map((item) => ({
        ...item,
        textLeft: this.getDataItemById(item.id)?.metric_long_name || '-',
        textRight: this.getDataItemById(item.id)?.value || '-',
      }));
      this.targetDataNode.tag = {
        ...this.targetDataNode.tag,
        items,
      };
    }
    // Обновляем состояние графа
    this.graphComponent.updateVisual();
    // Сохраняем изменения
    this.save(updateStoreCallback);
  }

  // Order commands

  orderToFront() {
    if (this.graphComponent.selection.selectedNodes.toArray()?.length > 0) {
      this.graphComponent.graphModelManager
        .toFront(this.graphComponent.selection.selectedNodes);
      this.graphComponent.selection.selectedNodes.toArray().forEach((node) => {
        this.graphComponent.graphModelManager.update(node);
      });
    }
    if (this.graphComponent.selection.selectedEdges.toArray()?.length > 0) {
      this.graphComponent.graphModelManager
        .toFront(this.graphComponent.selection.selectedEdges);
      this.graphComponent.selection.selectedEdges.toArray().forEach((edge) => {
        ICommand.TO_FRONT.execute(edge, this.graphComponent);
        this.graphComponent.graphModelManager.update(edge);
      });
    }
  }

  orderToBack() {
    if (this.graphComponent.selection.selectedNodes.toArray()?.length > 0) {
      this.graphComponent.graphModelManager
        .toBack(this.graphComponent.selection.selectedNodes);
      this.graphComponent.selection.selectedNodes.toArray().forEach((node) => {
        this.graphComponent.graphModelManager.update(node);
      });
    }
    if (this.graphComponent.selection.selectedEdges.toArray()?.length > 0) {
      this.graphComponent.graphModelManager
        .toBack(this.graphComponent.selection.selectedEdges);
      this.graphComponent.selection.selectedEdges.toArray().forEach((edge) => {
        this.graphComponent.graphModelManager.update(edge);
      });
    }
  }
}

export default ConstructorSchemesClass;
