<template>
  <div class="ygraph-wrapper">
     <v-row align="start">
       <v-icon @click="changeInputMode" :color="isEditor ? colorFrom.controlsActive : colorFrom.controls">{{iconArrowAll}}</v-icon>
     </v-row>
     <div class="ygraph-component-container" :style="{top:`${top}`}" ref="graph"/>
  </div>
</template>


<script>
import * as yfile from 'yfiles'
import licenseData from './license.json'
import { mdiArrowAll } from '@mdi/js'
yfile.License.value = licenseData//проверка лицензии

export default {
  name: "dashYGraph",
  props: {  // переменные полученные от родителя
    idFrom: null,  // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда 
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null,  // цветовые переменные
    shouldFrom: null, // меняется в момент выбора источника данных у дашборда
    dataLoadingFrom: null,  // сообщает что компонент в режиме получения данных
    widthFrom: null, // ширина родительского компонента
    heightFrom: null, // выоста родительского компонента
  },
  data () {
    return {
      iconArrowAll: mdiArrowAll,
      isEditor: false,
      nodesSource : null,
      edgesSource: null,
      errorColor: '#D34C00',//цвет ошибки
      colors: ['#AEFAFF', '#0AB3FF', '#003CFF', '#7100FF'],
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
    top () {// для ряда управляющих иконок 
      if(document.body.clientWidth <=1600){
        return '50px'
      } else {
        return '60px'
      }
    },
  },
  watch: {
    dataRestFrom(val) {
      this.generateNodesSource(val)
      this.generateEdgesSource(val)
      this.applyGraphBuilder()
      this.colorFont()
      this.colorNodes()
      this.colorEdges()
    },
    colorFrom(){
      this.colorFont()
    }
  },  
  methods: {
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
          this.$graphComponent.graph.setStyle(edge,new yfile.PolylineEdgeStyle({
            stroke: `6px ${this.startColor}`,
            targetArrow: new yfile.Arrow({
              fill: this.startColor,
              scale: 5,
              type: 'SHORT'
            })
          })
          )
        } else if (edge.tag === '-1') {
            this.$graphComponent.graph.setStyle(edge,new yfile.PolylineEdgeStyle({
              stroke: `6px ${this.errorColor}`,
              targetArrow: new yfile.Arrow({
                fill: this.errorColor,
                scale: 5,
                type: 'SHORT'
              })
            })
            )
        } else {
            this.$graphComponent.graph.setStyle(edge,new yfile.PolylineEdgeStyle({
              stroke: `6px ${this.colors[edge.tag-1]}`,
              targetArrow: new yfile.Arrow({
               fill: this.colors[edge.tag-1],
                scale: 5,
                type: 'SHORT'
              })
            })
          )
        }
      })
    },

    colorNodes(){
      const nodes = this.$graphComponent.graph.nodes
      nodes.forEach(node=>{
         if(node.tag.toLowerCase() === 'start' || node.tag.toLowerCase() === 'finish'){
           this.$graphComponent.graph.setStyle(node, new  yfile.ShapeNodeStyle({
            fill: this.startColor,
            shape: 'ELLIPSE',
            stroke: this.startColor,
            })
           )
         }
         else if(node.tag === '-1'){
            this.$graphComponent.graph.setStyle(node, new  yfile.ShapeNodeStyle({
              fill: this.errorColor,
              shape: 'ELLIPSE',
              stroke: this.errorColor,
              })
            )
         } else {
            this.$graphComponent.graph.setStyle(node, new  yfile.ShapeNodeStyle({
              fill: this.colors[node.tag-1],
              shape: 'ELLIPSE',
              stroke: this.colors[node.tag-1],
              })
            )
           
         }
       })
    },

    colorFont(){
      const nodes = this.$graphComponent.graph.nodes
      nodes.forEach(node=>{
        //node.labels.elementAt(0) -- label который name
        this.$graphComponent.graph.setStyle(node.labels.elementAt(0), new yfile.DefaultLabelStyle({
          font: new yfile.Font({fontSize: 60, fontFamily: 'sefif', fontWeight: 'BOLD'}),
          textFill: this.colorFrom.text
          }) 
        )
        //node.labels.elementAt(1) -- label который label
        this.$graphComponent.graph.setStyle(node.labels.elementAt(1), new yfile.DefaultLabelStyle({
          font: new yfile.Font({fontSize: 60, fontFamily: 'sefif'}),
          textFill: this.colorFrom.text
          }) 
        )
      })

      const edges = this.$graphComponent.graph.edges
      edges.forEach(edge=>{
        this.$graphComponent.graph.setStyle(edge.labels.elementAt(0), new yfile.DefaultLabelStyle({
          font: new yfile.Font({fontSize: 60, fontFamily: 'sefif'}),
          backgroundFill: this.colorFrom.backElement,
          textFill: this.colorFrom.text
          }) 
        )
      })
    },

    initializeDefaultStyles(){    
      this.$graphComponent.graph.nodeDefaults.style = new yfile.ShapeNodeStyle({
        fill: 'orange',
        stroke: 'orange',
        shape: 'ELLIPSE',
      })

      this.$graphComponent.graph.nodeDefaults.size = new yfile.Size(120, 120)

      this.$graphComponent.graph.edgeDefaults.style = new yfile.PolylineEdgeStyle({
        stroke: '6px #0AB3FF',
        targetArrow: new yfile.Arrow({
          fill: '#0AB3FF',
          scale: 5,
          type: 'SHORT'
        })
      })
    },

    applyGraphBuilder() {
      this.$graphComponent.graph.clear()

      const graphBuilder = new yfile.GraphBuilder(this.$graphComponent.graph)
     
      this.$nodesSource = graphBuilder.createNodesSource({
        data: this.nodesSource,
        id: 'id',
        tag: item => {
          return item.name.toLowerCase()==='start'|| item.name.toLowerCase()==='finish' ?
          item.name :
          item.color
        }
      })
      
      //label name для nodes
      const nodeNameCreator = this.$nodesSource.nodeCreator.createLabelBinding(nodeDataItem =>nodeDataItem.name)
      nodeNameCreator.defaults.layoutParameter = yfile.ExteriorLabelModel.NORTH_EAST

      //label label для nodes
      const nodeLabelCreator = this.$nodesSource.nodeCreator.createLabelBinding(nodeDataItem =>{
         if( nodeDataItem.label !== "-"){
           return nodeDataItem.label
         }
      })
      nodeLabelCreator.defaults.layoutParameter = yfile.ExteriorLabelModel.EAST

      //генерация edges
      this.$edgesSource = graphBuilder.createEdgesSource({
        data: this.edgesSource,
        sourceId: 'fromNode',
        targetId: 'toNode',
        tag: item => item.color
      })

      const edgeLabelCreator = this.$edgesSource.edgeCreator.createLabelBinding(edgeDataItem =>{
       if( edgeDataItem.label !== "-"){
           return edgeDataItem.label
         }
      })    

      this.$graphComponent.graph = graphBuilder.buildGraph()
      //отступы для нод
      const layoutData = new yfile.HierarchicLayoutData({
        nodeHalos: yfile.NodeHalo.create(50, 300, 50, 550)
      })

      //применяем layout
      this.$graphComponent.graph.applyLayout(new yfile.HierarchicLayout(), layoutData)
      this.$graphComponent.fitGraphBounds()
    },

    createGraph() {
      this.$graphComponent = new yfile.GraphComponent(this.$refs.graph)
      this.$graphComponent.inputMode = null

      this.initializeDefaultStyles()

      //убираем надпись о license
      document.querySelectorAll('.yfiles-svgpanel').forEach(item=>{
        item.children[1].style.opacity = 0
        item.children[2].style.opacity = 0
      })
    },

    generateNodesSource(dataRest){
      let _allNodes = []

      dataRest.forEach(dataRestItem => {
        _allNodes.push({
          id:dataRestItem.id,
          name:dataRestItem.node,
          label:dataRestItem.node_description,
          color:dataRestItem.node_color
        })
      });

      let _nodesSource = {}
      _allNodes.map((item)=> _nodesSource[item.id] = item)

      this.nodesSource = Object.values(_nodesSource)
    },

    generateEdgesSource(dataRest){
      let _allEdges = []

      dataRest.forEach(dataRestItem => {
        if(dataRestItem.relation_id){
          _allEdges.push({
            fromNode:dataRestItem.id,
            toNode:dataRestItem.relation_id,
            label:dataRestItem.edge_description,
            color:dataRestItem.edge_color
          })
        }
      });

      this.edgesSource = _allEdges
    }
  },
  mounted() {
    this.$store.commit('setActions', {actions: this.actions, idDash: this.idDashFrom, id: this.idFrom });
    this.createGraph();

  } 
}


</script>

<style lang="css" > 
.ygraph-component-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}

   
</style>