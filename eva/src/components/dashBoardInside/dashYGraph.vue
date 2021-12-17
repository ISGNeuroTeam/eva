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
              :color="isEditor ? colorFrom.$primary_button : colorFrom.$accent_ui_color"
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
    <div ref="graph" class="ygraph-component-container" :style="{ top: `${top}` }"/>
  </div>
</template>


<script>
import * as yfile from 'yfiles'
import licenseData from './license.json'
import { mdiArrowAll, mdiMagnifyPlus, mdiFitToPageOutline, mdiMagnifyMinus } from '@mdi/js'
import {
  GraphItemTypes,
  INode,
  IEdge,
  NodeStyleDecorationInstaller,
  ShapeNodeStyle,
  ShapeNodeShape,
  Point,
  Stroke,
  Color,
  ArrowType,
  Arrow,
  PolylineEdgeStyle,
  EdgeStyleDecorationInstaller,
  StyleDecorationZoomPolicy,
  BezierEdgeStyle, TimeSpan, IPort, ILabel
} from "yfiles";
yfile.License.value = licenseData//проверка лицензии

const labelFont = new yfile.Font({fontSize: 70, fontFamily: 'sefif'})
const labelFontBOLD = new yfile.Font({fontSize: 70, fontFamily: 'sefif',  fontWeight: 'BOLD'})

