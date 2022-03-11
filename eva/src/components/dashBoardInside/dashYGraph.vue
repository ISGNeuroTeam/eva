<template>
  <div class="ygraph-wrapper">
    <div class="button-block">
      <v-row align="start">
        <v-tooltip
          bottom
          :color="colorFrom.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <v-icon
              :color="
                isEditor
                  ? colorFrom.$primary_button
                  : colorFrom.$accent_ui_color
              "
              :disabled="loading"
              v-on="on"
              @click="changeInputMode"
            >
              {{ iconArrowAll }}
            </v-icon>
          </template>
          <span>Перемещение по графу</span>
        </v-tooltip>

        <v-tooltip
          bottom
          :color="colorFrom.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <v-icon
              :color="colorFrom.$accent_ui_color"
              :disabled="loading"
              v-on="on"
              @click="zoomIn"
            >
              {{ mdiMagnifyPlus }}
            </v-icon>
          </template>
          <span>Увеличить</span>
        </v-tooltip>

        <v-tooltip
          bottom
          :color="colorFrom.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <v-icon
              :color="colorFrom.$accent_ui_color"
              :disabled="loading"
              v-on="on"
              @click="zoomOut"
            >
              {{ mdiMagnifyMinus }}
            </v-icon>
          </template>
          <span>Уменьшить</span>
        </v-tooltip>

        <v-tooltip
          bottom
          :color="colorFrom.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <v-icon
              :color="colorFrom.$accent_ui_color"
              :disabled="loading"
              v-on="on"
              @click="fitContent"
            >
              {{ mdiFitToPageOutline }}
            </v-icon>
          </template>
          <span>Выровнять</span>
        </v-tooltip>
      </v-row>
    </div>
    <div
      ref="graph"
      class="ygraph-component-container"
      :style="{ top: `${top}` }"
    >
      <div class="popupContainer">
        <div
          ref="nodePopupContent"
          class="popupContent"
          tabindex="0"
        >
          <div class="popupContentTitle">
            <div data-id="node" />
            <div
              data-id="node_description"
              style="font-size: 0.9rem"
            />
          </div>
          <div class="popupContentTabsHeader">
            <div
              :class="{ active: popupNodeCurrentTab === 0 }"
              @click="popupNodeCurrentTab = 0"
            >
              Parents
            </div>
            <div
              :class="{ active: popupNodeCurrentTab === 1 }"
              @click="popupNodeCurrentTab = 1"
            >
              Children
            </div>
          </div>
          <div class="popupContentTabs">
            <div
              ref="popupContentTabParents"
              :class="{ active: popupNodeCurrentTab === 0 }"
            >
              <div
                v-for="item in parentNodes"
                :key="item"
              >
                • Node: {{ item }}
              </div>
              <div v-if="parentNodes.length === 0">
                Empty
              </div>
            </div>
            <div
              ref="popupContentTabChildren"
              :class="{ active: popupNodeCurrentTab === 1 }"
            >
              <div
                v-for="item in childrenNodes"
                :key="item"
              >
                • Node: {{ item }}
              </div>
              <div v-if="childrenNodes.length === 0">
                Empty
              </div>
            </div>
          </div>
        </div>

        <div
          ref="edgePopupContent"
          class="popupContent"
          style="text-align: center"
          tabindex="0"
        >
          <div style="display: inline-block">
            <div
              data-id="sourceName"
              style="font-weight: bold; float: left"
            />
            <div style="float: left; margin-left: 5px; margin-right: 5px">
              ->
            </div>
            <div
              data-id="targetName"
              style="font-weight: bold; float: left"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as yfile from 'yfiles';
import {
  mdiArrowAll,
  mdiMagnifyPlus,
  mdiFitToPageOutline,
  mdiMagnifyMinus,
} from '@mdi/js';
import {
  EdgePathLabelModel,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphItemTypes,
  IEdge,
  INode,
  Point,
  Stroke,
  Color,
  ArrowType,
  Arrow,
  PolylineEdgeStyle,
  EdgeStyleDecorationInstaller,
  StyleDecorationZoomPolicy,
  BezierEdgeStyle,
  TimeSpan,
  Key,
  ModifierKeys,
  SimpleLabel,
  Size,
} from 'yfiles';
import licenseData from './license.json';

