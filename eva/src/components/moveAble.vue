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
    :style="{ zIndex: props.zIndex, outlineColor: theme.$accent_ui_color, backgroundColor: theme.$accent_ui_color, }"
    @resizestop="sendSize"
    @dragstop="sendMove"
  >
    <dash-board
      :data-mode-from="dataModeFrom"
      :width="width"
      :height="height"
      :id-dash-from="idDash"
      :data-page-from="dataPageFrom"
      :data-elem-from="id"
      :loading="loading"
      :searchData="searchData"
      :dataSourseTitle="dataSourseTitle"
      @SetLevel="props.zIndex = $event"
      @SetOpacity="changeOpacity($event)"
      @downloadData="$emit('downloadData', $event)"
      @SetRange="setRange($event)"
    />
  </vue-draggable-resizable>
</template>

<script>
export default {
  props: {
    dataModeFrom: null,
    idDashFrom: null,
    dataElem: null,
    dataPageFrom: null,
    verticalCell: null,
    horizontalCell: null,
    loading: {
      type: Boolean,
      default: false,
    },
    searchData: Array,
    dataSourseTitle: null,
  },
  data() {
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
        grid: [60, 60],
      },
    }
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme
    },
    id() {
      return this.dataElem
    },
    idDash() {
      return this.idDashFrom
    },
    dataMod() {
      return this.dataModeFrom
    },
    dragRes() {
      let dragRes = this.$store.getters.getDragResize(this.idDash)
      dragRes === 'true' ? (dragRes = true) : (dragRes = false)
      return dragRes
    },
    headerTop() {
      if (document.body.clientWidth <= 1400) {
        return 40
      } else {
        return 50
      }
    },
  },
  watch: {
    top(val) {
      if (val <= this.headerTop) val = this.headerTop
    },
    left() {
      let clientWidth = document.querySelector('#app').clientWidth
      if (this.left < 0) this.left = 0
      if (this.left + this.width > clientWidth) {
        this.left = clientWidth - this.width
      }
    },
    verticalCell() {
      this.reload++
      this.createGrid()
      this.drawElement()
    },
    horizontalCell() {
      this.reload++
      this.createGrid()
      this.drawElement()
    },
  },
  created() {
    this.createGrid()
    this.drawElement()
  },
  methods: {
    drawElement() {
      let pos = this.$store.getters.getPosDash({ idDash: this.idDash, id: this.id })

      this.left = pos.left * this.verticalCell
      this.top = pos.top * this.horizontalCell + this.headerTop

      let size = this.$store.getters.getSizeDash({ idDash: this.idDash, id: this.id })

      let width = size.width * this.verticalCell
      let height = size.height * this.horizontalCell

      this.width = width
      this.height = height
    },
    sendMove(x, y) {
      let top = Math.round((y - this.headerTop) / this.horizontalCell)
      if (top < 0) top = 0

      let left = Math.round(x / this.verticalCell)
      if (left < 0) left = 0
      this.$store.commit('setPosDash', { top: top, left: left, id: this.id, idDash: this.idDash })
    },
    sendSize(x, y, width, height) {
      let top = Math.round((y - this.headerTop) / this.horizontalCell)
      let left = Math.round(x / this.verticalCell)
      this.$store.commit('setPosDash', { top: top, left: left, id: this.id, idDash: this.idDash })

      let newWidth = Math.round(width / this.verticalCell)
      let newHeight = Math.round(height / this.horizontalCell)
      this.height = height
      this.width = width
      this.$store.commit('setSizeDash', {
        width: newWidth,
        height: newHeight,
        id: this.id,
        idDash: this.idDash,
      })
    },
    changeOpacity(event) {
      this.opacity = event
    },
    createGrid() {
      this.props.grid = [this.verticalCell, this.horizontalCell]
    },
    setRange (range) {
      this.$emit("SetRange", range);
    },
  }
}
</script>

<style >
.vdr {
  touch-action: none;
  position: absolute;
  box-sizing: border-box;
  outline: none;
  border-radius: 4px;
  transition: transform ease 0.3s;
}
.vdr.active.resizable {
  outline-color: inherit;
  outline: 2px dashed;
  z-index: 9 !important;
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