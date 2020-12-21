<template>
  <div class="dash-template" />
</template>


<script>


export default {
  props: {  // переменные полученные от родителя
    idFrom: null,  // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда 
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null,  // цветовые переменные
    shouldFrom: null, // меняется в момент выбора источника данных у дашборда
    dataLoadingFrom: null,  // сообщает что компонент в режиме получения данных
    widthFrom: null, // ширина родительского компонента
    heightFrom: null, // выоста родительского компонента
  },
  data () {
    return {
      actions: [
        {name: 'click',
          capture: []
        },
        {name: 'mouseover',
          capture: []
        },
      ],
    } 
  },
  computed: {  // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    id: function() { 
      return this.idFrom
    },
    idDash: function() { 
      return this.idDashFrom
    },
    dataRest: function() {
      return this.dataRestFrom
    },
    color: function() {
      return this.colorFrom
    },
  },  
  methods: {
    doSomething: function() {

    }
  },
  mounted() {
    
    this.$store.commit('setActions', {actions: this.actions, idDash: this.idDash, id: this.id });
  } 
}


</script>

<style lang="sass" > 
  
    @import '../../sass/dashTamplate.sass'

   
</style>