yfile.License.value = licenseData; // проверка лицензии

const labelFont = new yfile.Font({ fontSize: 70, fontFamily: 'sefif' });
const labelFontBOLD = new yfile.Font({
  fontSize: 70,
  fontFamily: 'sefif',
  fontWeight: 'BOLD',
});

class HTMLPopupSupport {
  /**
   * Initializes a new HTMLPopupSupport instance for the given graph component, pop-up container
   * div, and pop-up placement parameter.
   * @param {!GraphComponent} graphComponent The GraphComponent
   * that displays the nodes and edges for which pop-ups
   * will be shown.
   * @param {!HTMLElement} div The HTMLDivElement that is
   * used as parent element for the pop-up element.
   * @param {!ILabelModelParameter} labelModelParameter The placement
   * parameter that determines the pop-up location.
   */
  constructor(graphComponent, div, labelModelParameter) {
    this.labelModelParameter = labelModelParameter;
    this.div = div;
    this.graphComponent = graphComponent;
    // eslint-disable-next-line no-underscore-dangle
    this._currentItem = null;
    this.dirty = false;
    // make the popup invisible
    div.style.opacity = '0';
    div.style.display = 'none';

    this.registerListeners();
  }

  /**
   * Gets the node or edge to display information for.
   * @type {?(IEdge|INode)}
   */
  get currentItem() {
    // eslint-disable-next-line no-underscore-dangle
    return this._currentItem;
  }

