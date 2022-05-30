<template>
  <div
    class="dash-constructor-schemes"
    :style="{
      'width': `${innerSize.width}px`,
      'height': `${innerSize.height}px`,
    }"
  >
    <button @click="toggleDnDPanel">
      Open
    </button>
    <div
      ref="dndPanelContainer"
      class="dash-constructor-schemes__dnd-panel-container"
      :class="{
        'dash-constructor-schemes__dnd-panel-container--active': dndPanel,
      }"
    >
      <div class="row">
        <div class="col-12">
          <button @click="toggleDnDPanel">
            Close
          </button>
        </div>
        <div class="col-12">
          <div class="dash-constructor-schemes__options">
            <div class="row">
              <!--Цвет линии-->
              <div class="col-8">
                Цвет линии:
              </div>
              <div class="col-4">
                <v-menu
                  top
                  offset-x
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      :style="{
                        'background-color': edgeCustomStyles.strokeColor,
                      }"
                      dark
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>

                  <v-color-picker
                    v-model="edgeCustomStyles.strokeColor"
                    dot-size="12"
                    mode="rgba"
                    @input="closeEdgeColorPicker"
                  />
                </v-menu>
              </div>
              <!--Размер линии-->
              <div class="col-8">
                Размер линии:
              </div>
              <div class="col-4">
                <v-text-field
                  v-model="edgeCustomStyles.strokeSize"
                  dense
                />
              </div>
              <!--Скругление линии-->
              <div class="col-8">
                Скругление линии:
              </div>
              <div class="col-4">
                <v-text-field
                  v-model.number="edgeCustomStyles.smoothingLength"
                  dense
                  placeholder="Скругление"
                />
              </div>
              <!--Цвет блока-->
              <div class="col-8">
                Цвет блока:
              </div>
              <div class="col-4">
                <v-menu
                  top
                  offset-x
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      :style="{
                        'background-color': nodeCustomStyles.fill,
                      }"
                      dark
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>

                  <v-color-picker
                    v-model="nodeCustomStyles.fill"
                    dot-size="12"
                    mode="rgba"
                    @input="closeEdgeColorPicker"
                  />
                </v-menu>
              </div>
              <!--Цвет рамки блока-->
              <div class="col-8">
                Цвет рамки блока:
              </div>
              <div class="col-4">
                <v-menu
                  top
                  offset-x
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      :style="{
                        'background-color': nodeCustomStyles.strokeColor,
                      }"
                      dark
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>

                  <v-color-picker
                    v-model="nodeCustomStyles.strokeColor"
                    dot-size="12"
                    mode="rgba"
                    @input="closeEdgeColorPicker"
                  />
                </v-menu>
              </div>
              <!--Размер линии-->
              <div class="col-8">
                Размер рамки узла:
              </div>
              <div class="col-4">
                <v-text-field
                  v-model="nodeCustomStyles.strokeSize"
                  dense
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        ref="dndPanel"
        class="dash-constructor-schemes__dnd-panel"
      />
    </div>
    <!--The GraphComponent-->
    <div
      ref="graphComponent"
      class="dash-constructor-schemes__graph-component"
    />
  </div>
</template>

<script>
import ConstructorSchemesClass from '../../js/classes/ConstructorSchemes/ConstructorSchemesClass';

