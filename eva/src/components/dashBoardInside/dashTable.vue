<template>  
  <div 
    ref="tableBlock"
    class="table-block" 
    :data-change="change"
  > 
    <v-data-table
      v-show="!props.nodata"
      :ref="id"
      v-model="props.input"
      :headers="props.titles"
      :items.sync="props.itemsForTable"
      class="dash-table report-table"
      :data-id="id"
      item-key="none"
      :hide-default-footer="props.hideFooter"
      :footer-props="{
        itemsPerPageOptions: [100,500,1000,-1], 
      }"
      :height="height"
      fixed-header
      :style="{borderColor:colorFrom.border}"
      @current-items="updatePage"
    />
    <div 
      v-show="props.nodata"
      class="no-data-table"
    >
      {{ props.message }}
    </div>
  </div>
</template>



<script>

//import { setInterval } from 'timers';


export default {
  props: {
    dataRestFrom: null,
    shouldGet: null,
    colorFrom: null,
    idFrom: null,
    idDashFrom: null,
    heightFrom: null,
    dataReport: null,
    activeElemFrom: null,
    
  },
  data () {
    return {
      props: {
        titles: [],
        superheroes: [],
        nodata: true,
        message: 'Нет данных для отображения',
        hash: 0,
        actions: [
          {name: 'click',
            capture: []
          },
          {name: 'mouseover',
            capture: []
          },
        ],
        selected: {},
        justCreate: true,
        hideFooter: false,
        itemsForTable: []
      },
    }
  },
  computed: {
    id: function() { 
      return this.idFrom
    },
    idDash: function() { 
      return this.idDashFrom
    },
    change: function() {
      
      /*if (this.dataRestFrom && Object.keys(this.dataRestFrom).length != 0) {
        if (this.dataReport) {
          
          if (this.activeElemFrom == this.id) {
            this.getDataAsynchrony(this.dataRestFrom);
          } else {
            this.props.itemsForTable = [];
          }
        } else { //если данные есть!
          this.getDataAsynchrony(this.dataRestFrom);
        }
        
      }
      return true*/
    },
    color: function() {
      return this.colorFrom
    },
    height: function() {
      let otstup = 100;
      if (screen.width <= 1600) {
        otstup = 80;
      }
      if (screen.width <= 1400) {
        otstup = 70;
      }
      if(this.props.hideFooter) {
        otstup = 45;
      }
      if (this.dataReport) {
        otstup = otstup-30;
      }
      let height = this.heightFrom-otstup; // 120 это размер блока с пагинацией таблицы + шапка с настройками самого блока
      return height
    },
    lastResult: function() {
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.id});
      return options.lastResult
    },
 

  },
  watch: {
    color: function(color) {
      this.$refs.tableBlock.style.color = color.text;
      this.$refs.tableBlock.style.backgroundColor = color.backElement;
    },
  },
  methods: {

    getDataAsynchrony: function (data) {
      let prom = new Promise( (resolve) => {
        if(data.error) {
          this.props.message = data.error;
          this.props.nodata = true;
        } else {
          resolve(data)
        }
      })
      prom.then( (data) => {
        data.length <= 100 ? this.props.hideFooter = true : this.props.hideFooter = false;
        this.createTitles(data);
        this.createTockens(data);
        this.setColors();
        this.clearColor();
        this.setEventColor();
        if (this.props.justCreate) {
          this.selectRow();
          this.props.justCreate = false;
        }
            
        this.props.nodata = false;
        this.props.itemsForTable = data;
      })
    },


    createTitles: function(result) {

      let titles = Object.keys(result[0]).map( item => {
        return {text: item, value: item}
      });

      this.props.titles = titles;

    },
    createTockens: function(result) {
      let captures = Object.keys(result[0]);
      this.props.actions.forEach( (item,i) => {
        this.$set(this.props.actions[i],'capture',captures);
      });
    },
    selectRow: function() {
        
      document.querySelector(`[data-id=${this.id}]`).addEventListener('click', event => {
                          
                      
        if (event.target.tagName.toLowerCase() == "td") {
          if (event.target.parentElement.classList.contains('selected')) {
            event.target.parentElement.classList.remove('selected');
          } else {
            event.target.parentElement.parentElement.querySelectorAll('.selected').forEach( item => {
              item.classList.remove('selected');
              item.style =`background: transparent !important`;
            })
            event.target.parentElement.classList.add('selected');
          }

          let tockens = this.$store.getters.getTockens(this.idDash);
                                 
                                
          Object.keys(tockens).forEach( i =>{
                
            if (tockens[i].elem == this.id && tockens[i].action == 'click') {
              let row = [];
              let value = '';
              event.target.parentElement.childNodes.forEach( item => {
                row.push(item.textContent);
              })
              this.$refs[this.id].$el.querySelector('thead tr').childNodes.forEach( (item,j) => {
                if(item.textContent == tockens[i].capture){
                  value = row[j];
                }
              })

              this.$store.commit('setTocken', {tocken: tockens[i], idDash: this.idDash, value: value, store: this.$store });
            }

          })

          let events = this.$store.getters.getEvents({idDash: this.idDash, event: 'onclick', element: this.id, partelement: 'row'});

          if (events.length != 0) {
            events.forEach( item => {
              if(item.action == 'set'){
                this.$store.commit('letEventSet', {events: events, idDash: this.idDash });
              } else if (item.action == 'go') {

                this.$store.commit('letEventGo', {event: item, idDash: this.idDash, route: this.$router, store: this.$store });
               // this.$router.push(`/dashboards/${item.target.toLowerCase()}`);

              }

            });

          }

        }

      })
         
    },
    setColors: function() {
      
      let table = document.querySelector(`[data-id=${this.id}]`);
      
      let zagolovok = table.querySelector('thead');
      if (zagolovok != null) {
        zagolovok.style.color = this.color.text; 
      }
      table.addEventListener('mouseover', event => {
        if(event.target.tagName.toLowerCase() == 'td' && !event.target.parentElement.classList.contains('event')) {
          event.target.parentElement.style =`background: ${this.color.controls} !important;color:${this.color.back}`;
        }
      })
      table.addEventListener('mouseout', event => {
        if(event.target.tagName.toLowerCase() == 'td') {
          if (!event.target.parentElement.classList.contains('selected') && !event.target.parentElement.classList.contains('event')) {
            event.target.parentElement.style =`background: transparent !important;color:${this.color.text}`;
          }
            
        }
      })
              
    },
    clearColor: function() {
      let table = this.$refs[this.id].$el;
      table.querySelectorAll('tbody tr').forEach( itemRow => {
        itemRow.classList.remove('selected');
        itemRow.style.background = 'transparent';
        itemRow.style.color = this.color.text;
        itemRow.querySelectorAll('td').forEach( (itemTd) => { 
          itemTd.style.background = 'transparent';
          itemTd.style.color = 'inherit'; 
        });
        itemRow.classList.remove('event');
      })
    },
    setEventColor: function() {

               
         
      let events = this.$store.getters.getEvents({idDash: this.idDash, event: 'OnDataCompare', element: this.id});
      let table,column;
      let eventObj = {};

      events.forEach( (item,j) => {
        eventObj[j] = {};
        eventObj[j]['compare'] = item.compare;
        eventObj[j]['column'] = item.column;
        eventObj[j]['row'] = item.row;
        eventObj[j]['color'] = item.value[0]; 
        eventObj[j]['prop'] = item.prop[0];
        table = this.$refs[this.id].$el;
                  
        if (eventObj[j]['prop'] == 'rowcolor' || eventObj[j]['prop'] == 'columncolor' || eventObj[j]['prop'] == 'cellcolor') {
        
          let  readyTh = setTimeout( function tick()  {
            if (table.querySelectorAll('thead th').length != 0){
              clearTimeout(readyTh);
              let sp = 0;
              table.querySelectorAll('thead span').forEach( (itemSpan) => {
                if(itemSpan.innerText != 0) {
                  if (itemSpan.innerText == eventObj[j]['column']) {
                    column = sp;
                  }
                  sp ++;
                }  
              });
                                   
              table.querySelectorAll('tbody tr').forEach( itemRow => {
                itemRow.querySelectorAll('td').forEach( (itemTd,i) => {
                  if (i == column){
                    let needItem = null,row,k = -1;
                      
                    switch(eventObj[j]['compare']) {
                        
                    case 'equals':  
                            
                      if (itemTd.innerText == eventObj[j]['row']) {
                        needItem = itemRow;
                      }
                          
                      break

                    case 'over':  
                      if (itemTd.innerText > eventObj[j]['row']) {
                        needItem = itemRow;
                      }
                      break

                    case 'less':  
                      if (itemTd.innerText < eventObj[j]['row']) {
                        needItem = itemRow;
                      }
                      break

                    case 'in':  
                                                            
                      row = eventObj[j]['row'].replace(/\[|\]/g, '').split(',');
                      k = -1;
                      row.forEach( rowValue => {
                        if (itemTd.innerText == rowValue) {
                          k = 0;
                        }
                      })
                      if(k != -1){
                        needItem = itemRow;
                      }

                      break

                    case 'between': 

                      row = eventObj[j]['row'].replace(/\[|\]/g, '').split(','); 
                      if (itemTd.innerText > row[0] && itemTd.innerText < row[1]){
                        needItem = itemRow;
                      }
                      break

                    }
                                                
                    if(needItem != null){
                      needItem.classList.add('event');
                    }

                  } 
                });
              });
                                        
              if (table.querySelectorAll('.event').length > 0) {
                if (item.prop[0] == 'rowcolor') {
                    

                  table.querySelectorAll('.event').forEach( res => {
                    res.style.background = eventObj[j]['color'];
                    res.style.color = this.color.back;
                  })

                }  else if (item.prop[0] == 'cellcolor') {
                  table.querySelectorAll('.event').forEach( res => {
                    res.children[column].style.background = eventObj[j]['color'];
                    res.children[column].style.color = this.color.back;
                  })
                } else if (item.prop[0] == 'columncolor') {
                  table.querySelectorAll('tbody tr').forEach( itemRow => {
                    itemRow.children[column].style.background = eventObj[j]['color'];
                    itemRow.children[column].style.color = this.color.back;
                  });
                } 
              } 
                                       
            } else {
              readyTh = setTimeout(tick, 100); 
            }
          }.bind(this),0); 
                        
        }
                            
      });

    },
    updatePage: function() {
      if (this.$refs[this.id]){
        this.clearColor();
        this.setEventColor();
      }
    }

  },
  mounted() {
    this.$store.commit('setActions', {actions: this.props.actions, idDash: this.idDash, id: this.id });
    this.$refs.tableBlock.style.color = this.color.text;
    this.$refs.tableBlock.style.backgroundColor = this.color.backElement;
  }
}


</script>

<style lang="sass" > 
  
     @import '../../sass/dashTable.sass'

</style>