  /**
   * Sets the node or edge to display information for.
   * Setting this property to a value other than null shows the pop-up.
   * Setting the property to null hides the pop-up.
   * @type {?(IEdge|INode)}
   */
  set currentItem(value) {
    // eslint-disable-next-line no-underscore-dangle
    this._currentItem = value;
    if (value) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Registers viewport, node bounds changes, and visual tree listeners to the support's associated
   * graph component.
   */
  registerListeners() {
    // Adds listener for viewport changes
    this.graphComponent.addViewportChangedListener(() => {
      if (this.currentItem) {
        this.dirty = true;
      }
    });

    // Adds listeners for node bounds changes
    this.graphComponent.graph.addNodeLayoutChangedListener((node) => {
      const item = this.currentItem;
      if (
        item
        && (item === node || HTMLPopupSupport.isEdgeConnectedTo(item, node))
      ) {
        this.dirty = true;
      }
    });

    // Adds listener for updates of the visual tree
    this.graphComponent.addUpdatedVisualListener(() => {
      if (this.currentItem && this.dirty) {
        this.dirty = false;
        this.updateLocation();
      }
    });
  }

  /**
   * Makes this pop-up visible.
   */
  show() {
    this.div.style.display = 'block';
    setTimeout(() => {
      this.div.style.opacity = '1';
    }, 0);
    this.updateLocation();
  }

  /**
   * Hides this pop-up.
   */
  hide() {
    const parent = this.div.parentNode;
    const popupClone = this.div.cloneNode(true);
    popupClone.setAttribute(
      'class',
      `${popupClone.getAttribute('class')} popupContentClone`,
    );
    parent.appendChild(popupClone);
    // fade the clone out, then remove it from the DOM. Both actions need to be timed.
    setTimeout(() => {
      popupClone.setAttribute(
        'style',
        `${popupClone.getAttribute('style')} opacity: 0;`,
      );
      setTimeout(() => {
        parent.removeChild(popupClone);
      }, 300);
    }, 0);
    this.div.style.opacity = '0';
    this.div.style.display = 'none';
  }

  /**
   * Changes the location of this pop-up to the location calculated by the
   * {@link HTMLPopupSupport#labelModelParameter}.
   * Currently, this implementation does not support rotated pop-ups.
   */
  updateLocation() {
    if (!this.currentItem && !this.labelModelParameter) {
      return;
    }
    const width = this.div.clientWidth;
    const height = this.div.clientHeight;
    const { zoom } = this.graphComponent;

    const dummyLabel = new SimpleLabel(
      this.currentItem,
      '',
      this.labelModelParameter,
    );
    if (this.labelModelParameter.supports(dummyLabel)) {
      dummyLabel.preferredSize = new Size(width / zoom, height / zoom);
      const newLayout = this.labelModelParameter.model.getGeometry(
        dummyLabel,
        this.labelModelParameter,
      );
      this.setLocation(
        newLayout.anchorX,
        newLayout.anchorY - (height + 10) / zoom,
      );
    }
  }

  /**
   * Sets the location of this pop-up to the given world coordinates.
   * @param {number} x The target x-coordinate of the pop-up.
   * @param {number} y The target y-coordinate of the pop-up.
   */
  setLocation(x, y) {
    // Calculate the view coordinates since we have
    // to place the div in the regular HTML coordinate space
    const viewPoint = this.graphComponent.toViewCoordinates(new Point(x, y));
    this.div.style.setProperty(
      'transform',
      `translate(${viewPoint.x}px, ${viewPoint.y}px)`,
    );
  }

  /**
   * Determines if the given item is an IEdge connected to the given node.
   * @param {!IModelItem} item
   * @param {!INode} node
   * @returns {boolean}
   */
  static isEdgeConnectedTo(item, node) {
    return (
      item instanceof IEdge
      && (item.sourcePort.owner === node || item.targetPort.owner === node)
    );
  }
}

export default {
  name: 'DashYGraph',
  props: {
    // переменные полученные от родителя
    idFrom: {
      type: String,
      required: true,
    }, // id элемнета (table, graph-2)
    idDashFrom: {
      type: String,
      required: true,
    }, // id дашборда
    dataRestFrom: {
      type: Array,
      required: true,
    }, // данные полученые после выполнения запроса
    colorFrom: {
      type: Object,
      required: true,
    }, // цветовые переменные
    loading: {
      type: Boolean,
      default: true,
    }, // сообщает что компонент в режиме получения данных
  },
  data() {
    return {
      iconArrowAll: mdiArrowAll,
      mdiMagnifyPlus,
      mdiFitToPageOutline,
      mdiMagnifyMinus,
      isEditor: false,
      nodesSource: null,
      edgesSource: null,
      errorColor: '#D34C00', // цвет ошибки
      colors: [
        '#aefaff',
        '#0ab3ff',
        '#003cff',
        '#7100ff',
        '#c800ff',
        '#ff00dd',
      ],
      startColor: '#C7C7C7', // цвет старт и финиш
      actions: [
        { name: 'click', capture: [] },
        { name: 'mouseover', capture: [] },
      ],
      currentNode: null,
      popupNodeCurrentTab: 0,
    };
  },
  computed: {
    top() {
      // для ряда управляющих иконок
      if (document.body.clientWidth <= 1600) {
        return '50px';
      }
      return '60px';
    },
    parentNodes() {
      if (!this.currentNode || !this.currentNode.id) return [];
      return this.dataRestFrom
        .filter((item) => `${item.relation_id}` === `${this.currentNode.id}`)
        .map((item) => item.node);
    },
    childrenNodes() {
      const node = this.currentNode;
      if (!node || !node.relation_id) return [];
      // eslint-disable-next-line camelcase
      const relation_ids = [];
      this.dataRestFrom
        .filter((item) => `${item.id}` === `${node.id}`)
        .forEach((item) => {
          if (!relation_ids.includes(`${item.relation_id}`)) {
            relation_ids.push(`${item.relation_id}`);
          }
        });

      return this.dataRestFrom
        .filter((item) => relation_ids.includes(`${item.id}`))
        .map((item) => item.node)
        .filter((value, i, self) => self.indexOf(value) === i);
    },
  },
  watch: {
    dataRestFrom(val) {
      setTimeout(() => {
        this.generateNodesEdges(val);
        this.applyGraphBuilder();
        this.colorFont();
        this.colorNodes();
        this.colorEdges();
      }, 100);
    },
    colorFrom() {
      this.colorFont();
    },
  },
  mounted() {
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDashFrom,
      id: this.idFrom,
    });
    this.createGraph();
    if (this.dataRestFrom.length) {
      setTimeout(() => {
        this.generateNodesEdges(this.dataRestFrom);
        this.applyGraphBuilder();
        this.colorFont();
        this.colorNodes();
        this.colorEdges();
        this.fitContent();
      }, 100);
    }
    // this.$graphComponent.fitGraphBounds()
  },
  methods: {
    zoomIn() {
      const { ICommand } = yfile;
      ICommand.INCREASE_ZOOM.execute(null, this.$graphComponent);
    },
    zoomOut() {
      const { ICommand } = yfile;
      ICommand.DECREASE_ZOOM.execute(null, this.$graphComponent);
    },
    fitContent() {
      const { ICommand } = yfile;
      ICommand.FIT_GRAPH_BOUNDS.execute(null, this.$graphComponent);
    },
    changeInputMode() {
      // меняем режим графика
      if (this.isEditor) {
        this.$graphComponent.inputMode = this.initMode();
      } else {
        this.$graphComponent.inputMode = new yfile.GraphViewerInputMode();
      }
      this.isEditor = !this.isEditor;
    },
    colorEdges() {
      const { edges } = this.$graphComponent.graph;
      edges.forEach((edge) => {
        if (edge.tag === '-') {
          this.$graphComponent.graph.setStyle(
            edge,
            this.edgeStyle(this.startColor),
          );
        } else if (edge.tag === '-1') {
          this.$graphComponent.graph.setStyle(
            edge,
            this.edgeStyle(this.errorColor),
          );
        } else {
          this.$graphComponent.graph.setStyle(
            edge,
            this.edgeStyle(this.colors[edge.tag % this.colors.length]),
          );
        }
      });
    },
    edgeStyle(color) {
      if (color === undefined) {
        [color] = this.colors;
      }
      const key = `edgeStyle_${color}`;
      if (!this.edgeStyleList[key]) {
        this.edgeStyleList[key] = new yfile.PolylineEdgeStyle({
          stroke: `6px ${color}`,
          targetArrow: new yfile.Arrow({
            fill: color,
            scale: 5,
            type: 'SHORT',
          }),
        });
      }
      return this.edgeStyleList[key];
    },
    colorNodes() {
      const { nodes } = this.$graphComponent.graph;
      nodes.forEach((node) => {
        if (
          typeof node.tag.node_color === 'string'
          && (node.tag.node_color.toLowerCase() === 'start'
            || node.tag.node_color.toLowerCase() === 'finish')
        ) {
          this.$graphComponent.graph.setStyle(
            node,
            this.nodeStyle(this.startColor),
          );
        } else if (node.tag.node_color === '-1') {
          this.$graphComponent.graph.setStyle(
            node,
            this.nodeStyle(this.errorColor),
          );
        } else {
          this.$graphComponent.graph.setStyle(
            node,
            this.nodeStyle(this.colors[node.tag.node_color - 1]),
          );
        }
      });
    },
    nodeStyle(color) {
      return new yfile.ShapeNodeStyle({
        fill: color,
        shape: 'ELLIPSE',
        stroke: color,
      });
    },
    colorFont() {
      const { nodes } = this.$graphComponent.graph;
      nodes.forEach((node) => {
        // node.labels.elementAt(0) -- label который name
        this.$graphComponent.graph.setStyle(
          node.labels.elementAt(0),
          this.labelStyle(true),
        );
        // node.labels.elementAt(1) -- label который label
        this.$graphComponent.graph.setStyle(
          node.labels.elementAt(1),
          this.labelStyle(false),
        );
      });

      const { edges } = this.$graphComponent.graph;
      edges.forEach((edge) => {
        this.$graphComponent.graph.setStyle(
          edge.labels.elementAt(0),
          this.labelStyle(false, this.colorFrom.backElement),
        );
      });
    },
    labelStyle(isBold, backgroundFill = null) {
      const key = `${isBold ? 'b' : 'r'}_${backgroundFill || 'default'}_${
        this.colorFrom.$main_text
      }`;
      // создаем только отличающиеся стили
      if (!this.labelStyleList[key]) {
        this.labelStyleList[key] = new yfile.DefaultLabelStyle({
          font: isBold ? labelFontBOLD : labelFont,
          textFill: this.colorFrom.$main_text,
          backgroundFill,
        });
      }
      return this.labelStyleList[key];
    },
    initializeDefaultStyles() {
      this.$graphComponent.graph.nodeDefaults.style = this.nodeStyle('#0AB3FF');
      this.$graphComponent.graph.nodeDefaults.size = new yfile.Size(120, 120);

      this.$graphComponent.graph.edgeDefaults.style = this.edgeStyle('#0AB3FF');
      this.$graphComponent.graph.edgeDefaults.labels.style.minimumSize = new yfile.Size(70 * 3, 0);

      const orangeRed = Color.ORANGE_RED;
      const orangeStroke = new Stroke(
        orangeRed.r,
        orangeRed.g,
        orangeRed.b,
        255,
        3,
      );
      // freeze it for slightly improved performance
      orangeStroke.freeze();

      // now decorate the nodes and edges with custom hover highlight styles
      const { decorator } = this.$graphComponent.graph;

      // a similar style for the edges, however cropped by the highlight's insets
      const dummyCroppingArrow = new Arrow({
        type: ArrowType.NONE,
        cropLength: 5,
      });

      const edgeStyle = new PolylineEdgeStyle({
        stroke: orangeStroke, // `6px red`
        targetArrow: dummyCroppingArrow,
        sourceArrow: dummyCroppingArrow,
      });
      const edgeStyleHighlight = new EdgeStyleDecorationInstaller({
        edgeStyle,
        zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES,
      });

      const bezierEdgeStyle = new BezierEdgeStyle({
        stroke: orangeStroke,
        targetArrow: dummyCroppingArrow,
        sourceArrow: dummyCroppingArrow,
      });
      const bezierEdgeStyleHighlight = new EdgeStyleDecorationInstaller({
        edgeStyle: bezierEdgeStyle,
        zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES,
      });

      decorator.edgeDecorator.highlightDecorator
        .setFactory(
          (edge) => (edge.style instanceof BezierEdgeStyle
            ? bezierEdgeStyleHighlight
            : edgeStyleHighlight),
        );
    },
    initializeTooltips() {
      const { inputMode } = this.$graphComponent;
      // Customize the tooltip's behavior to our liking.
      const { mouseHoverInputMode } = inputMode;
      mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15);
      mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500);
      mouseHoverInputMode.duration = TimeSpan.fromSeconds(5);

      // Register a listener for when a tooltip should be shown.
      inputMode.addQueryItemToolTipListener((src, eventArgs) => {
        if (eventArgs.handled) {
          // Tooltip content has already been assigned -> nothing to do.
          return;
        }

        // Use a rich HTML element as tooltip content.
        // Alternatively, a plain string would do as well.
        eventArgs.toolTip = this.createTooltipContent(eventArgs.item);

        // Indicate that the tooltip content has been set.
        eventArgs.handled = true;
      });
    },
    createTooltipContent(item) {
      if (!IEdge.isInstance(item)) {
        // not IPort, ILabel, INode
        return null;
      }
      // build the tooltip container
      const tooltip = document.createElement('div');

      let labelFrom = '';
      let labelTo = '';
      if (item.sourceNode.labels.size > 0) {
        labelFrom = item.sourceNode.labels.last().text;
      }
      if (item.targetNode.labels.size > 0) {
        labelTo = item.targetNode.labels.last().text;
      }

      if (!!labelFrom || !!labelTo) {
        const title = document.createElement('h4');
        title.innerHTML = `${labelFrom} -> ${labelTo}`;
        tooltip.appendChild(title);
      }

      // extract the first label from the item
      let label = '';
      if (item.labels.size > 0) {
        label = item.labels.first().text;
      }
      const text = document.createElement('p');
      text.innerHTML = label;
      tooltip.appendChild(text);

      return tooltip;
    },
    applyGraphBuilder() {
      this.$graphComponent.graph.clear();

      const graphBuilder = new yfile.GraphBuilder(this.$graphComponent.graph);

      this.$nodesSource = graphBuilder.createNodesSource({
        data: this.nodesSource, // .slice(0,10),
        id: 'id',
        tag: (item) => item
        ,
      });

      // label name для nodes
      const nodeNameCreator = this.$nodesSource.nodeCreator.createLabelBinding(
        (nodeDataItem) => nodeDataItem.node,
      );
      nodeNameCreator.defaults.layoutParameter = yfile.ExteriorLabelModel.NORTH_EAST;

      // label label для nodes

      /*
      * TODO: У нода нет параметра лейбл, так что  свойство всегда ture,
      *   а данная строка всегда возвращает undefined
      */

      const nodeLabelCreator = this.$nodesSource.nodeCreator.createLabelBinding(
        (nodeDataItem) => nodeDataItem.label,
      );

      nodeLabelCreator.defaults.layoutParameter = yfile.ExteriorLabelModel.EAST;

      // генерация edges
      this.$edgesSource = graphBuilder.createEdgesSource({
        data: this.edgesSource, // .slice(0,10),
        sourceId: 'fromNode',
        targetId: 'toNode',
        tag: (item) => item.color,
      });

      this.$edgesSource.edgeCreator.createLabelBinding((edgeDataItem) => {
        if (edgeDataItem.label !== '-') {
          return edgeDataItem.label;
        }
        return '';
      });

      this.$graphComponent.graph = graphBuilder.buildGraph();
      // отступы для нод
      const layoutData = new yfile.HierarchicLayoutData({
        nodeHalos: yfile.NodeHalo.create(50, 300, 50, 300),
      });
      // настройки для layout
      const layout = new yfile.HierarchicLayout({
        integratedEdgeLabeling: true,
        separateLayers: false,
        considerNodeLabels: true,
      });
      layout.nodeToNodeDistance = 201;

      // применяем layout
      this.$graphComponent.graph.applyLayout(
        layout,
        layoutData,
        true,
        true,
        false,
        true,
        true,
        true,
      );
      this.$graphComponent.fitGraphBounds();
    },
    createTockens(result) {
      const captures = Object.keys(result[0]);
      this.actions.forEach((item, i) => {
        this.$set(this.actions[i], 'capture', captures);
      });
      this.$store.commit('setActions', {
        actions: JSON.parse(JSON.stringify(this.actions)),
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
    },
    getEvents({ event, partelement }) {
      let result = [];
      if (!this.$store.state[this.idDash].events) {
        this.$store.commit('setState', [{
          object: this.$store.state[this.idDash],
          prop: 'events',
          value: [],
        }]);
        return [];
      }
      if (partelement) {
        result = this.$store.state[this.idDash].events.filter((item) => (
          item.event === event
          && item.element === this.id
          && item.partelement === partelement
        ));
      } else {
        result = this.$store.state[this.idDash].events.filter(
          (item) => item.event === event
            && item.target === this.id,
        );
      }
      return result;
    },
    initMode() {
      const mode = new yfile.GraphEditorInputMode({
        allowGroupingOperations: false,
        allowAddLabel: false,
        allowCreateNode: false,
        allowCreateEdge: false,
      });
      mode.addItemClickedListener((sender, args) => {
        if (args.item instanceof yfile.INode) {
          const tokens = this.$store.state[this.idDashFrom].tockens;
          tokens.forEach((token) => {
            if (token.elem === this.idFrom && token.action === 'click') {
              const value = args.item.tag[token.capture];
              this.$store.commit('setTocken', {
                tocken: token,
                idDash: this.idDashFrom,
                store: this.$store,
                value,
              });
            }
          });

          const events = this.getEvents({
            event: 'onclick',
          });

          if (events.length !== 0) {
            events.forEach((item) => {
              if (item.action === 'set') {
                this.$store.commit('letEventSet', {
                  events,
                  idDash: this.idDashFrom,
                });
              } else if (item.action === 'go') {
                this.$store.dispatch('letEventGo', {
                  event: item,
                  idDash: this.idDashFrom,
                  route: this.$router,
                  store: this.$store,
                });
              }
            });
          }
        }
      });

      mode.itemHoverInputMode.enabled = true;
      mode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE || GraphItemTypes.NODE;
      mode.itemHoverInputMode.discardInvalidItems = false;
      mode.itemHoverInputMode.addHoveredItemChangedListener((sender, e) => {
        const manager = this.$graphComponent.highlightIndicatorManager;
        // first remove previous highlights
        manager.clearHighlights();

        if (e.item) {
          const newItem = e.item;

          manager.addHighlight(newItem);
          if (newItem instanceof INode) {
            // and if it's a node, we highlight all adjacent edges, too
            this.$graphComponent.graph.edgesAt(newItem).forEach((edge) => {
              manager.addHighlight(edge);
            });
          } else if (newItem instanceof IEdge) {
            // if it's an edge - we highlight the adjacent nodes
            manager.addHighlight(newItem.sourceNode);
            manager.addHighlight(newItem.targetNode);
          }
        }
      });
      // On clicks on empty space, set currentItem to <code>null</code> to hide the pop-ups
      mode.addCanvasClickedListener(() => {
        this.$graphComponent.currentItem = null;
      });
      return mode;
    },
    createGraph() {
      this.labelStyleList = {}; // варианты labelStyle
      this.edgeStyleList = {};
      this.$graphComponent = new yfile.GraphComponent(this.$refs.graph);
      this.$graphComponent.inputMode = this.initMode();

      this.initializeDefaultStyles();
      this.initializeTooltips();
      this.initializePopups();
    },
    initializePopups() {
      // Creates a label model parameter that is used to position the node pop-up
      const nodeLabelModel = new ExteriorLabelModel({ insets: 10 });

      // Creates the pop-up for the node pop-up template
      const nodePopup = new HTMLPopupSupport(
        this.$graphComponent,
        this.$refs.nodePopupContent,
        nodeLabelModel.createParameter(ExteriorLabelModelPosition.NORTH),
      );

      // Creates the edge pop-up for the edge pop-up template with a suitable label model parameter
      // We use the EdgePathLabelModel for the edge pop-up
      const edgeLabelModel = new EdgePathLabelModel({ autoRotation: false });

      // Creates the pop-up for the edge pop-up template
      const edgePopup = new HTMLPopupSupport(
        this.$graphComponent,
        this.$refs.edgePopupContent,
        edgeLabelModel.createDefaultParameter(),
      );

      // The following works with both GraphEditorInputMode and GraphViewerInputMode
      const { inputMode } = this.$graphComponent;

      // The pop-up is shown for the currentItem thus nodes and edges should be focusable
      inputMode.focusableItems = GraphItemTypes.NODE || GraphItemTypes.EDGE;

      // Register a listener that shows the pop-up for the currentItem
      this.$graphComponent.addCurrentItemChangedListener(() => {
        const item = this.$graphComponent.currentItem;
        if (item instanceof INode) {
          this.currentNode = item.tag;
          // update data in node pop-up
          this.updateNodePopupContent(nodePopup, item);
          // open node pop-up and hide edge pop-up
          nodePopup.currentItem = item;
          edgePopup.currentItem = null;
        } else if (item instanceof IEdge) {
          // update data in edge pop-up
          this.updateEdgePopupContent(edgePopup, item);
          // open edge pop-up and node edge pop-up
          edgePopup.currentItem = item;
          nodePopup.currentItem = null;
        } else {
          nodePopup.currentItem = null;
          edgePopup.currentItem = null;
        }
      });

      // On press of the ESCAPE key, set currentItem to <code>null</code> to hide the pop-ups
      inputMode.keyboardInputMode.addKeyBinding(
        Key.ESCAPE,
        ModifierKeys.NONE,
        (command, parameter, source) => {
          this.currentNode = null;
          source.currentItem = null;
          return true;
        },
      );
    },
    updateEdgePopupContent(edgePopup, edge) {
      // get business data from node tags
      const target = {
        sourceName: edge.sourcePort.owner.tag,
        targetName: edge.targetPort.owner.tag,
      };

      // get all divs in the pop-up
      const divs = edgePopup.div.getElementsByTagName('div');
      for (let i = 0; i < divs.length; i += 1) {
        const div = divs.item(i);
        if (div.hasAttribute('data-id')) {
          // if div has a 'data-id' attribute, get content from the business data
          const id = div.getAttribute('data-id');
          const data = target[id];
          if (data) {
            const label = data.node || data.label;
            div.textContent = `Node: ${label}`;
          }
        }
      }
    },
    updateNodePopupContent(nodePopup, node) {
      // get business data from node tag
      const data = node.tag;

      // get all divs in the pop-up
      const divs = nodePopup.div.getElementsByTagName('div');
      for (let i = 0; i < divs.length; i += 1) {
        const div = divs.item(i);
        if (div.hasAttribute('data-id')) {
          // if div has a 'data-id' attribute, get content from the business data
          const id = div.getAttribute('data-id') || 'label';
          div.textContent = data[id];
        }
      }
    },
    generateNodesEdges(dataRest) {
      // eslint-disable-next-line no-underscore-dangle
      const _allNodes = [];
      // eslint-disable-next-line no-underscore-dangle
      const _allEdges = [];

      dataRest.forEach((dataRestItem) => {
        if (dataRestItem.relation_id) {
          _allEdges.push({
            fromNode: dataRestItem.id,
            toNode: dataRestItem.relation_id,
            label: dataRestItem.edge_description,
            color: dataRestItem.edge_color,
          });
        }
        _allNodes.push(dataRestItem);
      });
      // eslint-disable-next-line no-underscore-dangle
      const _nodesSource = Object.values(
        _allNodes.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}),
      );

      this.createTockens(_nodesSource);

      this.nodesSource = _nodesSource;
      this.edgesSource = _allEdges;
    },
  },
};
</script>

<style lang="css">
.ygraph-wrapper .button-block {
  position: absolute;
  top: 50px;
}
.ygraph-component-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>

<style lang="scss">
.popupContainer {
  position: relative;
  width: 300%;
  min-width: 600px;
}
.popupContent {
  position: absolute;
  display: none;
  border: 2px solid lightgray;
  border-radius: 5px;
  padding: 5px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.85);
  color: black;
  opacity: 0; /* will be faded in */
  transition: opacity 0.2s ease-in;
  text-align: left;
  &.popupContentClone {
    transition: opacity 0.2s ease-out;
  }

  &Title {
    font-size: 1.2rem;
    text-align: center;
  }

  &Tabs {
    padding: 4px;
    &Header {
      display: flex;
      width: 100%;
      margin-bottom: 8px;

      > div {
        display: flex;
        flex: 1;
        padding: 8px;
        cursor: pointer;
        border-bottom: 1px solid transparent;
        opacity: 0.6;
        &.active {
          border-bottom-color: black;
          opacity: 1;
        }
      }
    }

    > div {
      display: none;
      min-width: 200px;
      &.active {
        display: block;
      }
    }
  }
}
</style>
