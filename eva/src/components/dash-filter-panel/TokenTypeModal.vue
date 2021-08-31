<template>
  <div>
    <v-row>
      <v-col>
        <select v-model="currentToken" placeholder="Токен">
          <option v-for="(token, index) in tokens" :key="index" :value="token">
            {{ token.name }}
          </option>
        </select>
      </v-col>
      <v-col>
        <v-select v-model="temp.operationToken" :items="operations" label="Операции" filled />
      </v-col>
    </v-row>
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
