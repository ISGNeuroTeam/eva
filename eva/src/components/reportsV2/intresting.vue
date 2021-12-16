<template>
    <div
        class="interesting"
        :style="{background: theme.$main_bg, color: theme.$main_text}"
    >
      <div
          class="interesting-block"
          :style="{background: theme.$main_bg, color: theme.$main_text}"
      >
        <div class="interesting-title">
          Interesting field
        </div>
        <div
            class="interesting-overflow-block"
            :style="{color:theme.$main_text}"
        >
          <div
              v-for="item in rows"
              :key="item.id"
              class="interesting-row"
          >

            <v-menu offset-x>
              <template v-slot:activator="{ on, attrs }">
                <div
                    @click="openStatistic(item)"
                    v-bind="attrs"
                    v-on="on"
                >
                  <span class="interesting-row-name">{{ item.text }} </span>
                  <span class="interesting-row-number">{{ item.totalCount }}</span>
                </div>
              </template>
              <v-card class="action-popup">
                <div class="action-popup-title">
                  Actions
                </div>
                <div>
                  <v-data-table
                      :style="{backgroundColor:theme.$main_bg, color: theme.$main_text}"
                      disable-pagination
                      hide-default-footer
                      :headers="[{ text: 'value', value: 'value' },{ text: 'count', value: 'count' },{ text: '%', value: '%' }]"
                      :items="statistic"
                  />
                </div>
              </v-card>
            </v-menu>
          </div>
        </div>
      </div>
    </div>
</template>


<script>
import { mdiRefresh, mdiMagnify, mdiChevronRight, mdiChevronDown } from '@mdi/js'

export default {
  props: {
    rows: [],
  },
  data () {
    return {
      mdiRefresh: mdiRefresh,
      mdiMagnify: mdiMagnify,
      mdiChevronRight: mdiChevronRight,
      mdiChevronDown: mdiChevronDown,
      statistic: [],
      statisticKey: null,
    }
  },
  computed: {
    theme () {
      return this.$store.getters.getTheme
    },
    dataset () {
      let dataset = []
      this.data.forEach(item => {
        let options = {
          hour12: 'true',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        };
        dataset.push({time: new Date(item._time*1000).toLocaleString("ru", options), inputCount: item})
      })
      console.log(dataset)
      return dataset
    },
  },
  methods: {
    openStatistic: function(statistic) {
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
  mounted() {}
}


</script>

<style lang="sass" >
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
.action-popup
  padding: 10px 10px 10px 10px
  border-radius: 5px
</style>