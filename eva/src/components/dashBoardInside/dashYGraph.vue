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
        :key="idFrom"
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
  </portal>
</template>

<script>
import { INode } from 'yfiles';
import {
  mdiArrowAll,
  mdiMagnifyPlus,
  mdiFitToPageOutline,
  mdiMagnifyMinus,
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
      currentNode: null,
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
      if (!this.currentNode || !this.currentNode.id) return [];
      return this.dataRestFrom
        .filter((item) => `${item.relation_id}` === `${this.currentNode.id}`)
        .map((item) => item.node);
    },
    childrenNodes() {
      if (!this.currentNode || !this.currentNode.id) return [];
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
        this.graph.reDrawNodesEdges(val, (e) => this.createTockens(e));
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
          nodePopupContent: this.$refs.nodePopupContent,
          edgePopupContent: this.$refs.edgePopupContent,
          popupCallback: (currentNode) => {
            this.currentNode = currentNode;
          },
        });
        this.graph = Object.freeze(graph);
        this.initMode();
      });
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
.yfiles-tooltip {
  position: fixed !important;
}
</style>
