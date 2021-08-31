<template>
  <div>
    Токен
    <v-select outlined v-model="currentToken" :items="tokens" item-text="name" return-object dense>
    </v-select>
    Операция
    <v-select outlined dense v-model="temp.operationToken" :items="operations" />
    <v-switch
      v-model="temp.invertMatches"
      label="Убрать совпадения из результатов"
      class="ml-4"
    ></v-switch>
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
    computed: {
      theme() {
        return this.$store.getters.getTheme;
      },
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
    },
  };
</script>
