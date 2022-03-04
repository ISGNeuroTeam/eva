<template>
  <div
    :style="{
      'background-color': theme.$secondary_bg,
      color: theme.$main_text,
    }"
    class="token-type-filter-modal"
  >
    Токен
    <v-select
      :value.sync="currentToken"
      :items="tokenNameList"
      :disabled="!editMode"
      :background-color="theme.$main_bg"
      style="padding-bottom: 10px"
      hide-details
      outlined
      dense
      @change="changeToken"
    />
    Операция
    <v-select
      v-model="temp.operationToken"
      :disabled="!editMode"
      :items="operations"
      :background-color="theme.$main_bg"
      hide-details
      outlined
      dense
    />
  </div>
</template>
<script>
export default {
  name: 'TokenTypeModal',
  props: {
    idDash: {
      type: String,
      required: true,
    },
    temp: {
      type: Object,
      required: true,
    },
    editMode: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      currentToken: '',
      operations: ['OR', 'AND', 'REPLACE'],
    };
  },
  computed: {
    tokenNameList() {
      return this.$store.state[this.idDash].tockens.map((tkn) => tkn.name);
    },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    temp: {
      immediate: true,
      handler(newVal) {
        this.currentToken = newVal.token;
      },
    },
  },
  methods: {
    changeToken(newTokenName) {
      this.temp.token = newTokenName;
      this.temp.values = [];
    },
  },
};
</script>

<style lang="sass">
.token-type-filter-modal
  .v-input__slot
    min-height: auto !important

  .v-input__slot fieldset
    color: var(--main_text) !important

  .v-input__control
    .v-icon
      color: var(--main_text) !important

  .v-select__selections
    color: var(--main_text) !important
  .v-input input
    min-height: auto !important
</style>
