<template>
  <div>
    <v-row>
      <v-col>
        <v-select
          @change="setToken"
          :items="tokens"
          item-text="name"
          label="Токены"
          return-object
          filled
        >
        </v-select>
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
    watch: {
      temp(val) { },
    },
    data() {
      return {
        operations: ['OR', 'AND', 'REPLACE'],
      };
    },
    computed: {
      tokens() {
        return this.$store.getters.getTockens(this.filter.idDash);
      },
    },
    methods: {
      setToken(token){
        this.temp.token = token
        this.temp.fieldName = token.capture
      }
    },
  };
</script>
