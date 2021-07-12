<template>
  <div class="med">
    <v-container class="fill-height" style="align-items: normal">
      <v-row class="ma-0">
        <v-spacer></v-spacer>

        <v-dialog v-model="dialog" max-width="290">
          <template v-slot:activator="{ on, attrs }">
            <v-btn rounded color="#191919" v-bind="attrs" v-on="on">
              <v-icon :style="{ color: theme.$title }">
                {{ mdiSettings }}
              </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="text-h5"> Настройки </v-card-title>
            <v-card-text>
              <p>Подложка</p>
              <v-select :items="tileLayers" item-text="name" item-value="tile"/>

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
                max="200"
                min="1"
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
        class="mb-5 mr-0"
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
              "
            >
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
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.tilelayer.colorfilter";
import "leaflet.markercluster";
export default {
  props: {
    idElement: String,
    idDashFrom: String,
    map: Object,
  },
  data() {
    return {
      mdiSettings: mdiSettings,
      mdiList: mdiFormatListBulletedSquare,
      dialog: false,
      base_svg_url: `${window.location.origin}/svg/`,
      tileLayers: [
        {
          name: "Яндекс карта",
          tile: {},
        },
        {
          name: "Google спутник",
          tile: L.tileLayer(
            "http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
            {
              subdomains: ["mt0", "mt1", "mt2", "mt3"],
            }
          ),
        },
        {
          name: "Google карты",
          tile: L.tileLayer(
            "http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
            { subdomains: ["mt0", "mt1", "mt2", "mt3"] }
          ),
        },
      ],
      options: {
        selected: "яндекс",
        selectedLayer: "test",
        zoomLevel: 10,
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
    } else {
      this.options = options;
    }
    this.setTileLayer();
  },
  methods: {
    updateOptions(newOptions) {
      this.$store.commit("updateOptions", {
        idDash: this.idDashFrom,
        idElement: this.idElement,
        options: { ...this.dashSettings, ...newOptions },
      });
    },

    setTileLayer() {
      // this.map.removeLayer(grayscale);
      // this.map.addLayer(streets);
      // let test = L.tileLayer(
      //   "http://vec{s}.maps.yandex.net/tiles?l=map&v=4.55.2&z={z}&x={x}&y={y}&scale=2&lang=ru_RU",
      //   {
      //     subdomains: ["01", "02", "03", "04"],
      //     attribution: '<a http="yandex.ru" target="_blank">Яндекс</a>',
      //     reuseTiles: true,
      //     updateWhenIdle: false,
      //   }
      // ).addTo(this.map);
      // this.map.addLayer(test)
      // let baselayers = {
      //   "Tile Layer 1": L.tileLayer(
      //     "http://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}"
      //   ),
      //   "Tile Layer 2": L.tileLayer(
      //     "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      //     {
      //       subdomains: ["mt0", "mt1", "mt2", "mt3"],
      //     }
      //   ),
      //   "Tile Layer 3": L.tileLayer(
      //     "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
      //     {
      //       subdomains: ["mt0", "mt1", "mt2", "mt3"],
      //     }
      //   ),
      // };
      // let overlays = {};
      // baselayers["Tile Layer 1"].addTo(this.map);
      // baselayers["Tile Layer 2"].addTo(this.map);
      // L.control.layers(baselayers, overlays).addTo(this.map);
      // L.tileLayer("http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}", {
      //   subdomains: ["mt0", "mt1", "mt2", "mt3"],
      // });
      // L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      //   subdomains: ["mt0", "mt1", "mt2", "mt3"],
      // }).addTo(this.map);
      // let terrain = L.tileLayer(
      //   "http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
      //   {
      //     subdomains: ["mt0", "mt1", "mt2", "mt3"],
      //   }
      // ).addTo(this.map);
      // let terrain1 = L.tileLayer(
      //   "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
      //   {
      //     subdomains: ["mt0", "mt1", "mt2", "mt3"],
      //   }
      // ).addTo(this.map);
      // L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
      //   subdomains: ["mt0", "mt1", "mt2", "mt3"],
      // }).addTo(this.map);
      // this.map.addLayer(terrain);
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
  /* left: 0px; */
  right: 0px;
  z-index: 1000000;
}
</style>