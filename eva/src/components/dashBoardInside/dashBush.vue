<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      id="bush-wrapper"
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
    >
      <div
        v-if="jsonError"
        class="error-message"
        :style="`height: ${heightPanel};`"
      >
        Ошибка формата входных данных
      </div>
      <div v-else>
        <div
          v-if="dragRes"
          class="buttons-wrapper"
        >
          <v-icon :color="'white'">
            {{ icon.close }}
          </v-icon>
        </div>
        <div
          v-else
          class="buttons-wrapper"
        >
          <v-icon
            v-if="isViewMode"
            :color="'white'"
            @click="clickViewMode"
          >
            {{ icon.move }}
          </v-icon>
          <v-icon
            v-else
            :color="'white'"
            @click="clickEditorMode"
          >
            {{ icon.pencil }}
          </v-icon>
        </div>
        <div
          ref="graph"
          :key="idFrom"
          class="bush-ygraph-container"
          :style="{ top: `${top}` }"
        />
      </div>
    </div>
  </portal>
</template>

<script>
import * as yfile from 'yfiles';
import { mdiClose, mdiCursorMove, mdiPencil } from '@mdi/js';
import licenseData from '../../license/license.json';

import BushClass from '../../js/classes/BushClass';

yfile.License.value = licenseData; // проверка лицензии

export default {
  name: 'DashBush',
  inheritAttrs: false,
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
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    sizeFrom: {
      type: Object,
      required: true,
    }, // выоста\ширина родительского компонента
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      nodesSource: null, // ноды
      edgesSource: null, // связи
      maxElementWidth: 0, // макс ширина элемента
      maxEdgeWidth: 0, // макс размер узла
      jsonError: false,
      isViewMode: true,
      elementConfig: null, // библиотека
      icon: {
        close: mdiClose,
        move: mdiCursorMove,
        pencil: mdiPencil,
      },
    };
  },
  computed: {
    top() {
      // для ряда управляющих иконок
      return document.body.clientWidth <= 1600 ? '50px' : '60px';
    },
    widthPanel() {
      return `${this.sizeFrom.width / 10}px`;
    },
    heightPanel() {
      return `${this.sizeFrom.height}px`;
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom];
    },
    getDragRes() {
      return this.dashFromStore.dragRes;
    },
    dragRes() {
      const dragRes = this.getDragRes;
      return dragRes === 'true';
    },
  },
  watch: {
    dragRes(val) {
      this.graph.toggleInputMode(val);
    },
    dataRestFrom() {
      if (this.dataRestFrom.length > 0 && this.graph) {
        this.graph.drawGraph(this.dataRestFrom);
      }
    },
    async fullScreenMode() {
      await this.$nextTick(async () => {
        await this.createGraph();
        if (this.dataRestFrom.length > 0 && this.graph) {
          this.graph.drawGraph(this.dataRestFrom);
        }
      });
    },
  },
  mounted() {
    this.createGraph();
    this.$nextTick(() => {
      if (this.dataRestFrom.length > 0 && this.graph) {
        this.graph.drawGraph(this.dataRestFrom);
      }
    });
  },
  methods: {
    clickViewMode() {
      this.isViewMode = this.graph.toggleViewMode(this.isViewMode);
    },
    clickEditorMode() {
      this.isViewMode = this.graph.toggleViewMode(this.isViewMode);
    },
    createGraph() {
      this.$nextTick(() => {
        const bush = new BushClass({
          HTMLElement: this.$refs.graph,
        });
        this.graph = bush;
      });
    },
  },
};
</script>

<style scoped>
.bush-ygraph-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 50px;
}
.buttons-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.error-message {
  display: flex;
  justify-content: center;
  flex-direction: column;
  font-size: 25px;
}
</style>
