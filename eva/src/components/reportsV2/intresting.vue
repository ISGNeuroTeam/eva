<template>
  <div
    class="interesting"
    :style="{ background: theme.$main_bg, color: theme.$main_text }"
  >
    <div
      class="interesting-block"
      :style="{ background: theme.$main_bg, color: theme.$main_text }"
    >
      <div
        class="interesting-overflow-block"
        :style="{ color: theme.$main_text }"
      >
        <div class="interesting-title">Interesting fields</div>
        <div
          class="interesting-overflow-block"
          :style="{ color: theme.$main_text }"
        >
          <div v-for="item in rows" :key="item.id" class="interesting-row">
            <v-menu offset-x :close-on-content-click="false">
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" @click="openStatistic(item)" v-on="on">
                  <span class="interesting-row-name">{{ item.text }} </span>
                  <span class="interesting-row-number">{{
                    item.totalCount
                  }}</span>
                </div>
              </template>
              <v-card class="action-popup">
                <div class="action-popup-title">
                  {{ item.text }}
                </div>
                <div>
                  <v-data-table
                    :style="{
                      backgroundColor: theme.$main_bg,
                      color: theme.$main_text,
                      'max-height': '500px',
                    }"
                    disable-pagination
                    hide-default-footer
                    :headers="[
                      { text: 'Значение', value: 'value' },
                      { text: 'Количество', value: 'count' },
                      { text: 'Процент', value: '%' },
                    ]"
                    :items="statistic"
                  />
                </div>
              </v-card>
            </v-menu>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  mdiRefresh,
  mdiMagnify,
  mdiChevronRight,
  mdiChevronDown,
} from '@mdi/js';

export default {
  props: {
    rows: Array,
  },
  data() {
    return {
      mdiRefresh: mdiRefresh,
      mdiMagnify: mdiMagnify,
      mdiChevronRight: mdiChevronRight,
      mdiChevronDown: mdiChevronDown,
      statistic: [],
      statisticKey: null,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    dataset() {
      let dataset = [];
      this.data.forEach((item) => {
        let options = {
          hour12: 'true',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        };
        dataset.push({
          time: new Date(item._time * 1000).toLocaleString('ru', options),
          inputCount: item,
        });
      });
      console.log(dataset);
      return dataset;
    },
  },
  mounted() {},
  methods: {
    openStatistic: function (statistic) {
      if (this.showStatistic) {
        if (this.statisticKey == statistic.text) {
          // this.showStatistic = false;
        } else {
          this.statisticKey = statistic.text;
          this.statistic = statistic.static;
        }
      } else {
        // this.showStatistic = true;
        this.statisticKey = statistic.text;
        this.statistic = statistic.static;
      }
    },
  },
};
</script>

<style lang="sass">
@import './../../sass/_colors'
.interesting
  .interesting-title
    font-size: 12px
    font-weight: 500
    line-height: 15px
    text-transform: uppercase
  .interesting-row-name
    font-size: 12px
    line-height: 15px
    color: $primary_button
  .interesting-row-number
    font-size: 12px
    line-height: 15px
    color: $main_text
.menuable__content__active
  width: 400px !important
.v-menu__content
  border-radius: 6px !important
  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important
.action-popup
  box-shadow: none !important
  padding: 0 0 0 0 !important
  border-radius: 6px
  background-color: $main_bg !important
  .action-popup-title
    padding: 5px 10px 5px 10px
    background-color: $main_bg
    color: $main_text
    font-weight: bold
  .v-data-table-header
    th
      color: $main_text !important
      padding: 0 10px !important
      height: 30px !important
      border-bottom: none !important
  td
    padding: 0 10px !important
    height: 30px !important
    border-bottom: none !important
  tr:hover
    color: $main_bg
    background-color: $accent_ui_color !important
</style>
