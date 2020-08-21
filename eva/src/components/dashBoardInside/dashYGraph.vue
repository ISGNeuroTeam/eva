<template>
  <div class="ygraph-wrapper">
    <div class="ygraph-component-container" ref="graph"/>
  </div>
</template>


<script>
import * as yfile from 'yfiles'
import licenseData from './license.json'

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
      nodesSource : null,
      edgesSource: null,
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
  computed: {  // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    id: function() { 
      return this.idFrom
    },
    idDash: function() { 
      return this.idDashFrom
    },
  },
  watch: {
    dataRestFrom(val) {
      this.generateNodesSource(val)
      this.generateEdgesSource(val)
      this.applyGraphBuilder()
    },
    colorFrom(){
      this.applyGraphBuilder()
    }
  },  
  methods: {
    initializeDefaultStyles(){    
      this.$graphComponent.graph.nodeDefaults.style = new yfile.ShapeNodeStyle({
        fill: 'orange',
        stroke: 'orange',
        shape: 'ELLIPSE',
      })

      this.$graphComponent.graph.edgeDefaults.style = new yfile.PolylineEdgeStyle({
        stroke: '1px #242265',
        targetArrow: new yfile.Arrow({
          fill: '#242265',
          scale: 1,
          type: 'circle'
        })
      })
    },

    applyGraphBuilder() {
      this.$graphComponent.graph.clear()

      const graphBuilder = new yfile.GraphBuilder(this.$graphComponent.graph)
     
      this.$nodesSource = graphBuilder.createNodesSource({
        data: this.nodesSource,
        id: 'id',
        tag: item => item.name,
      })
      
      //label name для nodes
      const nodeNameCreator = this.$nodesSource.nodeCreator.createLabelBinding(nodeDataItem =>nodeDataItem.name)
      nodeNameCreator.defaults.style = new yfile.DefaultLabelStyle({
        textSize: 12,
      })
      nodeNameCreator.defaults.layoutParameter = yfile.ExteriorLabelModel.NORTH_EAST
      //label label для nodes
      const nodeLabelCreator = this.$nodesSource.nodeCreator.createLabelBinding(nodeDataItem =>{
         if( nodeDataItem.label !== "-"){
           return nodeDataItem.label
         }
      })
      nodeLabelCreator.defaults.style = new yfile.DefaultLabelStyle({
        textSize: 12
      })
      nodeLabelCreator.defaults.layoutParameter = yfile.ExteriorLabelModel.EAST

      //генерация edges
      this.$edgesSource = graphBuilder.createEdgesSource({
        data: this.edgesSource,
        sourceId: 'fromNode',
        targetId: 'toNode',
      })

      const edgeLabelCreator = this.$edgesSource.edgeCreator.createLabelBinding(edgeDataItem =>{
       if( edgeDataItem.label !== "-"){
           return edgeDataItem.label
         }
      })
      edgeLabelCreator.defaults.style = new yfile.DefaultLabelStyle({
        textSize: 12,
        backgroundFill: this.colorFrom.backElement,
      })
    

      this.$graphComponent.graph = graphBuilder.buildGraph()
      //отступы для нод
      const layoutData = new yfile.HierarchicLayoutData({
        nodeHalos: yfile.NodeHalo.create(15, 100, 15, 320)
      })

      //применяем layout
      this.$graphComponent.graph.applyLayout(new yfile.HierarchicLayout(), layoutData)
      this.$graphComponent.fitGraphBounds()
    },

    creareGraph() {
      this.$graphComponent = new yfile.GraphComponent(this.$refs.graph)
      this.initializeDefaultStyles()

      //убираем надпись о license
      document.querySelector('.yfiles-svgpanel').children[1].style.opacity = 0
      document.querySelector('.yfiles-svgpanel').children[2].style.opacity = 0
    },
    generateNodesSource(dataRest){
      let _allNodes = []

      dataRest.forEach(dataRestItem => {
        _allNodes.push({
          id:dataRestItem.id,
          name:dataRestItem.node,
          label:dataRestItem.node_description
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
            label:dataRestItem.edge_description
          })
        }
      });

      this.edgesSource = _allEdges
    }
  },
  mounted() {
    this.$store.commit('setActions', {actions: this.actions, idDash: this.idDash, id: this.id });
    this.creareGraph();
  } 
}


</script>

<style lang="css" > 
.ygraph-component-container {
  position: absolute;
  top: 25px;
  left: 0;
  right: 0;
  bottom: 0;
}

   
</style>