export default {
  name: "dashYGraph",
  props: {  // переменные полученные от родителя
    idFrom: null,  // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null,  // цветовые переменные
    loading: {
      type: Boolean,
      default: true,
    },  // сообщает что компонент в режиме получения данных
  },
  data () {
    return {
      iconArrowAll: mdiArrowAll,
      mdiMagnifyPlus,
      mdiFitToPageOutline,
      mdiMagnifyMinus,
      isEditor: false,
      nodesSource : null,
      edgesSource: null,
      errorColor: '#D34C00',//цвет ошибки
      colors: ['#aefaff', '#0ab3ff', '#003cff', '#7100ff', '#c800ff', '#ff00dd'],
      startColor: '#C7C7C7',//цвет старт и финиш
      actions: [
        {name: 'click',
          capture: []
        },
        {name: 'mouseover',
          capture: []
        },
      ],
    }
  },
  computed: {
    top() {// для ряда управляющих иконок
      if (document.body.clientWidth <=1600){
        return '50px'
      } else {
        return '60px'
      }
    },
  },
  watch: {
    dataRestFrom(val) {

      setTimeout(() => {
        this.generateNodesEdges(val)
        this.applyGraphBuilder()
        this.colorFont()
        this.colorNodes()
        this.colorEdges()
      }, 100)
    },
    colorFrom(){
      this.colorFont()
    }
  },
  mounted() {
    this.$store.commit('setActions', {actions: this.actions, idDash: this.idDashFrom, id: this.idFrom });
    this.createGraph()
    if (this.dataRestFrom.length) {
      setTimeout(() => {
        this.generateNodesEdges(this.dataRestFrom)
        this.applyGraphBuilder()
        this.colorFont()
        this.colorNodes()
        this.colorEdges()
        this.fitContent()
      }, 100)
    }
    // this.$graphComponent.fitGraphBounds()
  },
  methods: {
    zoomIn() {
      const { ICommand } = yfile
      ICommand.INCREASE_ZOOM.execute(null, this.$graphComponent)
    },
    zoomOut() {
      const { ICommand } = yfile
      ICommand.DECREASE_ZOOM.execute(null, this.$graphComponent)
    },
    fitContent() {
      const { ICommand } = yfile
      ICommand.FIT_GRAPH_BOUNDS.execute(null, this.$graphComponent)
    },
    changeInputMode(){ // меняем режим графика
      if(this.isEditor){
        
        this.$graphComponent.inputMode = null
      } else {
        this.$graphComponent.inputMode = new yfile.GraphViewerInputMode()
      }
      this.isEditor = !this.isEditor
    },
    colorEdges(){
      const edges = this.$graphComponent.graph.edges
      edges.forEach(edge=>{
        if(edge.tag === '-'){
          this.$graphComponent.graph.setStyle(edge,
            this.edgeStyle(this.startColor)
          )
        } else if (edge.tag === '-1') {
            this.$graphComponent.graph.setStyle(edge,
              this.edgeStyle(this.errorColor)
            )
        } else {
            this.$graphComponent.graph.setStyle(edge,
              this.edgeStyle(this.colors[edge.tag % this.colors.length])
            )
        }
      })
    },
    edgeStyle(color) {
      if (color === undefined) {
        color = this.colors[0]
      }
      const key = `edgeStyle_${color}`
      if (!this.edgeStyleList[key]) {
        this.edgeStyleList[key] = new yfile.PolylineEdgeStyle({
          stroke: `6px ${color}`,
          targetArrow: new yfile.Arrow({
            fill: color,
            scale: 5,
            type: 'SHORT'
          })
        })
      }
      return this.edgeStyleList[key]
    },
    colorNodes(){
      const nodes = this.$graphComponent.graph.nodes
      nodes.forEach(node=>{
         if(typeof node.tag.node_color === 'string' && (node.tag.node_color.toLowerCase() === 'start' || node.tag.node_color.toLowerCase() === 'finish')){
           this.$graphComponent.graph.setStyle(node,
            this.nodeStyle(this.startColor)
           )
         }
         else if(node.tag.node_color === '-1'){
            this.$graphComponent.graph.setStyle(node,
              this.nodeStyle(this.errorColor)
            )
         } else {
            this.$graphComponent.graph.setStyle(node,
              this.nodeStyle(this.colors[node.tag.node_color-1])
            )
         }
       })
    },
    nodeStyle(color) {
      return new yfile.ShapeNodeStyle({
        fill: color,
        shape: 'ELLIPSE',
        stroke: color,
      })
    },
    colorFont(){
      const nodes = this.$graphComponent.graph.nodes
      nodes.forEach(node=> {
        //node.labels.elementAt(0) -- label который name
        this.$graphComponent.graph.setStyle(node.labels.elementAt(0),
          this.labelStyle(true)
        )
        //node.labels.elementAt(1) -- label который label
        this.$graphComponent.graph.setStyle(node.labels.elementAt(1),
          this.labelStyle(false)
        )
      })

      const edges = this.$graphComponent.graph.edges
      edges.forEach(edge=> {
        this.$graphComponent.graph.setStyle(edge.labels.elementAt(0),
          this.labelStyle(false, this.colorFrom.backElement)
        )
      })
    },
    labelStyle(isBold, backgroundFill = null) {
      const key = `${isBold ?'b':'r'}_${backgroundFill||'default'}_${this.colorFrom.$main_text}`
      // создаем только отличающиеся стили
      if (!this.labelStyleList[key]) {
        this.labelStyleList[key] = new yfile.DefaultLabelStyle({
          font: isBold ? labelFontBOLD : labelFont,
          textFill: this.colorFrom.$main_text,
          backgroundFill,
        })
      }
      return this.labelStyleList[key]
    },
    initializeDefaultStyles() {
      this.$graphComponent.graph.nodeDefaults.style = this.nodeStyle('#0AB3FF')
      this.$graphComponent.graph.nodeDefaults.size = new yfile.Size(120, 120)

      this.$graphComponent.graph.edgeDefaults.style = this.edgeStyle('#0AB3FF')
      this.$graphComponent.graph.edgeDefaults.labels.style.minimumSize = new yfile.Size(70*3, 0)

      const orangeRed = Color.ORANGE_RED
      const orangeStroke = new Stroke(orangeRed.r, orangeRed.g, orangeRed.b, 255, 3)
      // freeze it for slightly improved performance
      orangeStroke.freeze()

      // now decorate the nodes and edges with custom hover highlight styles
      const decorator = this.$graphComponent.graph.decorator

      // a similar style for the edges, however cropped by the highlight's insets
      const dummyCroppingArrow = new Arrow({
        type: ArrowType.NONE,
        cropLength: 5
      })

      const edgeStyle = new PolylineEdgeStyle({
        stroke: orangeStroke, // `6px red`
        targetArrow: dummyCroppingArrow,
        sourceArrow: dummyCroppingArrow
      })
      const edgeStyleHighlight = new EdgeStyleDecorationInstaller({
        edgeStyle,
        zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
      })

      const bezierEdgeStyle = new BezierEdgeStyle({
        stroke: orangeStroke,
        targetArrow: dummyCroppingArrow,
        sourceArrow: dummyCroppingArrow
      })
      const bezierEdgeStyleHighlight = new EdgeStyleDecorationInstaller({
        edgeStyle: bezierEdgeStyle,
        zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
      })

      decorator.edgeDecorator.highlightDecorator.setFactory(edge =>
          edge.style instanceof BezierEdgeStyle ? bezierEdgeStyleHighlight : edgeStyleHighlight
      )
    },
    initializeTooltips() {
      const inputMode = this.$graphComponent.inputMode
      // Customize the tooltip's behavior to our liking.
      const mouseHoverInputMode = inputMode.mouseHoverInputMode
      mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
      mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500)
      mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

      // Register a listener for when a tooltip should be shown.
      inputMode.addQueryItemToolTipListener((src, eventArgs) => {
        if (eventArgs.handled) {
          // Tooltip content has already been assigned -> nothing to do.
          return
        }

        // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
        eventArgs.toolTip = this.createTooltipContent(eventArgs.item)

        // Indicate that the tooltip content has been set.
        eventArgs.handled = true
      })
    },
    createTooltipContent(item) {
      if (!IEdge.isInstance(item)) { // not IPort, ILabel, INode
        return null;
      }
      // build the tooltip container
      const tooltip = document.createElement('div')

      let labelFrom = ''
      let labelTo = ''
      if (item.sourceNode.labels.size > 0) {
        labelFrom = item.sourceNode.labels.last().text
      }
      if (item.targetNode.labels.size > 0) {
        labelTo = item.targetNode.labels.last().text
      }

      if (!!labelFrom || !!labelTo) {
        const title = document.createElement('h4')
        title.innerHTML = `${labelFrom} -> ${labelTo}`
        tooltip.appendChild(title)
      }

      // extract the first label from the item
      let label = ''
      if (item.labels.size > 0) {
        label = item.labels.first().text
      }
      const text = document.createElement('p')
      text.innerHTML = label
      tooltip.appendChild(text)

      return tooltip
    },
    applyGraphBuilder() {
      this.$graphComponent.graph.clear()

      const graphBuilder = new yfile.GraphBuilder(this.$graphComponent.graph)

      this.$nodesSource = graphBuilder.createNodesSource({
        data: this.nodesSource,//.slice(0,10),
        id: 'id',
        tag: item => {
          return item
          // return item.name.toLowerCase()==='start'|| item.name.toLowerCase()==='finish' ?
          // item.name :
          // item.color
        }
      })

      //label name для nodes
      const nodeNameCreator = this.$nodesSource.nodeCreator.createLabelBinding(nodeDataItem =>nodeDataItem.name)
      nodeNameCreator.defaults.layoutParameter = yfile.ExteriorLabelModel.NORTH_EAST

      //label label для nodes
      const nodeLabelCreator = this.$nodesSource.nodeCreator.createLabelBinding(nodeDataItem => {
         if( nodeDataItem.label !== "-"){
           return nodeDataItem.label
         }
      })
      nodeLabelCreator.defaults.layoutParameter = yfile.ExteriorLabelModel.EAST

      //генерация edges
      this.$edgesSource = graphBuilder.createEdgesSource({
        data: this.edgesSource,//.slice(0,10),
        sourceId: 'fromNode',
        targetId: 'toNode',
        tag: item => item.color,
      })

      const edgeLabelCreator = this.$edgesSource.edgeCreator.createLabelBinding(edgeDataItem =>{
       if( edgeDataItem.label !== "-"){
           return edgeDataItem.label
         }
      })

      let startedAt = Date.now();
      this.$graphComponent.graph = graphBuilder.buildGraph()
      console.log((Date.now() - startedAt)/1000 + 's. time spent for graphBuilder.buildGraph()' )
      //отступы для нод
      const layoutData = new yfile.HierarchicLayoutData({
        nodeHalos: yfile.NodeHalo.create(50, 300, 50, 300)
      })
      //настройки для layout
      const layout = new yfile.HierarchicLayout({
        integratedEdgeLabeling: true,
        separateLayers: false,
        considerNodeLabels: true,

      })
      layout.nodeToNodeDistance = 201

      startedAt = Date.now();
      //применяем layout
      this.$graphComponent.graph.applyLayout(layout, layoutData, true, true, false, true, true, true)
      console.log((Date.now() - startedAt)/1000 + 's. time spent for graph.applyLayout(...)' )
      this.$graphComponent.fitGraphBounds()
    },
    createTockens: function (result) {
      let captures = Object.keys(result[0]);
      this.actions.forEach((item, i) => {
        this.$set(this.actions[i], "capture", captures);
      });
      this.$store.commit("setActions", {
        actions: JSON.parse(JSON.stringify(this.actions)),
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
    },
    createGraph() {

      this.labelStyleList = {}; // варианты labelStyle
      this.edgeStyleList = {};
      this.$graphComponent = new yfile.GraphComponent(this.$refs.graph)
      const mode = new yfile.GraphEditorInputMode({
        allowGroupingOperations: false,
        allowAddLabel: false,
        allowCreateNode: false,
        allowCreateEdge: false,
      })
        mode.addItemClickedListener((sender, args) => {
          if (args.item instanceof yfile.INode) {
            let tokens = this.$store.getters.getTockens(this.idDashFrom);
            tokens.forEach((token) => {
              if (
                token.elem == this.idFrom &&
                token.action == "click"
              ) {
                let value = args.item.tag[token.capture];
                this.$store.commit("setTocken", {
                  tocken: token,
                  idDash: this.idDashFrom,
                  store: this.$store,
                  value,
                });
              }
            });

            let events = this.$store.getters.getEvents({
              idDash: this.idDashFrom,
              event: "onclick",
              element: this.idFrom,
            });

            if (events.length != 0) {
              events.forEach((item) => {
                if (item.action == "set") {
                  this.$store.commit("letEventSet", {
                    events: events,
                    idDash: this.idDashFrom,
                  });
                } else if (item.action == "go") {
                  this.$store.commit("letEventGo", {
                    event: item,
                    idDash: this.idDashFrom,
                    route: this.$router,
                    store: this.$store,
                  });
                }
              });
            }
          }
        })

      mode.itemHoverInputMode.enabled = true
      mode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE | GraphItemTypes.NODE
      mode.itemHoverInputMode.discardInvalidItems = false
      mode.itemHoverInputMode.addHoveredItemChangedListener((sender, e) => {
        const manager = this.$graphComponent.highlightIndicatorManager
        // first remove previous highlights
        manager.clearHighlights()

        if (e.item) {
          const newItem = e.item

          manager.addHighlight(newItem)
          if (newItem instanceof INode) {
            // and if it's a node, we highlight all adjacent edges, too
            for (const edge of this.$graphComponent.graph.edgesAt(newItem)) {
              manager.addHighlight(edge)
            }
          } else if (newItem instanceof IEdge) {
            // if it's an edge - we highlight the adjacent nodes
            manager.addHighlight(newItem.sourceNode)
            manager.addHighlight(newItem.targetNode)
          }
        }
      })

      this.$graphComponent.inputMode = mode

      this.initializeDefaultStyles()
      this.initializeTooltips()

      //убираем надпись о license
      // document.querySelectorAll('.yfiles-svgpanel').forEach(item=>{
      //   item.children[1].style.opacity = 0
      //   item.children[2].style.opacity = 0
      // })
    },
    generateNodesEdges(dataRest){
      let _allNodes = []
      let _allEdges = []

      dataRest.forEach(dataRestItem => {
        // _allNodes.push({
        //   id:dataRestItem.id,
        //   name:dataRestItem.node,
        //   label:dataRestItem.node_description,
        //   color:dataRestItem.node_color
        // })

        if(dataRestItem.relation_id){
          _allEdges.push({
            fromNode:dataRestItem.id,
            toNode:dataRestItem.relation_id,
            label:dataRestItem.edge_description,
            color:dataRestItem.edge_color
          })
        }

        _allNodes.push(dataRestItem)
      });

      let _nodesSource = Object.values(_allNodes.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}))

      this.createTockens(_nodesSource);

      this.nodesSource = _nodesSource
      this.edgesSource = _allEdges
    },
  }
}


</script>

<style lang="css" >
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