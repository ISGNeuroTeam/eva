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
        <div class="interesting-title">
          Interesting fields
        </div>
        <div
          class="interesting-overflow-block"
          :style="{ color: theme.$main_text }"
        >
          <div
            v-for="item in getInteresting"
            :key="item.id"
            class="interesting-row"
          >
            <v-menu
              min-width="356px"
              offset-x
              :close-on-content-click="false"
              content-class="interesting-popup"
            >
              <template v-slot:activator="{ on, attrs }">
                <div
                  v-bind="attrs"
                  @click="openStatistic(item)"
                  v-on="on"
                >
                  <span class="interesting-row-name">{{ item.text }} </span>
                  <span class="interesting-row-number">{{ item.totalCount }}</span>
                </div>
              </template>
              <v-card class="action-popup">
                <list-with-pagination
                  :list-items="statistic"
                  :theme="theme"
                  :title="item.text"
                />
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
import { mapGetters } from 'vuex';
import ListWithPagination from '../listWithPagination';

export default {
  name: 'Interesting',
  components: { ListWithPagination },
  data() {
    return {
      mdiRefresh,
      mdiMagnify,
      mdiChevronRight,
      mdiChevronDown,
      statistic: [],
      statisticKey: null,
    };
  },
  computed: {
    ...mapGetters('dataResearch', ['getInteresting']),
    theme() {
      return this.$store.getters.getTheme;
    },
    dataset() {
      const dataset = [];
      this.data.forEach((item) => {
        const options = {
          hour12: 'true',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        };
        dataset.push({
          // eslint-disable-next-line no-underscore-dangle
          time: new Date(item._time * 1000).toLocaleString('ru', options),
          inputCount: item,
        });
      });
      // console.log(dataset);
      return dataset;
    },
  },
  mounted() {},
  methods: {
    openStatistic(statistic) {
      if (this.showStatistic) {
        if (this.statisticKey === statistic.text) {
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
<!-- eslint-disable -->
<style lang="sass">
@import './../../sass/_colors'
.interesting
  height: 100%
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
    color: $main_text !important

.interesting-popup
  width: 356px

.v-menu__content
  border-radius: 6px !important
  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important
.action-popup
  box-shadow: none !important
  padding: 0 0 0 0 !important
  border-radius: 6px
  background-color: $main_bg !important
</style>
