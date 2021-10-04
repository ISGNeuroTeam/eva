<template>
  <div
    :style="{ 'background-color': theme.$secondary_bg, color: theme.$main_text }"
    class="token-type-filter-modal"
  >
    Токен
    <v-select
      v-model="currentTokenName"
      :items="tokenNameList"
      :disabled="!editMode"
      @change="changeToken"
      item-text="name"
      :background-color="theme.$main_bg"
      style="padding-bottom: 10px"
      hide-details
      outlined
      dense
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
    props: ['temp', 'idDash', "editMode"],
    data() {
      return {
        currentToken:null,
        currentTokenName:"",
        operations: ['OR', 'AND', 'REPLACE'],
      };
    },
    computed: {
      tokenNameList() {
        return this.$store.getters.getTockens(this.idDash).map(tkn=>tkn.name);
      },
      theme() {
        return this.$store.getters.getTheme;
      },
    },
    watch: {
      currentTokenName(tknName){
        this.temp.token = this.$store.getters.getTockens(this.idDash).find(tkn=>tkn.name===tknName)
        this.temp.fieldName = this.temp.token.capture;
      }
    },
    methods: {
      changeToken(){
        this.temp.values = []
      }
    },
    mounted() {
      if(this.temp.token) {
        this.currentTokenName = this.temp.token.name
        this.$set(this.temp, 'token', this.temp.token);
        this.$watch(
          'temp.token',
          newVal => {
            if (newVal) {
              this.currentTokenName = newVal.name
            }
          },
          { immediate: true }
        );
      }
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