export default {
  name: 'DashConstructorSchemes',
  props: {
    // id элемента (table-1\2\3, graph-1\2\3)
    idFrom: {
      type: String,
      required: true,
    },
    // id дашборда
    idDashFrom: {
      type: String,
      required: true,
    },
    // данные с сервера
    dataRestFrom: {
      type: Array,
      default: () => ([]),
    },
    // размеры визуализации(width, height)
    sizeFrom: {
      type: Object,
      required: true,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dndPanel: false,
      edgeColorPopup: false,
      nodeBgColorPopup: false,
      nodeBorderColorPopup: false,
      edgeCustomStyles: {
        strokeSize: '10.5px',
        smoothingLength: 0,
        strokeColor: '#FFFFFF',
        targetArrowColor: '#F4F4F4',
      },
      nodeCustomStyles: {
        fill: '#ee0000',
        strokeColor: '#ee0000',
        strokeSize: '1.5px',
      },
      labelCustomStyles: {
        font: '12px Tahoma',
        textFill: '#000000',
      },
      // Список иконок для схемы
      iconsList: [
        {
          src: '/icons/icon-test-1.svg',
          width: 459,
          height: 274,
          label: 'Image Node',
        },
        {
          src: '/icons/icon-test-1.svg',
          width: 459,
          height: 274,
          label: 'Image Node',
        },
        {
          src: '/icons/icon-test-1.svg',
          width: 459,
          height: 274,
          label: 'Image Node',
        },
      ],
      testData: [
        {
          id: '',
        },
      ],
    };
  },
  computed: {
    dashFromStore() {
      return this.$store.state[this.idDashFrom];
    },
    innerSize() {
      return {
        height: this.sizeFrom.height - 25,
        width: this.sizeFrom.width,
      };
    },
  },
  watch: {
    // TODO: Написать метод для перерисовки отдельного элемента на DnD панели
    edgeCustomStyles: {
      deep: true,
      handler(value) {
        if (this.constructorSchemes) {
          this.constructorSchemes.applyStylesElements({
            edgeCustomStyles: value,
          });
        }
      },
    },
    nodeCustomStyles: {
      deep: true,
      handler(value) {
        if (this.constructorSchemes) {
          this.constructorSchemes.applyStylesElements({
            nodeCustomStyles: value,
          });
        }
      },
    },
    labelCustomStyles: {
      deep: true,
      handler(value) {
        if (this.constructorSchemes) {
          this.constructorSchemes.applyStylesElements({
            labelCustomStyles: value,
          });
        }
      },
    },
  },
  mounted() {
    this.createGraph();
  },
  methods: {
    closeEdgeColorPicker() {
      this.edgeColorPopup = false;
    },
    closeNodeBgColorPicker() {
      this.nodeBgColorPopup = false;
    },
    closeNodeBorderColorPicker() {
      this.nodeBorderColorPopup = false;
    },
    changeDefaultColors() {
      this.constructorSchemes.defaultNodeStyle = {
        fill: '#ee0000',
        strokeColor: '#000000',
        strokeSize: '3.5px',
        size: [50, 50],
      };
      this.constructorSchemes.setDefaultStyles();
    },
    toggleDnDPanel() {
      this.dndPanel = !this.dndPanel;
    },
    createGraph() {
      this.constructorSchemes = new ConstructorSchemesClass({
        dndPanelContainerElem: this.$refs.dndPanelContainer,
        dndPanelElem: this.$refs.dndPanel,
        elem: this.$refs.graphComponent,
        iconsList: this.iconsList,
        edgeCustomStyles: this.edgeCustomStyles,
        nodeCustomStyles: this.nodeCustomStyles,
        labelCustomStyles: this.labelCustomStyles,
      });
      // this.constructorSchemes = constructorSchemes;
    },
  },
};
</script>

<style lang="scss" scoped>
.dash-constructor-schemes {
  position: relative;
  &__color-button {
    width: 100%;
    height: 30px;
  }
  &__relative-wrapper {
    position: relative;
  }
  &__color-picker {
    position: absolute;
    pointer-events: none;
    opacity: 0;
    width: 230px;
    &--active {
      z-index: 1;
      opacity: 1;
      pointer-events: all;
      left: -170px;
    }
  }
  &__dnd-panel-container {
    color: var(--main_text);
    z-index: 1;
    position: absolute;
    left: 0;
    top: 5px;
    bottom: 15px;
    background-color: var(--main_bg);
    width: 250px;
    padding: 10px;
    border-right: 2px solid var(--secondary_bg);
    border-top: 2px solid var(--secondary_bg);
    border-bottom: 2px solid var(--secondary_bg);
    border-radius: 0 4px 4px 0;
    transition: all .2s ease;
    transform: translateX(-100%);
    pointer-events: none;
    max-height: inherit;
    overflow-y: auto;
    overflow-x: hidden;
    &--active {
      transform: translateX(0);
      pointer-events: all;
    }
  }
  &__graph-component {
    height: inherit;
  }
}
</style>
