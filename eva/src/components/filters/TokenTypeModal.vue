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
        <v-select v-model="temp.operation" :items="operations" label="Операции" filled />
      </v-col>
    </v-row>
  </div>
</template>
<script>
  export default {
    name: 'TokenTypeModal',
    props: ['temp', 'filter'],
    data() {
      return {
        operations: ['OR', 'AND', 'REPLACE'],
        currentToken: null,
      };
    },
    watch: {
      currentToken(token) {
        if (token) {
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
        return this.$store.getters.getTockens(this.filter.idDash);
      },
    },
  };
</script>
