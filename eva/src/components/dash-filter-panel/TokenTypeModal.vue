<template>
  <div :style="{ 'background-color': theme.$secondary_bg }">
    Токен
    <v-select
      :items="tokens"
      item-text="name"
      v-model="currentToken"
      return-object
      :background-color="theme.$main_bg"
      outlined
      dense
    />
    Операция
    <v-select
      :background-color="theme.$main_bg"
      v-model="temp.operationToken"
      :items="operations"
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
