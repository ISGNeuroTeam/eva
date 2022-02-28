<template>
  <div
    ref="single"
    class="dash-single"
    @click="setClick"
  >
    <v-card
      v-show="!noMsg"
      class="number-block"
      outlined
      :loading="dataLoading"
      :look-size="changeSize"
    >
      <div
        class="number"
        :style="{ fontSize: `${fontSize}px` }"
      >
        <div
          class="number-itself"
          :style="{ color: 'var(--accent_ui_color)' }"
        >
          {{ number }}
        </div>
        <div
          class="number-sub"
          :style="{ color: 'var(--primary_button)' }"
        >
          {{ subnumber }}
        </div>
      </div>
    </v-card>
    <div
      v-show="noMsg"
      class="errormsg"
    >
      {{ msgText }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    idFrom: null,
    idDashFrom: null,
    dataRestFrom: null,
    dataLoadingFrom: null,
    widthFrom: null,
    colorFrom: null,
  },
  data() {
    return {
      actions: [{ name: 'click', capture: [] }],
      noMsg: true,
      msgText: 'Нет данных для отображения',
    };
  },
  computed: {
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    dataRest() {
      return this.dataRestFrom;
    },
    dataLoading() {
      return this.dataLoadingFrom;
    },
    numberValue() {
      if (this.dataRestFrom && this.dataRestFrom.length > 0) {
        return Number(Object.values(this.dataRestFrom[0])[0]);
      }
      return false;
    },
    number() {
      if (this.dataRestFrom && this.dataRestFrom.length > 0) {
        this.setEventColor(this.numberValue);
        return this.numberValue;
      }
      return null;
    },
    dashFromStore() {
      return this.$store.state[this.idDash][this.id];
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.id, idDash: this.idDash });
      }

      if (!this.dashFromStore?.options.pinned) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pinned',
          value: false,
        }]);
      }

      if (!this.dashFromStore.options.lastDot) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'lastDot',
          value: false,
        }]);
      }
      if (!this.dashFromStore.options.stringOX) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'stringOX',
          value: false,
        }]);
      }
      if (!this.dashFromStore?.options.united) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'united',
          value: false,
        }]);
      }

      return this.dashFromStore.options;
    },
    subnumber() {
      const options = this.getOptions;
      return options.subnumber;
    },
    fontSize() {
      const options = this.getOptions;
      if (options.fontSize) {
        return options.fontSize.split('px')[0];
      }
      return '30';
    },
    changeSize() {
      return true;
    },

    color() {
      const options = this.getOptions;
      let color = this.colorFrom.controls;
      if (options.color) {
        color = options.color;
      }
      return color;
    },
  },
  watch: {
    dataRestFrom(dataRestFrom) {
      this.setNoMsg(dataRestFrom);
    },
  },
  mounted() {
    this.setNoMsg(this.dataRestFrom);
    //  В первый раз раскомментить чтобы создать события для элемнета, а затем лучше закоментить чтобы каждый раз не обращаться к store
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
  },
  methods: {
    setNoMsg(dataRestFrom) {
      this.noMsg = !(dataRestFrom && dataRestFrom.length > 0);
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
    setEventCompareColor(number) {
      const events = this.getEvents({
        event: 'OnDataCompare',
      });
      let flag = -1;
      let frontier;
      events.forEach((item) => {
        switch (item.compare) {
          case 'equals':
            if (Number(item.sense) === Number(number)) {
              flag = 0;
            }
            break;
          case 'over':
            if (Number(item.sense) > Number(number)) {
              flag = 0;
            }
            break;
          case 'less':
            if (Number(item.sense) < Number(number)) {
              flag = 0;
            }
            break;
          case 'in':
            frontier = item.sense.replace(/[[\]]/g, '').split(',');
            frontier.forEach((itemFron) => {
              if (Number(number) === Number(itemFron)) {
                flag = 0;
              }
            });
            break;
          case 'between':
            frontier = item.sense.replace(/[[\]]/g, '').split(',');
            if (
              Number(number) < Number(frontier[1])
              && Number(number) > Number(frontier[0])
            ) {
              flag = 0;
            }

            break;
        }
        if (flag !== -1) {
          this.$store.commit('letEventSet', {
            events: [
              { target: item.target, prop: item.prop[0], value: item.value[0] },
            ],
            idDash: this.idDash,
          });
        } else {
          this.$store.commit('letEventSet', {
            events: [{ target: item.target, prop: item.prop[0], value: '' }],
            idDash: this.idDash,
          });
        }
        flag = -1;
      });
    },

    setEventColor(number) {
      this.setEventCompareColor(number);
      const events = this.getEvents({
        event: 'onValueCompare',
      });
      let treshold; let color; let
        value;

      events.forEach((item) => {
        treshold = item.treshold.replace('[', '').replace(']', '').split(',');
        color = item.color.replace('[', '').replace(']', '').split(',');
        treshold.forEach((item, i) => {
          if (number > Number(item)) {
            value = color[i];
          }
        });
        if (value) {
          this.$store.commit('letEventSet', {
            events: [{ target: item.target, prop: item.prop[0], value }],
            idDash: this.idDash,
          });
        } else {
          this.$store.commit('letEventSet', {
            events: [{ target: item.target, prop: item.prop[0], value: '' }],
            idDash: this.idDash,
          });
        }
      });
    },
    setClick() {
      const { tockens } = this.$store.state[this.idDash];
      let tocken = {};

      Object.keys(tockens).forEach((i) => {
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        };
        if (tockens[i].elem === this.id && tockens[i].action === 'click') {
          this.$store.commit('setTocken', {
            tocken,
            idDash: this.idDash,
            value: this.number,
            store: this.$store,
          });
        }
      });

      const events = this.getEvents({
        event: 'onclick',
        partelement: 'empty',
      });
      if (events.length !== 0) {
        events.forEach((item) => {
          if (item.action === 'set') {
            this.$store.commit('letEventSet', {
              events,
              idDash: this.idDash,
            });
          } else if (item.action === 'go') {
            this.$store.dispatch('letEventGo', {
              event: item,
              idDash: this.idDash,
              route: this.$router,
              store: this.$store,
            });
            // this.$router.push(`/dashboards/${item.target.toLowerCase()}`);
          }
        });
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashSingle.sass';
</style>
