<template>
  <div class="med">
    <v-container class="fill-height" style="align-items: normal">
      <v-row class="ma-0">
        <v-spacer></v-spacer>

        <v-dialog v-model="dialog" max-width="290">
          <template v-slot:activator="{ on, attrs }">
            <v-btn rounded color="#191919" v-bind="attrs" v-on="on">
              <v-icon :style="{ color: theme.$title }">{{
                mdiSettings
              }}</v-icon>
            </v-btn>
          </template>
          <v-card >
            <v-card-title class="text-h5"> Настройки </v-card-title>
            <v-card-text>
              <p>Подложка</p>
              <v-select :items="tileLayers" />

              <p>Начальный зум</p>
              <v-slider
                v-model="options.zoomLevel"
                class="align-center"
                max="25"
                min="0"
              >
                <template v-slot:label>
                  <v-text-field
                    v-model="options.zoomLevel"
                    class="mt-0 pt-0"
                    hide-details
                    single-line
                    type="number"
                    style="width: 60px"
                  />
                </template>
              </v-slider>

              <p>Шаг масштаба</p>
              <v-slider
                v-model="options.zoomStep"
                class="align-center"
                max="20"
                min="0"
              >
                <template v-slot:label>
                  <v-text-field
                    v-model="options.zoomStep"
                    class="mt-0 pt-0"
                    hide-details
                    single-line
                    type="number"
                    style="width: 60px"
                  />
                </template>
              </v-slider>

              <p>Легенда карты</p>
              <v-checkbox
                v-model="options.showLegend"
                label="Включить отображение легенды"
                color="secondary"
                hide-details
              />
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>

      <v-row
        align="end"
        align-content="end"
        v-show="options.showLegend"
        class="mb-5"
      >
        <v-spacer></v-spacer>
        <v-card
          style="max-height: 466px"
          max-width="280"
          class="pa-5"
          color="#191919"
        >
          <v-subheader style="color: white" class="px-0">
            <v-icon :style="{ color: theme.$title }">{{ mdiList }}</v-icon>
            <span
              style="
                font-family: Proxima Nova;
                font-size: 18px;
                font-style: normal;
                font-weight: 600;
                line-height: 22px;
                letter-spacing: 0em;
                text-align: left;
              ">
              Легенда
            </span>
          </v-subheader>
          <v-divider></v-divider>
          <v-card width="240" outlined color="white">
            <v-list style="max-height: 382px" class="overflow-y-auto">
              <v-list-item
                three-line
                v-for="item in library.objects"
                :key="item.name"
                v-if="item.image"
              >
                <v-list-item-avatar>
                  <v-img :src="base_svg_url + item.image"></v-img>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="item.name"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-card>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mdiFormatListBulletedSquare, mdiSettings } from "@mdi/js";
export default {
  props: {
    idElement: String,
    idDashFrom: String,
  },
  data() {
    return {
      mdiSettings: mdiSettings,
      mdiList: mdiFormatListBulletedSquare,
      dialog: false,
      base_svg_url: `${window.location.origin}/svg/`,
      tileLayers: ["test", "test1"],
      options: {
        selected: "яндекс",
        selectedLayer: "test",
        zoomLevel: 25,
        zoomStep: 25,
        showLegend: true,
      },
    };
  },
  computed: {
    theme: function () {
      return this.$store.getters.getTheme;
    },
    dashSettings() {
      return this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idElement,
      });
    },
    library() {
      return this.$store.getters.getLibrary(this.idDashFrom, this.idElement);
    },
  },
  watch: {
    options: {
      deep: true,
      handler(val) {
        this.updateOptions(val);
      },
    },
  },
  mounted() {
    let options = this.$store.getters.getOptions({
      idDash: this.idDashFrom,
      id: this.idElement,
    });
    // init store for reactivity
    if (!options.showLegend) {
      let initOptions = {
        showLegend: true,
        zoomLevel: this.options.zoomLevel,
        zoomStep: this.options.zoomStep,
        selectedLayer: this.options.selectedLayer,
      };
      this.$store.commit("setOptions", {
        idDash: this.idDashFrom,
        id: this.idElement,
        options: initOptions,
      });
    }
  },
  methods: {
    updateOptions(newOptions) {
      this.$store.commit("updateOptions", {
        idDash: this.idDashFrom,
        idElement: this.idElement,
        options: { ...this.dashSettings, ...newOptions },
      });
    },
    setOptions: function () {
      // отправляем настройки в хранилище
      if (!this.options.level) {
        this.options.level = 1;
      }

      if (
        typeof this.options.timeFormat != "undefined" &&
        this.options.timeFormat == null
      ) {
        this.options.timeFormat = "%Y-%m-%d %H:%M:%S";
      }
      if (typeof this.options.size != "undefined") {
        if (this.options.size == null) {
          this.options.size = "100px";
        } else if (String(this.options.size).indexOf("px") == -1) {
          this.options.size = `${this.options.size}px`;
        }
      }
      //let options = {...{},...this.options};
      if (this.element.indexOf("csvg") != -1) {
        this.options.tooltip = this.tooltip;
      }
      if (this.element.indexOf("piechart") != -1) {
        this.options.metricsRelation = JSON.parse(
          JSON.stringify(this.metricsRelation)
        );
        this.options.colorsPie = this.colorsPie;
        if (this.colorsPie.theme == "custom") {
          this.themes[this.colorsPie.nametheme] =
            this.colorsPie.colors.split(",");
          this.colorsPie.theme = this.colorsPie.nametheme;
        }
        this.options.themes = this.themes;
      }
      if (this.element.indexOf("multiLine") != -1) {
        let updateMetrics = this.metrics.map((item) => {
          return JSON.parse(JSON.stringify(item));
        });
        this.$set(this.options, "metrics", updateMetrics);
      }
      this.$store.commit("setOptions", {
        idDash: this.idDash,
        id: this.element,
        options: this.options,
        titles: this.tableTitles,
      });
      this.cancelModal();
    },
  },
};
</script>

<style>
.med {
  height: 100%;
  position: absolute;
  left: 0px;
  right: 0px;
  z-index: 1000000;
}
</style>