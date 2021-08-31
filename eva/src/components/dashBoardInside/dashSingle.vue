<template>
  <div 
    ref="single"
    class="dash-single" 
    @click="setClick"
  >
    <v-card 
      v-show="!noMsg"
      class="number-block" 
      outlined 
      :loading="dataLoading" 
      :lookSize="changeSize" 
    >
      <div 
        class="number"  
        :style="{fontSize:`${fontSize}px`}"
      >
        <div 
          class="number-itself" 
          :style="{color:'var(--accent_ui_color)'}"
        >
          {{ number }}
        </div>
        <div 
          class="number-sub" 
          :style="{color:'var(--primary_button)'}"
        >
          {{ subnumber }}
        </div>
      </div>
    </v-card>
    <div 
      v-show="noMsg"
      class="errormsg" 
    >
      {{ msgText }}
    </div>
  </div>
</template>


<script>


export default {
  props: {
    idFrom: null,
    idDashFrom: null,
    dataRestFrom: null,
    dataLoadingFrom: null,
    widthFrom: null,
    colorFrom: null,
  },
  data () {
    return {
      actions: [
        {name: 'click',
          capture: []
        },
      ],
      noMsg: true,
      msgText: 'Нет данных для отображения',
    } 
  },
  computed: {
    id: function() { 
      return this.idFrom
    },
    idDash: function() { 
      return this.idDashFrom
    },
    dataRest: function() {
      return this.dataRestFrom
    },
    dataLoading: function() {
      return this.dataLoadingFrom
    },
    numberValue(){
      if(this.dataRestFrom && this.dataRestFrom.length > 0){
        return Number( Object.values(this.dataRestFrom[0])[0] )
      } else {
        return false
      }
    },
    number: function() {
      if(this.dataRestFrom && this.dataRestFrom.length > 0){
        this.setEventColor(this.numberValue)
        this.noMsg = false
        return this.numberValue
      } else {
        this.noMsg = true;
        return null
      }
    },
    subnumber: function() {
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.id});
      return options.subnumber
    },
    fontSize: function() {
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.id});
      if(options.fontSize){
        return options.fontSize.split('px')[0]
      } else {
        return '30'
      }
    },
    changeSize: function() {
      let width = this.widthFrom; // присваиваем просто чтобы указать за каким свойством следить
      return true
    },
    
    color: function() {
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.id});
      let color = this.colorFrom.controls;
      if(options.color){
        color = options.color;
      }  
      return color
    },
  },  
  methods: {
    setEventCompareColor: function(number) {
      
      let events = this.$store.getters.getEvents({idDash: this.idDash, event: 'OnDataCompare', element: this.id});
      
      let flag = -1,frontier;
      events.forEach( (item) => {
        switch(item['compare']) {
                                        
        case 'equals':  
          if (Number(item.sense) == Number(number)) {
            flag = 0;
          }
          break
        case 'over':  
          if (Number(item.sense) > Number(number))  {
            flag = 0;
          }
          break
        case 'less':  
          if (Number(item.sense) < Number(number))  {
            flag = 0;
          }
          break
        case 'in':  
          frontier = item.sense.replace(/\[|\]/g, '').split(',');
          frontier.forEach( itemFron => {
            if (Number(number) == Number(itemFron))  {
              flag = 0; 
            }
          })
          break
        case 'between': 
          frontier = item.sense.replace(/\[|\]/g, '').split(',');
          if ( Number(number) < Number(frontier[1]) && Number(number) > Number(frontier[0]))  {
            flag = 0;
          }
            
          break
        }
        if (flag != -1) {
          this.$store.commit('letEventSet', {events: [{target: item.target,prop: item.prop[0],value: item.value[0]}], idDash: this.idDash,  });
        } else {
          this.$store.commit('letEventSet', {events: [{target: item.target,prop: item.prop[0],value: ''}], idDash: this.idDash,  });
        }
        flag = -1;
      });
            
    },

    setEventColor: function(number) {
      this.setEventCompareColor(number)
      let events = this.$store.getters.getEvents({idDash: this.idDash, event: 'onValueCompare', element: this.id});
      let treshold, color, value;

      events.forEach( (item) => { 
        treshold = item.treshold.replace('[','').replace(']','').split(',');
        color = item.color.replace('[','').replace(']','').split(',');
        treshold.forEach( (item,i) => {
          if (number > Number(item)) {
            value = color[i];
          }
        })
        if (value) {
          this.$store.commit('letEventSet', {events: [{target: item.target,prop: item.prop[0],value: value}], idDash: this.idDash,  });
        } else {
          this.$store.commit('letEventSet', {events: [{target: item.target,prop: item.prop[0],value: ''}], idDash: this.idDash,  });
        }
      });

            
    },
    setClick: function() {

      let tockens = this.$store.getters.getTockens(this.idDash);
      let tocken = {};

      Object.keys(tockens).forEach( i =>{
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        }
        if (tockens[i].elem == this.id && tockens[i].action == 'click') {
          this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: this.number, store: this.$store });
        } 
      })

      let events = this.$store.getters.getEvents({idDash: this.idDash, event: 'onclick', element: this.id, partelement: 'empty'});
      if (events.length != 0) {
        events.forEach( item => {
          if(item.action == 'set'){
            this.$store.commit('letEventSet', {events: events, idDash: this.idDash,  });
          } else if (item.action == 'go') {
            this.$store.commit('letEventGo', {event: item, idDash: this.idDash,  route: this.$router, store: this.$store });
            //this.$router.push(`/dashboards/${item.target.toLowerCase()}`);
          }
        })
      }
    }
  },
  mounted() {
    //  В первый раз раскомментить чтобы создать события для элемнета, а затем лучше закоментить чтобы каждый раз не обращаться к store
    this.$store.commit('setActions', {actions: this.actions, idDash: this.idDash, id: this.id });
  },
}


</script>

<style lang="scss" > 
  
    @import '../../sass/dashSingle.sass'

   
</style>