<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
      class="ygraph-wrapper"
    >
      <div class="button-block">
        <div class="d-flex justify-content-between align-center">
          <v-tooltip
            bottom
            :color="colorFrom.$accent_ui_color"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="pa-1"
                :color="
                  isEditor
                    ? colorFrom.$primary_button
                    : colorFrom.$accent_ui_color
                "
                :disabled="loading"
                v-bind="attrs"
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
                class="pa-1"
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
                class="pa-1"
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
                class="pa-1"
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

          <v-tooltip
            bottom
            :color="colorFrom.$accent_ui_color"
          >
            <template v-slot:activator="{ on }">
              <v-icon
                class="pa-1"
                :color="
                  !isVisiblePopup
                    ? colorFrom.$primary_button
                    : colorFrom.$accent_ui_color
                "
                :disabled="loading"
                v-on="on"
                @click="toggleVisiblePopup"
              >
                {{ mdiEyeOffOutline }}
              </v-icon>
            </template>
            <span>Отображать\скрыть подписи</span>
          </v-tooltip>
        </div>
      </div>
      <div
        ref="graph"
        :key="idFrom"
        class="ygraph-component-container"
        :style="{ top: `${top}` }"
      >
        <div class="popupContainer">
          <div
            v-if="isVisiblePopup && popupNodeContent"
            ref="nodePopupContent"
            class="node-popup-content"
            :class="{
              'popupContent--is-active': isPopupNodeShow,
            }"
            :style="popupNodePosition"
            tabindex="0"
          >
            <div class="node-popup-content__header">
              <div class="node-popup-content__title">
                {{ popupNodeContent.node }}
              </div>
              <div
                class="node-popup-content__description"
              >
                {{ popupNodeContent.nodeDescription }}
              </div>

              <div class="node-popup-content__close-btn">
                <v-icon
                  :color="colorFrom.$accent_ui_color"
                  :disabled="loading"
                  size="20px"
                  @click="closePopup"
                >
                  {{ mdiClose }}
                </v-icon>
              </div>
            </div>
            <div class="node-popup-content-tabs">
              <div class="node-popup-content-tabs__header">
                <div
                  class="node-popup-content-tabs__button-item"
                  :class="{
                    'node-popup-content-tabs__button-item--active': popupNodeCurrentTab === 0,
                  }"
                  @click="popupNodeCurrentTab = 0"
                >
                  Parents
                </div>
                <div
                  class="node-popup-content-tabs__button-item"
                  :class="{
                    'node-popup-content-tabs__button-item--active': popupNodeCurrentTab === 1,
                  }"
                  @click="popupNodeCurrentTab = 1"
                >
                  Children
                </div>
              </div>
              <div class="node-popup-content-tabs__wrapper">
                <div
                  class="node-popup-content-tabs__content-item"
                  :class="{
                    'node-popup-content-tabs__content-item--active': popupNodeCurrentTab === 0,
                  }"
                >
                  <template v-if="parentNodes.length > 0">
                    <div
                      v-for="item in parentNodes"
                      :key="item"
                      class="pa-1"
                    >
                      • Node: {{ item }}
                    </div>
                  </template>
                  <template v-else>
                    Empty
                  </template>
                </div>
                <div
                  class="node-popup-content-tabs__content-item"
                  :class="{
                    'node-popup-content-tabs__content-item--active': popupNodeCurrentTab === 1,
                  }"
                >
                  <template v-if="childrenNodes.length > 0">
                    <div
                      v-for="item in childrenNodes"
                      :key="item"
                      class="pa-1"
                    >
                      • Node: {{ item }}
                    </div>
                  </template>
                  <template v-else>
                    <div>
                      Empty
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="isVisiblePopup && popupEdgeContent"
            ref="edgePopupContent"
            class="edge-popup-content"
            :class="{
              'popupContent--is-active': isPopupEdgeShow,
            }"
            tabindex="0"
          >
            <div class="edge-popup-content__wrapper">
              <div class="edge-popup-content__text edge-popup-content__text--bold">
                {{ popupEdgeContent.sourceName }} >
              </div>
              <div class="edge-popup-content__text edge-popup-content__text--bold">
                {{ popupEdgeContent.targetName }}
              </div>
              <div class="edge-popup-content__text">
                metric:
                <span class="edge-popup-content__text edge-popup-content__text--bold">
                  {{ `${popupEdgeContent.metricValue}`.replace('metric:', '') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </portal>
</template>

<script>
import { INode } from 'yfiles';
import {
  mdiArrowAll,
  mdiMagnifyPlus,
  mdiFitToPageOutline,
  mdiMagnifyMinus,
  mdiClose,
  mdiEyeOffOutline,
} from '@mdi/js';
import GraphClass from '../../js/classes/GraphClass';

export default {
  name: 'DashYGraph',
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
    loading: {
      type: Boolean,
      default: true,
    }, // сообщает что компонент в режиме получения данных
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
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
      iconArrowAll: mdiArrowAll,
      mdiMagnifyPlus,
      mdiFitToPageOutline,
      mdiMagnifyMinus,
      mdiClose,
      mdiEyeOffOutline,
      isEditor: false,
      colors: [
        '#aefaff',
        '#0ab3ff',
        '#003cff',
        '#7100ff',
        '#c800ff',
        '#ff00dd',
      ],
      actions: [
        { name: 'click', capture: [] },
        { name: 'mouseover', capture: [] },
      ],
      popupNodeCurrentTab: 0,
      popupEdgeContent: null,
      isPopupEdgeShow: false,
      popupNodeContent: null,
      isPopupNodeShow: false,
      isVisiblePopup: true,
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
    idDash() {
      return this.idDashFrom;
    },
    parentNodes() {
      if (!this.popupNodeContent?.data?.id) return [];
      return this.dataRestFrom
        .filter((item) => `${item.relation_id}` === `${this.popupNodeContent.data.id}`)
        .map((item) => item.node);
    },
    childrenNodes() {
      if (!this.popupNodeContent?.data?.id) return [];
      const node = this.popupNodeContent.data;
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
    popupNodePosition() {
      if (this.popupNodeContent) {
        return `transform: translate(${this.popupNodeContent.position.x}px, ${this.popupNodeContent.position.y}px)`;
      }
      return '';
    },
  },
  watch: {
    dataRestFrom(val) {
      setTimeout(() => {
        if (val.length > 0) {
          this.graph.reDrawNodesEdges(val, (e) => this.createTockens(e));
        }
      }, 100);
    },
    colorFrom() {
      this.graph.colorFrom = this.colorFrom;
      this.graph.colorFont();
    },
    fullScreenMode() {
      this.$nextTick(() => {
        this.createGraph();
        if (this.dataRestFrom.length) {
          setTimeout(() => {
            this.graph.reDrawNodesEdges(
              this.dataRestFrom,
              (e) => this.createTockens(e),
            );
            this.fitContent();
          }, 100);
        }
      });
    },
    popupNodeContent(val) {
      this.isPopupNodeShow = !!val;
    },
    popupEdgeContent(val) {
      this.isPopupEdgeShow = !!val;
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
        this.graph.reDrawNodesEdges(
          this.dataRestFrom,
          (e) => this.createTockens(e),
        );
        this.fitContent();
      }, 100);
    }
  },
  methods: {
    zoomIn() {
      this.graph.zoomIn();
    },
    zoomOut() {
      this.graph.zoomOut();
    },
    fitContent() {
      this.graph.fitContent();
    },
    changeInputMode() {
      // меняем режим графика
      if (this.isEditor) {
        this.initMode();
      } else {
        this.graph.viewerInputMode();
      }
      this.isEditor = !this.isEditor;
    },
    createTockens(result) {
      const captures = Object.keys(result[0]);
      const localActions = JSON.parse(JSON.stringify(this.actions));
      localActions.forEach((item, i) => {
        this.$set(localActions[i], 'capture', captures);
      });
      this.$store.commit('setActions', {
        actions: JSON.parse(JSON.stringify(localActions)),
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
      this.graph.initMode({
        modeOptions: {
          allowGroupingOperations: false,
          allowAddLabel: false,
          allowCreateNode: false,
          allowCreateEdge: false,
        },
        callback: (sender, args) => {
          if (args.item instanceof INode) {
            const tokens = this.$store.state[this.idDashFrom]?.tockens || [];
            tokens.forEach((token) => {
              if (token.elem === this.idFrom && token.action === 'click') {
                const value = args.item.tag[token.capture];
                this.$store.commit('setTocken', {
                  token,
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
        },
      });
      this.graph.initializeDefault();
    },
    createGraph() {
      this.$nextTick(() => {
        const graph = new GraphClass({
          elem: this.$refs.graph,
          colors: this.colors,
          colorFrom: this.colorFrom,
          popupCallback: this.popupCallback,
        });
        this.graph = Object.freeze(graph);
        this.initMode();
      });
    },
    closePopup() {
      this.graph.closeNodePopup();
    },
    popupCallback(popupContent) {
      if (popupContent.type === 'node') {
        this.popupNodeContent = popupContent.content;
      } else {
        this.popupEdgeContent = popupContent.content;
      }
    },
    async toggleVisiblePopup() {
      this.isVisiblePopup = !this.isVisiblePopup;
    },
  },
};
</script>

<style lang="css">
.ygraph-wrapper .button-block {
  position: absolute;
  top: 30px;
  left: 10px;
  z-index: 1;
  height: 32px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
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
.node-popup-content, .edge-popup-content {
  position: absolute;
  left: 0;
  top: 0;
  background: var(--secondary_bg);
  border-radius: 4px;
  transform: translate(20px, 20px);
}
.edge-popup-content {
  padding: 10px 15px;
  min-width: 126px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  &__wrapper {
    text-align: left;
  }
  &__text {
    color: var(--main_text);
    font-weight: 400;
    font-size: 17px;
    line-height: 21px;
    &--bold {
      font-weight: 700;
    }
  }
  &--is-active {
    display: block;
    opacity: 1;
  }
}
.node-popup-content {
  color: var(--main_text);
  width: 250px;
  padding: 4px;
  &__header {
    padding-right: 20px;
    position: relative;
  }
  &__close-btn {
    position: absolute;
    right: 2px;
    top: 2px;
  }
  &__title {
    font-size: 1.2rem;
    text-align: center;
  }
  &__description {
    font-size: 0.9rem;
  }
}
.node-popup-content-tabs {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__button-item {
    padding: 8px;
    flex: 1;
    cursor: pointer;
    border-bottom: 1px solid var(--secondary_bg);
    transition: all .2s ease-in-out;
    &:hover {
      border-bottom-color: var(--main_text);
      opacity: .8;
    }
    &--active {
      border-bottom-color: var(--main_text);
      opacity: 1;
    }
  }
  &__wrapper {
    display: flex;
  }
  &__content-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 4px;
    display: none;
    text-align: left;
    &--active {
      display: flex;
    }
  }
}

.yfiles-tooltip {
  position: fixed !important;
}
</style>
