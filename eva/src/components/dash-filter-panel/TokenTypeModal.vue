<template>
  <div
    :style="{ 'background-color': theme.$secondary_bg, color: theme.$main_text }"
    class="token-type-filter-modal"
  >
    Токен
    <v-select
      v-model="temp.token"
      :items="tokens"
      item-text="name"
      return-object
      :background-color="theme.$main_bg"
      style="padding-bottom: 10px"
      hide-details
      outlined
      dense
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
      };
    },
    computed: {
      tokens() {
        return this.$store.getters.getTockens(this.idDash);
      },
      theme() {
        return this.$store.getters.getTheme;
      },
    },
    mounted() {
      this.$set(this.temp, 'token', this.temp.token);
      this.$watch(
        'temp.token',
        newVal => {
          if (newVal) {
            this.currentToken = newVal;
            this.temp.fieldName = newVal.capture;
          }
        },
        { immediate: true }
      );
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
