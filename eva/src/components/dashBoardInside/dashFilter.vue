<template>
  <div class="filter-block">
    <v-select
      v-model="props.item"
      :items="getDataStart"
      :loading="props.loading"
      hide-details
      solo
      class="select"
      @change="setItem"
    />
    <v-select
      v-model="props.sign"
      :items="props.items"
      hide-details
      solo
      class="select"
      @change="setSign"
    />
    <v-text-field
      v-model="props.value"
      solo
      clearable
      hide-details
      class="select"
      @keydown.enter="setValue"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      props: {
        id: '',
        selects: [],
        superheroes: [],
        loading: false,
        items: ['>', '=', '<'],
        item: '',
        sign: '=',
        value: '',
      },
    };
  },
  computed: {
    id: function () {
      return this.$attrs['data-id'];
    },
    shouldGet: function () {
      let should = false;
      if (this.id) {
        should = this.$store.getters.getShouldGet(this.id);
      }
      return should;
    },
    getDataStart: function () {
      return this.props.selects;
    },
  },
  watch: {
    id(val) {
      this.props.id = val;
    },
  },
  methods: {
    getData: async function (file) {
      this.props.loading = true;

      let response = await fetch(`src/js/${file}`);

      if (response.status === 404) {
        this.props.loading = false;
      } else if (response.status === 200) {
        let result = await response.json();

        this.createSelects(result.data);

        setTimeout(() => {
          this.props.superheroes = result.data;

          this.props.loading = false;

          this.$store.commit('setShouldGetData', {
            id: this.props.id,
            status: false,
          });
        }, 1500);
      }
    },
    createSelects: function (result) {
      this.props.selects = Object.keys(result[0]).map((item) => {
        return item;
      });
    },
    setItem: function (item) {
      this.props.item = item;
      this.setFilter();
    },
    setSign: function (sign) {
      this.props.sign = sign;
      this.setFilter();
    },
    setValue: function (event) {
      this.props.value = event.target.value;
      this.setFilter();
    },
    setFilter: function () {
      let filter = `${this.props.item} ${this.props.sign} ${this.props.value}`;
      this.$store.commit('setFilter', { id: this.id, string: filter });
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashFilter.sass';
</style>
