<template>
  <vue-draggable-resizable 
    ref="dragres"
    :key="reload"
    :w="width" 
    :h="height" 
    :x="left" 
    :y="top" 
    :draggable="dragRes" 
    :resizable="dragRes" 
    :data-grid="true"
    :grid="props.grid"
    :style="{zIndex:props.zIndex, outlineColor: theme.$accent_ui_color, background: theme.$accent_ui_color, opacity:opacity }" 
    @resizestop="sendSize"
    @dragstop="sendMove" 
  >
    <dash-board 
      :dataModeFrom="dataMode" 
      :width="width"  
      :height="height"  
      :idDashFrom="idDash" 
      :dataPageFrom="dataPageFrom" 
      :dataElemFrom="id" 
      @SetLevel="props.zIndex = $event" 
      @SetOpacity="changeOpacity($event)" 
    />
  </vue-draggable-resizable>
</template>

<script>


export default {
  props: {
    dataModeFrom: null,
    idDashFrom: null,
    dataElem: null,
    colorFrom: null,
    dataPageFrom: null,
    verticalCell:null,
    horizontalCell:null
  },
  data () {
    return {
      opacity: 1,
      top: 0,
      left: 0,
      width: 0, // 0 не должен быть, по умолчанию беруться эти настройки
      height: 0,
      reload: 0,
      props: {
        vue_drag: false,
        zIndex: 1,
        step: {},
        grid: [60,60]
      }
    }
  },
  computed: {
    theme: function() {
      return this.$store.getters.getTheme
    },
    id: function() {  // название элемента, полученное от родителя
      return this.dataElem
    },
    idDash: function() {  // id страницы, полученное от родителя
      return this.idDashFrom
    },
    dataMode: function() {
      return this.dataModeFrom
    },
    dragRes: function() {
      let dragRes = this.$store.getters.getDragResize(this.idDash);
      dragRes == 'true' ? dragRes = true : dragRes = false;
      return dragRes;
    },
    headerTop: function (){
      if(document.body.clientWidth <=1400){
        return 40
      } else {
        return 50
      }
    },
  },
  watch: {
    top: function(val) {
       if(val <= this.headerTop){
         val = this.headerTop
       }
    },
    left: function() {
      let clientWidth = document.querySelector('#app').clientWidth;
  
      if (this.left < 0) {
        this.left = 0;
      } 
      if ((this.left+this.width) >  clientWidth) {
        this.left = clientWidth - this.width;
      } 
    },
    verticalCell: function(){
      this.reload ++ 
      this.createGrid()
      this.drawElement()
    },
    horizontalCell: function(){
      this.reload ++ 
      this.createGrid()
      this.drawElement()
    }
  },
  methods: {
    drawElement: function() {
      let pos = this.$store.getters.getPosDash({idDash: this.idDash, id: this.id});

      this.left = pos.left*this.verticalCell;
      this.top = pos.top*this.horizontalCell + this.headerTop;

      let size = this.$store.getters.getSizeDash({idDash: this.idDash, id: this.id});

      let width = size.width*this.verticalCell;
      let height = size.height*this.horizontalCell;

      this.width  = width;
      this.height = height;
    },
    sendMove(x,y) {  // отправляем позицию элемнета в хранилище
      let leftFrom = x;
      let topFrom = y;
      
      let top = Math.round((topFrom - this.headerTop)/this.horizontalCell)
      if (top < 0 ) { 
        top = 0
      }

      let left =  Math.round(leftFrom/this.verticalCell);
      if (left < 0 ) {
        left = 0
      }

      this.$store.commit('setPosDash', {top: top,left: left, id: this.id, idDash: this.idDash});

    },
    sendSize(x,y,width,height) {  // отправляем размер элемента
    //для количества ячеек по высоте  округляем до целого
      let top = Math.round((y - this.headerTop)/this.horizontalCell)
      let left =  Math.round(x/this.verticalCell);
      this.$store.commit('setPosDash', {top: top,left: left, id: this.id, idDash: this.idDash});

      let newWidth =  Math.round(width/this.verticalCell);
      let newHeight = Math.round(height/this.horizontalCell);
      this.$store.commit('setSizeDash', {width: newWidth, height: newHeight, id: this.id, idDash: this.idDash});
      
    },
    changeOpacity(event){
      this.opacity = event;
    },
    createGrid(){
      this.props.grid = [this.verticalCell, this.horizontalCell]
    }

  },
  created() {
    this.createGrid()
    this.drawElement()
  }
}
</script>

<style >


.vdr {
  touch-action: none;
  position: absolute;
  box-sizing: border-box;
  outline: none ;
  border-radius: 4px;
  transition: transform ease 0.3s
}
.vdr.active.resizable{
  outline-color: inherit;
  outline: 2px dashed;
}

.handle {
  box-sizing: border-box;
  position: absolute;
  width: 10px;
  height: 10px;
  background: inherit;
  z-index: 1;
}
.handle-tl {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}
.handle-tm {
  top: -5px;
  left: 50%;
  margin-left: -5px;
  cursor: n-resize;
}
.handle-tr {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}
.handle-ml {
  top: 50%;
  margin-top: -5px;
  left: -5px;
  cursor: w-resize;
}
.handle-mr {
  top: 50%;
  margin-top: -5px;
  right: -5px;
  cursor: e-resize;
}
.handle-bl {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}
.handle-bm {
  bottom: -5px;
  left: 50%;
  margin-left: -5px;
  cursor: s-resize;
}
.handle-br {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}
@media only screen and (max-width: 768px) {
  [class*="handle-"]:before {
    content: '';
    left: -10px;
    right: -10px;
    bottom: -10px;
    top: -10px;
    position: absolute;
  }
}

 
</style>