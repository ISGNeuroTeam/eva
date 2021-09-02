<template>
  <div
    :style="{ 'background-color': theme.$secondary_bg, color: theme.$main_text }"
    class="token-type-filter-modal"
  >
    Токен
    <v-select
      v-model="currentToken"
      :items="tokens"
      item-text="name"
      return-object
      hide-details
      outlined
      dense
      style="padding-bottom: 10px"
      :background-color="theme.$main_bg"
    />
    Операция
    <v-select
      v-model="temp.operationToken"
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
    props: ['temp', 'idDash'],
    data() {
      return {
        operations: ['OR', 'AND', 'REPLACE'],
        currentToken: null,
      };
    },
    watch: {
      currentToken(token) {
        if (token && this.temp.filterPartType === 'token') {
          this.temp.token = token;
          this.temp.fieldName = token.capture;
        }
      },
      temp: {
        immediate: true,
        handler(val) {
          this.currentToken = val.token;
        },
      },
    },
    computed: {
      tokens() {
        return this.$store.getters.getTockens(this.idDash);
      },
      theme() {
        return this.$store.getters.getTheme;
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
