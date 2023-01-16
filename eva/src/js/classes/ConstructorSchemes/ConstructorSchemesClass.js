import yFiles, {
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
  LabelLayerPolicy,
  GraphMLIOHandler,
  GraphMLSupport,
  MoveLabelInputMode,
  GraphSnapContext,
  GridSnapTypes,
  HandlePositions,
  HierarchicNestingPolicy,
  ICommand,
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
  SimpleLabel,
  SimpleNode,
  Size,
  StorageLocation,
  VoidNodeStyle,
  SimplePort,
  FreeNodePortLocationModel,
  GraphViewerInputMode,
  PortRelocationHandleProvider,
  Visualization,
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
import testSave from './testSave.js';

License.value = licenseData; // Проверка лицензии

class ConstructorSchemesClass {
  static async webGl2CreateNode({
    graph,
    createdNode,
    dropData,
  }) {
    await graph.setStyle(
      createdNode,
      new ShapeNodeStyle({
        shape: 'round-rectangle',
        fill: Utils.colorToString(Color.from(dropData.style.fill.color)),
        stroke: `${Utils.colorToString(Color.from(dropData.style.stroke.fill.color))} ${dropData.style.stroke.thickness}px`,
      }),
    );
    return createdNode;
  }

  static getColorForColorPicker(color) {
    return {
      rgba: {
        r: color.r,
        g: color.g,
        b: color.b,
        a: color.a,
      },
      rgbaString: Utils.colorToString(color),
    };
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

  static createReactiveNode(data) {
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
      font: '12px Tahoma', // Size, family
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

  // Template elements
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
    <template v-if="tag.widthLeft > 0">
    <!--Bg-left-->
    <rect
        x="0"
        y="0"
        :width="layout.width * (tag.widthLeft / 100)"
        :height="layout.height"
        fill="#FFFFFF"
        :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
    />
    <!--Bg-right-->
    <rect
        :x="layout.width * (tag.widthLeft / 100)"
        y="0"
        :width="layout.width - (layout.width * (tag.widthLeft / 100))"
        :height="layout.height"
        fill="#000000"
        :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
    />
    </template>
    <template v-else>
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
    </template>
    <template v-if="tag && tag.items && tag.items.length > 0">
        <template v-for="(item, index) in tag.items">
            <text
                dx="0.5em"
                class="b-data-node__text b-data-node__text--left"
                fill="#3C3B45"
                :dy="(((layout.height / tag.items.length) * (index + 1)) - ((layout.height / tag.items.length) / 2))"
                alignment-baseline="middle"
                :key="'row-' + tag.nodeId + '-' + index + '-text-left'"
                :font-size="((layout.height / tag.items.length) * 0.8) + 'px'"
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
                :font-size="((layout.height / tag.items.length) * 0.8) + 'px'"
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
        dataType: 'data-type-0',
        templateType: 'template-0',
        widthLeft: 50,
        items: [
          {
            id: '',
            textLeft: '-',
            textRight: '-',
          },
          {
            id: '',
            textLeft: '-',
            textRight: '-',
          },
          {
            id: '',
            textLeft: '-',
            textRight: '-',
          },
          {
            id: '',
            textLeft: '-',
            textRight: '-',
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
        <template v-if="tag.widthLeft > 0">
          <!--Bg-left-->
          <rect
           x="0"
           y="0"
           :width="layout.width * (tag.widthLeft / 100)"
           :height="layout.height"
           fill="#FFFFFF"
           :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
          />
          <!--Bg-right-->
          <rect
           :x="layout.width * (tag.widthLeft / 100)"
           y="0"
           :width="layout.width - (layout.width * (tag.widthLeft / 100))"
           :height="layout.height"
           fill="#000000"
           :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
          />
        </template>
        <template v-else>
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
        </template>
        
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
            :font-size="((layout.height / tag.items.length) * 0.8) + 'px'"
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
             :font-size="((layout.height / tag.items.length) * 0.8) + 'px'"
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
        dataType: 'data-type-1',
        nodeId: 'template-1',
        templateType: 'template-1',
        widthLeft: 30,
        items: [
          {
            id: '',
            textLeft: '-',
            textRight: '-',
          },
          {
            id: '',
            textLeft: '-',
            textRight: '-',
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
       :font-size="((layout.height / 2) * 0.8) + 'px'"
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
       :font-size="((layout.height / 2) * 0.8) + 'px'"
      >
        {{ tag.textSecond }}
      </text>
    </g>`,
      width: 150,
      rowHeight: 30,
      dataRest: {
        dataType: 'data-type-2',
        nodeId: 'template-2',
        templateType: 'template-2',
        id: '',
        textFirst: '-',
        textSecond: '-',
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
          :font-size="((layout.height / 2) * 0.8) + 'px'"
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
          :font-size="((layout.height / 2) * 0.8) + 'px'"
        >
          {{ tag.textSecond }}
        </text>
      </g>`,
      width: 150,
      rowHeight: 30,
      dataRest: {
        dataType: 'data-type-3',
        nodeId: 'template-3',
        templateType: 'template-3',
        id: '',
        textFirst: '-',
        textSecond: '-',
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
         :font-size="((layout.height / 2) * 0.8) + 'px'"
       >
           {{ tag.currentValue }}
       </text>
     </g>`,
      width: 150,
      height: 30,
      dataRest: {
        dataType: 'data-type-4',
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
      <template v-if="(tag.firstValue + tag.secondValue) > 0 && typeof (tag.firstValue + tag.secondValue) === 'number'">
        <!--Bg-left-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height * (tag.firstValue / (tag.firstValue + tag.secondValue))"
          :fill="tag.firstValueColor"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-right-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height * (tag.secondValue / (tag.firstValue + tag.secondValue))"
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
          :fill="tag.firstTextColor"
          :font-size="((layout.height / 3) * 0.8) + 'px'"
        >
            {{ tag.firstValue }}
        </text>
        <text
          class="b-data-node__text"
          :dx="layout.width / 2"
          :dy="(layout.height / 6) * 4"
          alignment-baseline="middle"
          text-anchor="middle"
          :fill="tag.secondTextColor"
          :font-size="((layout.height / 3) * 0.8) + 'px'"
        >
            {{ tag.secondValue }}
        </text>
      </template>
      <template v-else>
        <text
            class="b-data-node__text"
            :dx="layout.width / 2"
            :dy="(layout.height / 6) * 2"
            alignment-baseline="middle"
            text-anchor="middle"
            :style="'text-wrap:' + layout.width + 'px; text-extent: 3line'"
            :fill="tag.firstTextColor"
            :font-size="((layout.height / 3) * 0.8) + 'px'"
          >
              Выбраны некорректные значения
        </text>
      </template>
    </g>`,
      width: 150,
      height: 70,
      dataRest: {
        dataType: 'data-type-5',
        nodeId: 'template-5',
        idFirst: '',
        templateType: 'template-5',
        firstValue: 5,
        firstValueColor: '#3366FF',
        firstTextColor: '#FFFFFF',
        secondValue: 5,
        secondValueColor: '#FF5147',
        secondTextColor: '#FFFFFF',
        idSecond: '',
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
              :rx="tag.bordered && tag.borderSize / 2 || 3"
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
          :rx="tag.bordered && tag.borderSize / 2 || 3" 
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
              fontSize: tag.fontSize ? tag.fontSize + 'px' : '12px',
              fontFamily: tag.fontFamily,
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
        dataType: 'label-type-0',
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
        fontSize: 12,
      },
    },
  ]

  dndShapeNode = {
    template: `
      <g>
        <template v-if="tag.shape === 0">
          <!--round-rectangle-->
          <rect 
            x="0" 
            y="0" 
            :width="layout.width" 
            :height="layout.height" 
            rx="10" 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
          />
        </template>
        <template v-else-if="tag.shape === 1">
          <!--rectangle-->
          <polygon 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
            :points="'0,0 ' + layout.width + ',0 ' + layout.width + ',' + layout.height + ' 0,' + layout.height"
          />
        </template>
        <template v-else-if="tag.shape === 2">
          <!--ellipse-->
          <ellipse 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
            :ry="layout.height / 2" 
            :cy="layout.height / 2" 
            :rx="layout.width / 2" 
            :cx="layout.width / 2"
          />
        </template>
        <template v-else-if="tag.shape === 3">
          <!--triangle-left-->
          <polygon 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
           :points="layout.width + ',' + layout.height + ' ' + '0,' + layout.height / 2 + ' ' + layout.width + ',0'"
          />
        </template>
        <template v-else-if="tag.shape === 4">
          <!--triangle-right-->
          <polygon 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
           :points="0 + ',' + layout.height + ' ' + layout.width + ',' + layout.height / 2 + ' ' + '0,0'"
          />
        </template>
      </g> 
    `,
  };

  shapeNodeStyleList = [
    {
      label: 'Rectangle(rounded)',
      id: 0,
    },
    {
      label: 'Rectangle',
      id: 1,
    },
    {
      label: 'Ellipse',
      id: 2,
    },
    {
      label: 'Triangle(left)',
      id: 3,
    },
    {
      label: 'Triangle(right)',
      id: 4,
    },
  ]

  copiedElements = null

  get defaultDataSource() {
    return this.defaultDataSource;
  }

  set defaultDataSource(value) {
    this.defaultDataSource = value;
  }

  get getShapeNodeStyleList() {
    return this.shapeNodeStyleList;
  }

  get dndDataPanelItems() {
    return this.dndDataPanelItems;
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

  get dataRest() {
    return this.localVariables.dataRest;
  }

  set dataRest(value) {
    this.localVariables.dataRest = value;
  }

  constructor({
    dndPanelElem,
    elem,
    dataRest,
    iconsList,
    elementDefaultStyles,
    // Сохранение через GraphML
    savedGraph,
    savedGraphObject,
    // Callbacks
    updateStoreCallback,
    updateStoreCallbackV2,
    openDataPanelCallback,
    closeDataPanelCallback,
    toggleLoadingCallback,
    isEdit,
  }) {
    this.dragAndDropPanel = null;
    this.mapper = null;
    this.elem = elem;
    this.isEdit = isEdit;
    this.dataRest = dataRest;
    this.iconsList = iconsList;
    // Сохранение через GraphML
    this.savedGraph = testSave.graph;
    this.savedGraphObject = savedGraphObject;
    this.updateStoreCallback = updateStoreCallback;
    this.updateStoreCallbackV2 = updateStoreCallbackV2;
    this.openDataPanelCallback = openDataPanelCallback;
    this.closeDataPanelCallback = closeDataPanelCallback;
    this.toggleLoadingCallback = toggleLoadingCallback;
    // Вторая реализация сохранения данных
    this.targetDataNode = {};
    this.graphComponent = new GraphComponent(elem);
    this.additionalEdgeToEdgeSettings();
    this.setDefaultLabelParameters();
    // Configures default styles for newly created graph elements
    this.applyStylesElements(elementDefaultStyles);
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
    this.initializeIO();
    // if (this.savedGraph) {
    //   this.loadGraph().then(() => {
    //     this.updateDataNodeTemplate();
    //     // Выравнивание графа, инициализация dnd панели
    //     this.updateViewport().then(() => {
    //       this.dndPanelElem = dndPanelElem;
    //       this.initializeDnDPanel();
    //     });
    //   });
    // } else {
    // // Выравнивание графа, инициализация dnd панели
    //   this.updateViewport().then(() => {
    //     this.dndPanelElem = dndPanelElem;
    //     this.initializeDnDPanel();
    //   });
    // }

    this.schemeUpdater = null;
    if (this.savedGraphObject) {
      this.load();
    }
    // Выравнивание графа, инициализация dnd панели
    this.updateViewport().then(() => {
      this.dndPanelElem = dndPanelElem;
      this.initializeDnDPanel();
    });
    // }
    this.disableResizeInvisibleNodes();

    this.registerReshapeHandleProvider();
    this.graphComponent.graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NODES;
    // Привязка z-order у label к родителю
    this.graphComponent.graphModelManager.labelLayerPolicy = LabelLayerPolicy.AT_OWNER;
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
    defaultNode.style = new VuejsNodeStyle(elementTemplates[data.dataRest.dataType].template);
    defaultNode.tag = {
      dataType: data.dataRest.dataType,
      fill: Utils.generateColor(data.dataRest.fill),
      strokeColor: Utils.generateColor(data.dataRest.strokeColor),
      thickness: data.dataRest.strokeSize,
      shape: data.dataRest.shape,
    };
    return new DragAndDropPanelItem(defaultNode, 'Стандартные элементы', 'default-element');
  }

  initSchemeUpdater() {
    return new SchemeUpdater({
      graph: this.graphComponent.graph,
      elementsFromStore: this.savedGraphObject,
      updateStoreCallback: this.updateStoreCallbackV2,
    });
  }

  // old
  // Save
  save(updateStoreCallback) {
    this.saveGraphToLocalStorage().then(() => {
      this.updateGraphFromLocalStorage(updateStoreCallback);
    });
  }

  async saveGraphToLocalStorage() {
    return new Promise((resolve) => {
      ICommand.SAVE.execute(null, this.graphComponent);
      resolve();
    });
  }

  // Load
  async loadGraph() {
    return new Promise((resolve) => {
      ICommand.OPEN.execute(null, this.graphComponent);
      resolve();
    }).then(() => {
      this.setDefaultElementsOrder();
    });
  }

  updateDataNodeTemplate() {
    this.graphComponent.graph.nodes.forEach((node) => {
      if (node.tag.dataType) {
        node.tag = ConstructorSchemesClass.upgradeNodeTag(node);
        if (node.tag.dataType !== 'image-node' && node?.tag?.dataType !== 'invisible') {
          this.graphComponent.graph.setStyle(
            node,
            new VuejsNodeStyle(elementTemplates[node.tag.dataType].template),
          );
        }
      }
    });
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

  getDefaultDataNodeParams(dataType, fieldName) {
    try {
      const defaultOptions = this.dndDataPanelItems
        .find((item) => item?.dataRest?.dataType === dataType);
      return defaultOptions.dataRest[fieldName];
    } catch (e) {
      throw new Error(e);
    }
  }

  // Load from LocalStorage to Store
  updateGraphFromLocalStorage(updateStoreCallback) {
    this.savedGraph = window.localStorage.getItem('www.yworks.com/yFilesHTML/GraphML//unnamed.graphml') || '';
    window.localStorage.removeItem('www.yworks.com/yFilesHTML/GraphML//unnamed.graphml');
    if (updateStoreCallback && this.savedGraph) {
      updateStoreCallback(this.savedGraph);
    }
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
      storageLocation: StorageLocation.LOCAL_STORAGE,
    });
  }

  saveAnObject() {
    const schemeUpdater = this.initSchemeUpdater();
    schemeUpdater.save().then((result) => {
      console.log(result);
    });
  }

  load() {
    const schemeUpdater = this.initSchemeUpdater();
    schemeUpdater.load();
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
      this.defaultLabelStyle = {
        font: styles.labelFont,
        textFill: styles.labelTextFill.rgbaString,
      };
    }
    this.setDefaultStyles();
    if (this.dndPanelElem) {
      this.initializeDnDPanel();
    }
  }

  getDataNodeTemplate(templateType) {
    return this.dndDataPanelItems[templateType.replace('template-', '')].template;
  }

  getTextNodeTemplate(templateType) {
    return this.dndLabelPanelItems[templateType.replace('template-', '')].template;
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
    this.graphComponent.inputMode = new GraphViewerInputMode({
      focusableItems: 'none',
    });
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
      // Выключены встроеные способы копирования т.к. работают не корректно, написан свой
      allowPaste: false,
      allowDuplicate: false,
      ignoreVoidStyles: true,
      allowClipboardOperations: false,
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
      // this.save(updateStoreCallback);
      this.saveAnObject();
    });

    // Событие добавления ребра
    mode.createEdgeInputMode.addEdgeCreatedListener(() => {
      // Сохранение в store
      // this.save(updateStoreCallback);
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
      // this.save(updateStoreCallback);
      this.saveAnObject();
    });

    // Событие клика по элементу
    mode.addItemClickedListener((sender, evt) => {
      // Проверяем на наличие данных в узле
      if (
        evt.item instanceof INode
        || evt.item instanceof IEdge
        || evt.item instanceof ILabel
      ) {
        // Достаем элемент в отдельную переменную для дальнейшей работы с ним
        this.targetDataNode = evt.item;
        // Открываем панель для редактирования данных элемента
        if (evt.item.tag?.templateType || evt.item.tag?.textTemplateType) {
          openDataPanelCallback(evt.item.tag);
        } else if (evt.item instanceof IEdge) {
          openDataPanelCallback({
            ...ConstructorSchemesClass.getEdgeOptions(evt.item),
            dataType: 'edge',
            nodeId: evt.item.hashCode(),
          });
        } else if (evt.item instanceof ILabel) {
          openDataPanelCallback({
            dataType: 'label',
            fontSize: evt.item.style.textSize,
            color: Utils.generateColor(evt.item.style.textFill.color),
          });
        } else {
          openDataPanelCallback({
            ...evt.item.tag,
          });
        }
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
      // this.save(updateStoreCallback);
      this.saveAnObject();
    });

    // Событие редактирования положения\размеров узла
    this.graphComponent.graph.addNodeLayoutChangedListener(throttle(() => {
      // Сохранение в store
      // this.save(updateStoreCallback);
      this.saveAnObject();
    }, 500));

    // Событие добавления\редактирования углов на ребрах
    this.graphComponent.graph.addBendLocationChangedListener(throttle(() => {
      // Сохранение в store
      // this.save(updateStoreCallback);
      this.saveAnObject();
    }, 500));

    // Сохранение inputMode
    this.graphComponent.inputMode = mode;
  }

  getTemplateElementsForCopy(xOffset = 10, yOffset = 10) {
    return this.graphComponent.selection.toArray().map((el) => {
      // TODO: Пока сделано только для узлов
      if (el instanceof INode) {
        const node = {
          location: {
            x: el.layout.x + xOffset,
            y: el.layout.y + yOffset,
          },
          layout: {
            width: el.layout.width,
            height: el.layout.height,
          },
          labels: el.labels,
          id: el.hashCode(),
          tag: el.tag,
        };
        if (el.tag.dataType === 'image-node') {
          return {
            ...node,
            style: el.style.clone(),
          };
        }
        return node;
      }
      return null;
    }).filter((el) => el !== null);
  }

  copyElement() {
    // Очищаем ранее скопированные элементы
    this.copiedElements = null;
    // Сохраняем новые
    this.copiedElements = this.getTemplateElementsForCopy();
  }

  async pasteElement() {
    if (this.copiedElements?.length > 0) {
      this.graphComponent.selection.clear();
      await Promise.all(this.copiedElements.map((element) => this.nodeCreator({
        graph: this.graphComponent.graph,
        dropData: element,
        dropLocation: element?.location,
        isNewNode: false,
      }))).then((createdElements) => {
        createdElements.forEach((el) => {
          this.graphComponent.inputMode.setSelected(el, true);
          this.copyElement();
        });
        this.graphComponent.updateVisual();
      });
    }
  }

  async nodeCreator({
    context,
    graph,
    dropData,
    dropTarget,
    dropLocation,
    isCopiedElement = false,
  }) {
    let createdNode = null;
    if (dropData?.tag?.templateType) {
      // Узел с данными
      createdNode = this.createDataNode({
        graph,
        location: dropLocation,
        data: dropData,
      });
    } else if (dropData?.tag?.textTemplateType) {
      // Узел с текстом
      createdNode = this.createTextNode({
        graph,
        location: dropLocation,
        data: dropData,
      });
    } else if (dropData?.tag?.isAspectRatio) {
      // Узел с картинкой
      createdNode = graph.createNodeAt({
        location: dropLocation,
        style: dropData.style,
        tag: {
          ...dropData.tag,
          nodeId: dropData?.id || dropData.hashCode(),
        },
      });
    } else {
      // Обычный узел
      createdNode = graph.createNodeAt({
        location: dropLocation,
        style: new VuejsNodeStyle(this.dndShapeNode.template),
        labels: dropData.labels,
        tag: {
          ...dropData.tag,
          nodeId: dropData?.id || dropData.hashCode(),
        },
      });
    }
    const nodePosition = new Rect(
      isCopiedElement ? dropLocation.x : dropLocation.x - (dropData.layout.width / 2),
      isCopiedElement ? dropLocation.y : dropLocation.y - (dropData.layout.height / 2),
      dropData.layout.width,
      dropData.layout.height,
    );
    createdNode.tag.nodeId = createdNode.hashCode();
    graph.setNodeLayout(createdNode, nodePosition);
    return createdNode;
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
    updateStoreCallback,
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
      // this.save(updateStoreCallback);
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
      this.defaultNodeSize[0],
      this.defaultNodeSize[1],
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
      defaultEdgeStyle: this.defaultEdgeStyle,
      defaultNodeStyle: this.defaultNodeStyle,
      defaultLabelStyle: this.defaultLabelStyle,
    }).then((response) => {
      this.dragAndDropPanel.populatePanel(response);
      this.toggleLoadingCallback(false);
    });
  }

  refreshDnDPanel(updatedPrimitives) {
    this.dragAndDropPanel.clearDnDPanel();
    this.initializeDnDPanel(updatedPrimitives);
  }

  async createDnDPanelItems({
    iconsList,
    defaultEdgeStyle,
    defaultLabelStyle,
  }) {
    this.loadingDnDPanelItems = true;
    return new Promise((resolve) => {
      const items = [];
      // Ребра
      const edge1 = new SimpleEdge({
        style: new PolylineEdgeStyle({
          smoothingLength: defaultEdgeStyle.smoothingLength,
          targetArrow: 'none',
          sourceArrow: 'none',
          stroke: `${defaultEdgeStyle.strokeSize} solid ${defaultEdgeStyle.strokeColor}`,
        }),
      });
      items.push(new DragAndDropPanelItem(edge1, 'Стандартные элементы', 'default-element'));
      if (elementTemplates) {
        Object.entries(elementTemplates).forEach(([key, value]) => {
          if (key.includes('shape-type')) {
            items.push(this.createDnDPanelDefaultNode(value));
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
                ConstructorSchemesClass.createReactiveNode(value),
                'Элементы с текстом',
                'text-node',
              ),
            );
          }
        });
      }

      // Подписи к узлам\ребрам
      const labelNode = new SimpleNode();
      labelNode.layout = new Rect(0, 0, this.defaultNodeSize[0], 16);
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
      items.push(new DragAndDropPanelItem(labelNode, 'Подписи к блокам', 'label-node'));

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

  getDataItemById(dataId) {
    return this.dataRest.find((dataItem) => dataItem.TagName === dataId);
  }

  updateDataInNode(updatedData) {
    new Promise((resolve) => {
      this.graphComponent.graph.nodes.forEach((node) => {
        const { dataType } = node.tag;
        if (dataType === 'data-type-0') {
          const updatedItems = node.tag.items.map((nodeDataItem) => {
            const targetData = updatedData.find((item) => item.TagName === nodeDataItem.id);
            if (targetData) {
              nodeDataItem = {
                ...nodeDataItem,
                textLeft: targetData?.Description || '-',
                textRight: targetData?.value || '-',
              };
            }
            return nodeDataItem;
          });
          node.tag = {
            ...node.tag,
            items: updatedItems,
          };
        } else if (dataType === 'data-type-1') {
          const targetData = updatedData.find((item) => item.TagName === node.tag.id);
          node.tag = {
            ...node.tag,
            textFirst: targetData?.value || '-',
            textSecond: targetData?.Description || '-',
          };
        } else if (dataType === 'data-type-2') {
          const targetData = updatedData.find((item) => item.TagName === node.tag.id);
          node.tag = {
            ...node.tag,
            currentValue: targetData?.value ? +targetData.value : 0,
          };
        } else if (dataType === 'data-type-3') {
          const targetDataFirst = updatedData.find((item) => item.TagName === node.tag.idFirst);
          const targetDataSecond = updatedData.find((item) => item.TagName === node.tag.idSecond);
          node.tag = {
            ...node.tag,
            firstValue: targetDataFirst?.value ? +targetDataFirst.value : 0,
            secondValue: targetDataSecond?.value ? +targetDataSecond.value : 0,
          };
        }
      });
      resolve();
    }).then(() => {
      this.graphComponent.updateVisual();
    });
  }

  updateSelectedNode(dataFromComponent, updateStoreCallback) {
    let updatedData = null;
    const dataType = this.targetDataNode.tag?.dataType;
    if (dataType === 'data-type-0') {
      updatedData = {
        widthLeft: dataFromComponent?.widthLeft,
        items: dataFromComponent.items.map((item) => ({
          ...item,
          textLeft: this.getDataItemById(item.id)?.Description || '-',
          textRight: this.getDataItemById(item.id)?.value || '-',
        })),
      };
    } else if (dataType === 'data-type-1') {
      updatedData = {
        ...dataFromComponent,
        textFirst: this.getDataItemById(dataFromComponent.id)?.value || '-',
        textSecond: this.getDataItemById(dataFromComponent.id)?.Description || '-',
      };
    } else if (dataType === 'data-type-2') {
      updatedData = {
        ...dataFromComponent,
        currentValue: Number(this.getDataItemById(dataFromComponent.id)?.value || 0),
        maxValue: Number(dataFromComponent.maxValue || 0),
      };
    } else if (dataType === 'data-type-3') {
      updatedData = {
        ...dataFromComponent,
        firstValue: Number(this.getDataItemById(dataFromComponent.idFirst)?.value),
        secondValue: Number(this.getDataItemById(dataFromComponent.idSecond)?.value),
      };
    } else if (dataType === 'label-type-0' || dataType === 'shape-type-0') {
      updatedData = dataFromComponent;
    } else if (dataFromComponent.dataType === 'edge') {
      this.updateEdgeVisual(dataFromComponent);
      updatedData = dataFromComponent;
    } else if (dataFromComponent.dataType === 'label') {
      this.updateLabelVisual(dataFromComponent);
    }
    this.targetDataNode.tag = {
      ...this.targetDataNode.tag,
      ...updatedData,
    };
    // Обновляем состояние графа
    this.graphComponent.updateVisual();
    // Сохраняем изменения
    // this.save(updateStoreCallback);
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

  // Order commands
  changeOrderSelectedElements(method, command) {
    const nodes = this.graphComponent.selection.selectedNodes;
    const edges = this.graphComponent.selection.selectedEdges;
    const elements = [...nodes.toArray(), ...edges.toArray()];

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

  orderTo(key) {
    const orderCommands = {
      toFront: 'TO_FRONT',
      toBack: 'TO_BACK',
      raise: 'RAISE',
      lower: 'LOWER',
    };
    this.changeOrderSelectedElements(key, orderCommands[key]);
  }

  setDefaultElementsOrder() {
    this.graphComponent.graph.nodes.forEach((node) => {
      if (node.tag.templateType) {
        this.graphComponent.graphModelManager.toFront([node]);
      } else if (node.tag.dataType === 'image-node') {
        this.graphComponent.graphModelManager.toFront([node]);
        this.graphComponent.graphModelManager.lower([node]);
      } else if (node.tag.textTemplateType) {
        this.graphComponent.graphModelManager.toFront([node]);
        this.graphComponent.graphModelManager.lower([node]);
        this.graphComponent.graphModelManager.lower([node]);
      } else if (node.tag.dataType === 'default-node') {
        this.graphComponent.graphModelManager.toFront([node]);
        this.graphComponent.graphModelManager.lower([node]);
        this.graphComponent.graphModelManager.lower([node]);
        this.graphComponent.graphModelManager.lower([node]);
      }
      this.graphComponent.graphModelManager.update(node);
    });
  }

  updateDataRest(updatedData) {
    this.dataRest = updatedData;
  }

  fitGraphContent() {
    this.graphComponent.fitGraphBounds().then(() => {
      this.graphComponent.updateVisual();
    });
  }

  deleteAllImageNode() {
    return new Promise((resolve, reject) => {
      try {
        this.graphComponent.graph.nodes.toArray().forEach((node) => {
          if (node.tag.dataType === 'image-node') {
            this.graphComponent.graph.remove(node);
          }
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  deleteAllTextNodeByImage() {
    return new Promise((resolve, reject) => {
      try {
        this.graphComponent.graph.nodes.toArray().forEach((node) => {
          if (node.tag.dataType === 'label-0' && node.tag?.byImage) {
            this.graphComponent.graph.remove(node);
          }
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  buildGraph(dataSource) {
    this.defaultDataSource = dataSource;
    this.deleteAllImageNode()
      .then(() => this.deleteAllTextNodeByImage())
      .then(() => this.getIconsListForGraph({
        iconsList: this.defaultDataSource,
        maxItemSize: 150,
        minItemSize: 150,
      }))
      .then((dataForGraph) => {
        this.createElementFromDefaultData(dataForGraph);
      });
  }

  createDataNode({ graph, location, data }) {
    return graph.createNodeAt({
      location,
      style: new VuejsNodeStyle(elementTemplates[data.tag.dataType].template),
      tag: {
        ...data.tag,
        nodeId: data.id || data.hashCode(),
      },
    });
  }

  createTextNode({ graph, location, data }) {
    return graph.createNodeAt({
      location,
      style: new VuejsNodeStyle(elementTemplates[data.tag.dataType].template),
      tag: {
        ...data.tag,
        fontFamily: this.defaultLabelStyle.font.split(' ')[1] || '',
        nodeId: data?.id || data.hashCode(),
      },
    });
  }

  createElementFromDefaultData(elements, offsetY = 20, offsetX = 20) {
    try {
      let elementYPosition = this.graphComponent.viewPoint.y;
      const resultElements = elements.map(async (element, index) => new Promise((resolve) => {
        // icon-node
        const createdIconNode = this.graphComponent.graph.createNodeAt({
          location: new Point(
            this.graphComponent.viewPoint.x,
            elementYPosition,
          ),
          style: element.icon.node.style.clone(),
          tag: {
            ...element.icon.node.tag,
            nodeId: index,
          },
        });
        const data = {
          tag: {
            ...element.description.node.tag,
            dataType: element.description.dataType,
            text: `${element.description.text}`,
            byImage: true,
          },
          id: +`${index + 1}${index}`,
          byIconId: createdIconNode.tag.nodeId,
        };
        const createdTextNode = this.createTextNode({
          graph: this.graphComponent.graph,
          location: new Point(
            this.graphComponent.viewPoint.x + element.icon.node.layout.width,
            0,
          ),
          data,
        });
        resolve({
          createdIconNode,
          createdTextNode,
        });
      }).then(({
        createdIconNode,
        createdTextNode,
      }) => new Promise((resolve) => {
        const iconNodeHeight = element.icon.node.layout.height;
        const iconNodePosition = new Rect(
          createdIconNode.layout.x,
          elementYPosition,
          element.icon.node.layout.width,
          element.icon.node.layout.height,
        );
        const textNodeHeight = element.description.node.layout.height;
        const textNodePosition = new Rect(
          createdTextNode.layout.x + offsetX,
          elementYPosition + (((iconNodeHeight + offsetY) - (textNodeHeight + offsetY)) / 2),
          element.description.node.layout.width,
          element.description.node.layout.height,
        );
        this.graphComponent.graph.setNodeLayout(createdIconNode, iconNodePosition);
        this.graphComponent.graph.setNodeLayout(createdTextNode, textNodePosition);
        this.graphComponent.updateVisual();
        elementYPosition += element.icon.node.layout.height + offsetY;
        resolve();
      })));
      Promise.all(resultElements)
        .then(() => {
          this.fitGraphContent();
        });
    } catch (e) {
      throw new Error(e);
    }
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
            const node = ConstructorSchemesClass.createReactiveNode(this.dndLabelPanelItems[0]);
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
}

export default ConstructorSchemesClass;
