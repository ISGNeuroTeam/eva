<template>
  <div class="dash-template" ref="graph"></div>
</template>


<script>
import * as yfile from 'yfiles'
import licenseData from './license.json'

yfile.License.value = licenseData//проверка лицензии

export default {
  name: "dashEGraph",
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
      nodesSource : [{
            id: 0,
            name: 'start'
          },
          {
            id: 1,
            name: '1'
          },
          {
            id: 2,
            name: '2'
          },
          {
            id: 3,
            name: '3'
          },
          {
            id: 4,
            name: '4'
          },
          {
            id: 5,
            name: '5'
          },

          {
            id: 6,
            name: '6'
          },
          {
            id: 8,
            name: '8'
          },
          {
            id: 9,
            name: '9'
          },
          {
            id: 10,
            name: '10'
          },
          {
            id: 11,
            name: '11'
          },
          {
            id: 12,
            name: '12'
          },
          {
            id: 13,
            name: '13'
          },
          {
            id: 14,
            name: '14'
          },
          {
            id: 15,
            name: 'finish'
          }],
      edgesSource: [
          {
            fromNode: 0,
            toNode: 1
          },
          {
            fromNode: 1,
            toNode: 2
          },
          {
            fromNode: 2,
            toNode: 3
          },
          {
            fromNode: 3,
            toNode: 4
          },
          {
            fromNode: 4,
            toNode: 5
          },
          {
            fromNode: 5,
            toNode: 6
          },
          {
            fromNode: 6,
            toNode: 15
          },
          {
            fromNode: 1,
            toNode: 8
          },
          {
            fromNode: 8,
            toNode: 2
          },
          {
            fromNode: 3,
            toNode: 9
          },
          {
            fromNode: 9,
            toNode: 4
          },
          {
            fromNode: 1,
            toNode: 10
          },
          {
            fromNode: 10,
            toNode: 4
          },
          {
            fromNode: 4,
            toNode: 11
          },
          {
            fromNode: 11,
            toNode: 12
          },
          {
            fromNode: 11,
            toNode: 13
          },
          {
            fromNode: 12,
            toNode: 13
          },
          {
            fromNode: 13,
            toNode: 14
          },
          {
            fromNode: 14,
            toNode: 13
          },
          {
            fromNode: 13,
            toNode: 5
          }
        ],
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
      this.doSomething(this.dataRestFrom)
      return this.dataRestFrom
    },
    color: function() {
      return this.colorFrom
    },
  },  
  methods: {
    doSomething(data) {
      console.log(data)
    },

  },
  mounted() {
    this.$store.commit('setActions', {actions: this.actions, idDash: this.idDash, id: this.id });
  } 
}


</script>

<style lang="sass" > 
  

   
</style>