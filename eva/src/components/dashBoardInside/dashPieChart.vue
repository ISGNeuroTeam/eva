<template>
  <div 
    ref="pieChart"
    class="piechart-block"
  >
    <div 
      v-if="nodata"
      class="nodata" 
    > 
      {{ message }}
    </div>
    
    <div 
      v-show="dataLoading"
      class="loading"
    >
      <div class="preloader">
        <div class="stable" />
        <div class="dynamic" />
      </div>
      <p> Загружаю данные... </p>
    </div>
    <div 
      class="piechart-legend-block"
      :style="{flexFlow: positionLegends}"
    >
      <div  
        v-show="!dataLoading" 
        ref="piechartItself"
        :class="`dash-piechart ${this.idFrom}`" 
        :data-change="change"
      />
      <div 
        ref="legends"
        class="legend-block-pie"
      >
        <div 
          v-for="item in legends" 
          :key="item.label"
          class="legend-line" 
        >
          <div 
            class="square" 
            :style="{backgroundColor:item.color}"
          />
          <div 
            class="text" 
            :style="{color:color.text}"
          >
            {{ item.label }}
          </div>    
        </div>
      </div>
    </div>
  </div>  
</template>


<script>

import * as d3 from "d3";

export default {
  props: {  // переменные полученные от родителя
    idFrom: null,  // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда 
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null,  // цветовые переменные
    shouldFrom: null, // меняется в момент выбора источника данных у дашборда
    dataLoadingFrom: null,  // сообщает что компонент в режиме получения данных
    widthFrom: null, // ширина родительского компонента
    heightFrom: null, // высота родительского компонента
    activeElemFrom: null, // id активного элемента
    dataReport: null, // проверяет что элемент в исследовании данных
  },
  data () {
    return {
      actions: [
        {name: 'click',
          capture: []
        },
      ],
      nodata: true,
      message: 'Нет данных для отображения',
      colors: {
        neitral: [
          '#650075','#631B8F','#3A0085','#5F27FF','#6978FF',
          '#003CFF','#0070A3','#50C9FF','#AEFAFF','#FFFFFF',
          '#CCCC00','#CC0000','#9933FF','#0099CC','#009966',
          '#FF4500','#FFC125','#FF6A6A','#483D8B','#2F4F4F'
        ],
        indicted: [
          '#FF7F37','#EB2F2F','#920000','#600000','#D34C00',
          '#660099','#3366FF','#e5194a','#fbbe18','#26295a',
          '#CCCC00','#CC0000','#9933FF','#0099CC','#009966',
          '#FF4500','#FFC125','#FF6A6A','#483D8B','#2F4F4F'
        ],
        custom: []
      },
      legends: [],
      positionLegends: 'row nowrap',
      selectedValue: [],
      timeout: '',
      tolate: false,
    } 
  },
  computed: {  // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    dashOptions(){
      return this.$store.getters.getOptions({
        idDash: this.idDashFrom, 
        id: this.idFrom
      })
    },
    dataRest: function() {
      return this.dataRestFrom
    },
    color: function() {
      return this.colorFrom
    },
    dataLoading: function() {
      return this.dataLoadingFrom
    },
    dashSize() {
      return {
        width: this.widthFrom,
        height: this.heightFrom
      }
    },
    change: function() {
      if (this.dataRestFrom && Object.keys(this.dataRestFrom).length && this.dashSize ) {
        let graphics = d3.select(this.$el.querySelector(`.${this.idFrom}`)).selectAll('svg').nodes();
        if(graphics.length != 0){  
          graphics[0].remove(); 
          this.createPieChartDash();
        } else {
          this.createPieChartDash()
        }
      }
      return true  
    },
  },  
  methods: {
    setMetrics(){
      this.$store.commit('setMetricsPie', {metrics: Object.keys(this.dataRestFrom[0]), idDash: this.idDashFrom, id: this.idFrom });
      this.$store.commit('setThemePie', {
        themes: this.colors,
        idDash: this.idDashFrom, 
        id: this.idFrom
      });
    },
    createPieChartDash: function() {

      if(this.dataRestFrom.error) {  // смотрим если с ошибкой
        this.message = this.dataRestFrom.error; // то выводим сообщение о ошибке
      } 

      let showlegend = this.dashOptions.showlegend;

      if (showlegend == undefined) {
        showlegend = true;
      }

      let positionlegend = this.dashOptions.positionlegend;

      if (positionlegend == undefined) {
        positionlegend = 'right'
      }

      let colorsPie = this.dashOptions.colorsPie;

      // SETTING DEFAULT COLORS
      if (colorsPie == undefined) {
        colorsPie = {
          theme: 'neitral',
          colors: '',
          nametheme: '',
        }
      }

      if (this.dashOptions.themes)  {
        this.colors = this.dashOptions.themes;
      }

      let onlyNum = true;

      let metrics = this.dashOptions.metricsRelation.relations;

      typeof(this.dataRestFrom[0][metrics[1]]) != 'number' ? onlyNum = false : false

      if (onlyNum){  // если все-таки число
        this.nodata = false; // то убираем соощение о отсутствии данных
        if (this.dataRestFrom.length > 20) {  // если элемнетов больше 20
          this.nodata = true;  // показываем сообщение о некорректности данных
          this.legends = [];
          this.message = "К сожалению данных слишком много для построения диаграммы";  // выводим сообщение
          d3.select(this.$el.querySelector(`.${this.idFrom}`)).selectAll('svg').remove(); // и еще график очищаем, чтобы не мешался
        } else {
          this.createLegend(this.dataRestFrom,metrics,showlegend,colorsPie);
          let legendsSize = {};
          if (this.legends.length > 0) {
            let timeOut = setTimeout( function tick() {  // важно чтобы наш график построился толкьо после того когда создался блок с легендой
                
              if (this.$refs.legends.getBoundingClientRect().width != 0) { 
                legendsSize = {width: Math.round(this.$refs.legends.getBoundingClientRect().width), height: Math.round(this.$refs.legends.getBoundingClientRect().height)};
                this.createPieChart(this.dataRestFrom, this, this.dashSize, metrics, legendsSize, positionlegend, colorsPie); // и собственно создаем график
                clearTimeout(timeOut);
              } else {
                timeOut = setTimeout(tick.bind(this), 100); 
              }
            }.bind(this), 0);

          } else {
            legendsSize = {width: 0, height: 0};
            this.createPieChart(this.dataRestFrom,this,this.dashSize, metrics, legendsSize, positionlegend, colorsPie); // и собственно создаем график
          }
        }
      } else {  // если первое значение первого элемнета (подразумеваем что это time не число)
        this.nodata = true;  // показываем сообщение о некорректности данных
        this.message = "К сожалению данные не подходят к диаграмме";  // выводим сообщение
        this.legends = [];
        d3.select(this.$el.querySelector(`.${this.idFrom}`)).selectAll('svg').remove(); // и еще график очищаем, чтобы не мешался
      }
    },

    createLegend: function(data,metrics,showlegend,colorsPie) {
      this.legends = [];
      if (showlegend) {
        data.forEach( (item,i) => {
          this.legends.push({color: this.colors[colorsPie.theme][i], label: `#${item[metrics[0]]} - ${item[metrics[1]]}%`})
        })
      }
    },

    createPieChart: function (dataFrom,that,sizeLine,metrics,legendsSize,positionlegend,colorsPie) {  // создает диаграмму
      d3.select(this.$el.querySelector(`.${this.idFrom}`)).selectAll('svg').remove();
      let width = sizeLine['width']-40; // отступ по бокам
      let height = sizeLine['height']-35; // минус шапка
      let margin = 40; // отступ от контейнера

      switch(positionlegend ) {

        case 'right':
          this.positionLegends = 'row nowrap';
          width = width - legendsSize.width;
          break

        case 'left':
          this.positionLegends = 'row-reverse nowrap';
          width = width - legendsSize.width;
          break

        case 'top':
          this.positionLegends = 'column-reverse nowrap';
          height = height - legendsSize.height - 40;  // 40 - margin у legends
          break

        case 'bottom':
          this.positionLegends = 'column nowrap';
          height = height - legendsSize.height - 40;
          break
  
      }

      let radius = Math.min(width, height) / 2 - margin // радиус диаграммы это половина длины или ширины, смотря что меньше и еще отступ отнимаем

      let svg = d3.select(`.${this.idFrom}`)  // добовляем svg объект в нужный div
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      let data = {};

      let selectedDefault = [];

      dataFrom.forEach( item => {
        data[item[metrics[0]]] = item[metrics[1]];
        selectedDefault.push(item[metrics[2]])
      });

      let color = d3.scaleOrdinal() // устанавливаем цветовую схему для pie chart
        .domain(data)
        .range(that.colors[colorsPie.theme])

      // let tooltip = d3.select(this.$el.querySelector(`.${this.idFrom}`))
      //   .append("div")
      //   .attr("class", "tooltip")
      //   .style("color",this.colors.text)
      //   .style("background",this.color.backElement)
      //   .style('border-color',this.colors.text)
      //   .style('z-index','2')
      //   .style("opacity","0")
      //   .style("visibility","hidden")
      //   .text('');
      let pie = d3.pie()  // вычисляем позицию каждого кусочка диаграммы
        .value(function(d) {return d.value; })
      let data_ready = pie(d3.entries(data))

      let selectedValue = this.selectedValue

      svg   // строим круговую диаграмму  - по сути каждая часть это жлемент path нарисованный через arc функцию
        .selectAll('pies')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
          .innerRadius(0)
          .outerRadius(radius)
        )
        .attr('class',function(d) {
          let index = selectedValue.indexOf(`(${d.data.key},${d.data.value})`);
          if (index != -1) {
            return 'piepart piepartSelect'
          } else {
            return 'piepart'
          }
        })
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", that.color.text)
        .style("stroke-width", "1px")
        .on('click', function(d) {
          let selected = false;
          if (this.classList.contains('piepartSelect')) {
            this.classList.remove('piepartSelect');
            // tooltip
            //   .style("opacity","0")
            //   .style("visibility","hidden");
            selected = false;
          } else {
            this.classList.add('piepartSelect');
            // tooltip
            //   .style("opacity","1")
            //   .style("visibility","visible")
            //   .style("top", (event.layerY-40)+"px")
            //   .style("left",(event.layerX+15)+"px");
            selected = true;
          }
          // tooltip
          //   .attr('index',d.index)
          //   .html(`#${d.data.key} - ${d.data.value}%`);

          return that.setClick(d,selected)
        })
    },
    setClick: function(part,selected) {
      if (selected) {
        this.selectedValue.push(`(${part.data.key},${part.data.value})`);
      } else {
        let index = this.selectedValue.indexOf(`(${part.data.key},${part.data.value})`);
        this.selectedValue.splice(index,1);
      }
      if (!this.tolate) {
        this.tolate = true;
        this.timeout = setTimeout( () => {
          this.tolate = false;
          this.setTocken();
        },1500)
      }
    },
    setTocken: function() {
      let value = '';
      if (this.selectedValue.length > 1) {
        value = '[';
        this.selectedValue.forEach( (item,i) => {
          value += item;
          if (i != this.selectedValue.length-1) {
            value += ','
          }
        })
        value += ']';
      } else if (this.selectedValue.length == 1) {
        value = this.selectedValue[0]
      } 
      let tockens = this.$store.getters.getTockens(this.idDashFrom);
      let tocken = {};

      Object.keys(tockens).forEach( i =>{
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture
        }
        if (tockens[i].elem == this.idFrom && tockens[i].action == 'click') {
          this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDashFrom, value: value, store: this.$store });
        } 
      })

    }
  },
  mounted() {
    this.$store.commit('setActions', {actions: this.actions, idDash: this.idDashFrom, id: this.idFrom });
  },
  beforeUpdate() {
    this.setMetrics()
  }
}

</script>

<style lang="sass" > 
  
    @import '../../sass/dashPieChart.sass'

   
</style>