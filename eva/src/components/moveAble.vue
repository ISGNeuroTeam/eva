<template>
  <vue-draggable-resizable
    v-if="isVisible"
    ref="dragres"
    :key="reload"
    :w="width === 0 ? movableProps.grid[0] : width"
    :h="height === 0 ? movableProps.grid[1] : height"
    :x="left"
    :y="top"
    :z="zIndex"
    :draggable="dragRes"
    :drag-cancel="'.v-slider, .no-draggable'"
    :resizable="dragRes"
    :data-grid="true"
    :grid="movableProps.grid"
    :class-name-active="!dataMod && !dragRes || !dragRes ? 'none' : 'active'"
    :style="{
      outlineColor: theme.$accent_ui_color,
    }"
    @resizestop="sendSize"
    @dragstop="sendMove"
    @activated="onActivated"
  >
    <dash-board
      :data-mode-from="dataModeFrom"
      :width="width"
      :height="height"
      :id-dash-from="idDash"
      :data-page-from="dataPageFrom"
      :data-elem-from="id"
      :loading="loading"
      :search-data="searchData"
      :search-schema="searchSchema"
      :data-source-id="dataSourceId"
      :data-sources="dataSources"
      @SetOpacity="changeOpacity($event)"
      @downloadData="$emit('downloadData', $event)"
      @SetRange="setRange($event)"
      @ResetRange="resetRange($event)"
    />
  </vue-draggable-resizable>
</template>

<script>
export default {
  props: {
    dataModeFrom: {
      type: Boolean,
      default: false,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    dataElem: {
      type: String,
      required: true,
    },
    dataPageFrom: {
      type: String,
      required: true,
    },
    verticalCell: {
      type: Number,
      required: true,
    },
    horizontalCell: {
      type: Number,
      required: true,
    },
    zIndex: {
      type: Number,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    searchData: {
      type: Array,
      default: () => ([]),
    },
    dataSourceId: {
      type: [String, Number],
      default: '',
    },
    dataSources: {
      type: Object,
      default: () => ({}),
    },
    searchSchema: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      opacity: 1,
      top: 0,
      left: 0,
      width: 0, // 0 не должен быть, по умолчанию беруться эти настройки
      height: 0,
      reload: 0,
      // panelBackHide: false,
      movableProps: {
        vue_drag: false,
        step: {},
        grid: [60, 60],
      },
      isMounted: false,
    };
  },
  computed: {
    isVisible() {
      if (!this.dashFromStore[this.id].options?.visible) {
        return this.dataMod;
      }
      return true;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    id() {
      return this.dataElem;
    },
    idDash() {
      return this.idDashFrom;
    },
    dataMod() {
      return this.dataModeFrom;
    },
    dashFromStore() {
      return this.$store.state[this.idDash];
    },
    dragRes() {
      const { dragRes } = this.dashFromStore;
      return dragRes && dragRes !== 'false';
    },
    headerTop() {
      if (document.body.clientWidth <= 1400) {
        return 0;
      }
      return 0;
    },
    panelBackHide() {
      return this.dashFromStore[this.dataElem]?.options?.panelBackHide;
    },
  },
  watch: {
    left() {
      const { clientWidth } = this.$root.$el;
      if (this.left < 0) this.left = 0;
      if (this.left + this.width > clientWidth) {
        this.left = clientWidth - this.width;
      }
    },
    verticalCell() {
      this.reload += 1;
      this.createGrid();
      this.drawElement();
    },
    horizontalCell() {
      this.reload += 1;
      this.createGrid();
      this.drawElement();
    },
  },
  created() {
    this.createGrid();
    this.drawElement();
  },
  mounted() {
    this.onActivated();
    this.isMounted = true;
  },
  methods: {
    drawElement() {
      const pos = {
        top: this.$store.state[this.idDash][this.id].top,
        left: this.$store.state[this.idDash][this.id].left,
      };

      this.left = Math.round(pos.left * this.verticalCell);
      this.top = Math.round(pos.top * this.horizontalCell);

      const size = {
        width: this.$store.state[this.idDash][this.id].width,
        height: this.$store.state[this.idDash][this.id].height,
      };

      const width = size.width * this.verticalCell;
      const height = size.height * this.horizontalCell;

      this.width = width;
      this.height = height;
    },
    onActivated() {
      if (this.isMounted) {
        this.$emit('activated');
      }
    },
    sendMove(x, y) {
      let top = Math.round(y / this.horizontalCell);
      if (top < 0) top = 0;

      let left = Math.round(x / this.verticalCell);
      if (left < 0) left = 0;
      this.$store.commit('setPosDash', {
        top,
        left,
        id: this.id,
        idDash: this.idDash,
      });
    },
    sendSize(x, y, width, height) {
      const top = Math.round(y / this.horizontalCell);
      const left = Math.round(x / this.verticalCell);
      this.$store.commit('setPosDash', {
        top,
        left,
        id: this.id,
        idDash: this.idDash,
      });

      if (width && height) {
        const newWidth = Math.round(width / this.verticalCell);
        const newHeight = Math.round(height / this.horizontalCell);
        this.height = height;
        this.width = width;
        this.$store.commit('setSizeDash', {
          width: newWidth,
          height: newHeight,
          id: this.id,
          idDash: this.idDash,
        });
      }
    },
    changeOpacity(event) {
      this.opacity = event;
    },
    createGrid() {
      this.$set(this.movableProps, 'grid', [
        this.verticalCell,
        this.horizontalCell,
      ]);
    },
    setRange(range) {
      this.$emit('SetRange', range);
    },
    resetRange(dataSourseTitle) {
      this.$emit('ResetRange', dataSourseTitle);
    },
  },
};
</script>

<style>
.vdr {
  touch-action: none;
  position: absolute;
  box-sizing: border-box;
  outline: none;
  border-radius: 4px;
  transition: all 0.1s linear;
}
.vdr.active {
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
  [class*='handle-']:before {
    content: '';
    left: -10px;
    right: -10px;
    bottom: -10px;
    top: -10px;
    position: absolute;
  }
}
</style>
