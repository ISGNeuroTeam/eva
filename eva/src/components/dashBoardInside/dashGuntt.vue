<template>
  <div 
    class="dash-guntt" 
  >
    <div class="legend-block">
      <div 
        v-for="i in legends.length" 
        :key="i"
        class="legends-itself"
      >
        <div 
          class="circle" 
          :style="{backgroundColor:colors[i-1]}"
        />
        <div class="text">
          {{ legends[i-1] }}
        </div>
      </div>
    </div>
    <div 
      class="guntt-block"
      :data-change="change"
    />
    <div 
      ref="tooltip"
      class="tooltipGuntt" 
      :style="{backgroundColor:colorFrom.backElement, border: `1px solid ${colorFrom.text}`}" 
    />
    <div
      v-show="noMsg" 
      class="errormsg"
    >
      {{ msgText }}
    </div>
  </div> 
</template>


<script>

import * as d3 from "d3"

export default {
  props: {  // переменные полученные от родителя
    idFrom: null,  // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда 
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null,  // цветовые переменные
    widthFrom: null, // ширина родительского компонента
    heightFrom: null, // высота родительского компонента
    timeFormatFrom: null, // настройки родительского компонента
    activeElemFrom: null,
    dataReport: null,
  },
  data () {
    return {
      actions: [
        {name: 'click',
          capture: []
        },
      ],
      msgText: 'Нет данных для отображения',
      noMsg: true,
      colors: [this.colorFrom.controls || this.colorFrom.$accent_ui_color,this.colorFrom.controlsActive || this.colorFrom.$primary_button_hover,'#660099','#3366FF','#e5194a','#fbbe18','#26295a','#228B22'],
      legends: [],
      firstTime: true // определяем первый ли раз зашли на страницу, ничего лучше не придумал
    } 
  },
  computed: {  // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    id: function() { 
      return this.idFrom
    },
    idDash: function() { 
      return this.idDashFrom
    },
    change: function() {
      if (this.dataRestFrom && Object.keys(this.dataRestFrom).length != 0 ){
      
      
        if( this.dataRestFrom[0].start_date && this.dataRestFrom[0].end_date) {

          if (this.dataReport) {
            
            if (this.activeElemFrom == this.id) {
              this.noMsg = false;
              this.prepareChart(this.dataRestFrom);
            } else {
             
              
              let graphics = d3.select(this.$el.querySelector('.guntt-block')).selectAll('svg').nodes(); // получаем область в которой будем рисовтаь график 
            
              if(graphics.length != 0){  // если график уже есть
                graphics[0].remove();  // удаляем его
              }

            }
          } else {
            this.noMsg = false;
            this.prepareChart(this.dataRestFrom);
          }
        }  else {
          this.msgText = 'Данные не подходят для построения диаграммы гантта',
          this.noMsg = true;
        } 
        
      } else {
        this.msgText = 'Нет данных  для отображения',
        this.noMsg = true;
      } 
      return true  
    },
  }, 
  watch: {
    // dataRestFrom: function(dataRest) {
        
    //   if(dataRest.length > 0) {
    //     if (dataRest[0].start_date && dataRest[0].end_date) {
    //       this.noMsg = false;
    //       this.prepareChart(dataRest);   
            
    //     } else {
    //       this.msgText = 'Данные не подходят для построения диаграммы гантта',
    //       this.noMsg = true;
    //     } 
    //   }else {
    //     this.msgText = 'Нет данных  для отображения',
    //     this.noMsg = true;
    //   } 
    // },
    colorFrom: function() {
      if(this.dataRestFrom.length > 0) {
        if (this.dataRestFrom[0].start_date && this.dataRestFrom[0].end_date) {
          if (this.dataReport) {
            
            if (this.activeElemFrom == this.id) {
              this.prepareChart(this.dataRestFrom);
            } else {
              
              
              let graphics = d3.select(this.$el.querySelector('.guntt-block')).selectAll('svg').nodes(); // получаем область в которой будем рисовтаь график 
            
              if(graphics.length != 0){  // если график уже есть
                graphics[0].remove();  // удаляем его
              }

            }
          } else {
            this.prepareChart(this.dataRestFrom);
          }
        } else {
          this.msgText = 'Данные не подходят для построения диаграммы гантта',
          this.noMsg = true;
        } 
      }else {
        this.msgText = 'Нет данных для отображения',
        this.noMsg = true;
      } 
    },
    timeFormatFrom: function() {
      if(this.dataRestFrom.length > 0) {
        if (this.dataRestFrom[0].start_date && this.dataRestFrom[0].end_date) {
          if (this.dataReport) {
            
            if (this.activeElemFrom == this.id) {
              this.prepareChart(this.dataRestFrom);
            } else {
              
              
              let graphics = d3.select(this.$el.querySelector('.guntt-block')).selectAll('svg').nodes(); // получаем область в которой будем рисовтаь график 
            
              if(graphics.length != 0){  // если график уже есть
                graphics[0].remove();  // удаляем его
              }

            }
          } else {
            this.prepareChart(this.dataRestFrom);
          }
        } else {
          this.msgText = 'Данные не подходят для построения диаграммы гантта',
          this.noMsg = true;
        } 
      }else {
        this.msgText = 'Нет данных для отображения',
        this.noMsg = true;
      } 
    },
    widthFrom: function() {
      if(this.dataRestFrom.length > 0) {
        if (this.dataRestFrom[0].start_date && this.dataRestFrom[0].end_date) {
          if (this.dataReport) {
            
            if (this.activeElemFrom == this.id) {
              this.prepareChart(this.dataRestFrom);
            } else {
              
              
              let graphics = d3.select(this.$el.querySelector('.guntt-block')).selectAll('svg').nodes(); // получаем область в которой будем рисовтаь график 
            
              if(graphics.length != 0){  // если график уже есть
                graphics[0].remove();  // удаляем его
              }

            }
          } else {
            this.prepareChart(this.dataRestFrom);
          }
        } 
      }
    },
    heightFrom: function() {
      if(this.dataRestFrom.length > 0) {
        if (this.dataRestFrom[0].start_date && this.dataRestFrom[0].end_date) {
          if (this.dataReport) {
            
            if (this.activeElemFrom == this.id) {
              this.prepareChart(this.dataRestFrom);
            } else {
              
              let graphics = d3.select(this.$el.querySelector('.guntt-block')).selectAll('svg').nodes(); // получаем область в которой будем рисовтаь график 
            
              if(graphics.length != 0){  // если график уже есть
                graphics[0].remove();  // удаляем его
              }

            }
          } else {
            this.prepareChart(this.dataRestFrom);
          }
        } 
      }
    }
  }, 
  methods: {
    prepareChart: function(dataRest) {

      let prom = new Promise( resolve => { // создаем promise чтобы затем отрисовать график асинхронно

        let sizeChart = {'width': 0,'height': 0};  // получаем размеры от родителя
        sizeChart['width'] = this.widthFrom;
        sizeChart['height'] = this.heightFrom;
        this.actions[0].capture = Object.keys(dataRest[0]);
        this.$store.commit('setActions', {actions: this.actions, idDash: this.idDash, id: this.id });
        resolve(sizeChart)

      })

      prom.then( sizeChart => { // как раз тут делаем асинхронность
        this.createChart(sizeChart,this,dataRest);
      })

      
      
    },
    createChart: function(sizeChart,that,dataRest) {


      let otstupBot = 30;
      if (screen.width <= 1600) {
        otstupBot = 10;
      }


      let margin = {top: 20, right: 20, bottom: otstupBot, left: 20},
        width = sizeChart.width - margin.left - margin.right,
        height = sizeChart.height - margin.top - margin.bottom,
        otstupLeft = 70,
        otstupRight = 80;


      if (screen.width > 1920) {
        otstupLeft = 90;
      }

      let data = [];
      dataRest.forEach( (item) => {
        data.push({...{},...item})
      })
    
      let graphics = d3.select(this.$el.querySelector('.guntt-block')).selectAll('svg').nodes(); // получаем область в которой будем рисовтаь график 
      

      if(graphics.length != 0){  // если график уже есть
        graphics[0].remove();  // удаляем его
      }

      let svg = d3.select(this.$el.querySelector('.guntt-block'))
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "guntt-svg");

               
      data.forEach( (item,i) => {
        let newDate = new Date(item.start_date*1000);
        data[i].start_date = `${newDate.getFullYear()}-${checkZero(newDate.getMonth()+1)}-${checkZero(newDate.getDate())} ${checkZero(newDate.getHours())}:${checkZero(newDate.getMinutes())}:${checkZero(newDate.getSeconds())}`;
        newDate = new Date(item.end_date*1000);
        data[i].end_date = `${newDate.getFullYear()}-${checkZero(newDate.getMonth()+1)}-${checkZero(newDate.getDate())} ${checkZero(newDate.getHours())}:${checkZero(newDate.getMinutes())}:${checkZero(newDate.getSeconds())}`;

      })
             
      let dateFormat = `%Y-%m-%d %H:%M:%S`;
      if (that.timeFormatFrom != '') {
        dateFormat = that.timeFormatFrom;
      }
                
               

      let x = d3.scaleTime()
        .domain([d3.min(data, function(d) {return new Date(d.start_date)}),
          d3.max(data, function(d) {return  new Date(d.end_date)})])
        .range([otstupLeft,width-otstupRight]);

          


      // рассчитываем набор фаз (состояний)
      let phases = [];
      let ids = [];
      data.forEach( ph => {
        if (ph.phase){
          if (!phases.includes(ph.phase)) {
            phases.push(ph.phase)
          }
        }
        if (!ids.includes(ph.id)) {
          ids.push(ph.id)
        }
                    
      })
      if (phases.length > 0) {
        this.legends = phases;
      }

      let otstupBottom =50;

      if (screen.width > 1920) {
        otstupBottom =60;
      }

      let barHeight = Math.round((height-otstupBottom)/ids.length);
            
      let ticks = x.ticks();
                      
      if (screen.width < 1920) {
        ticks = x.ticks().filter( (item,i) => {
          if (i == 0, i == x.ticks().length-1, i%2 == 0) {
            return item
          }
        })
      } 

      let otstupX = 0;

      if (screen.width < 1400) {
        otstupX = -10;
      }

      let deliter = 2;

      if ((width+ margin.left + margin.right) < 600) {
        deliter = 3;
      } 
      if ((width+ margin.left + margin.right) < 450) {
        deliter = 4;
      } 
      if ((width+ margin.left + margin.right) < 400) {
        deliter = 5;
      } 
      if ((width+ margin.left + margin.right) < 350) {
        deliter = 6;
      } 

      // добавляем ось X     
      let xAxis = svg.append("g")
        .attr("transform", `translate(0,${height-otstupBottom})`)
        .call(d3.axisBottom(x)
          .tickFormat(d3.timeFormat(dateFormat))
          .tickValues(
            x.ticks().filter( (item,i) => {
              if (i%deliter == 0) {
                return item
              }
            })
          )
           
        )
        .call(wrap)

      let otstupY = 10;

      if (screen.width > 1920) {
        otstupY = 15;
      }

      xAxis 
        .selectAll("line")
        .attr("y2", `-${height}`)
        .attr("opacity", "0.3");
      xAxis 
        .selectAll("text")
        .attr('class','text-x')
        .attr("transform", `translate(${otstupX},${otstupY})`)
        .style("color",this.colorFrom.text)
        .style("text-anchor", "center");

                
              

      //горизонатьные значения (id)
      let subjects = svg.append("g")
        .selectAll("rect")
        .data(ids)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d, i){
          return i*barHeight;
        })
        .attr("width", function(){
          return width;
        })
        .attr("height", barHeight)
        .attr("stroke", "none")
        .attr("opacity", 0.2);

      // сами строки данных относителньо времени
      let bars =svg.append('g')
        .selectAll("rect")
        .data(data)
        .enter();
                
      let lines = bars.append("rect")
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("x", function(d){
          return x(Date.parse(d.start_date));
        })
        .attr("y", function(d){
          let j = -1;
          ids.forEach( (item,i) => {
            if (item == d.id) {
              j = i;
            }
          })
          return j*barHeight
        })
        .attr("width", function(d){
          return (x(Date.parse(d.end_date))-x(Date.parse(d.start_date)));
        })
        .attr("height", barHeight)
        .attr("stroke", "none")
        .style("cursor",'pointer')
        .attr("fill", (d) => {
          let j = -1;
          phases.forEach( (item,i) => {
            if (item == d.phase) {
              j = i;
            }
          })
          
          return this.colors.filter(Boolean)[j]
        });
                                    

      // Tooltip

      let tooltipBlock = this.$refs.tooltip;

               

      lines.on('mouseover', function(event) {

        let tooltip = '';

        if (data[0].description) { 
          tooltip = transformDescription(event.description)
        } else {
          Object.keys(event).forEach( key => {
            tooltip += `<p class="row-toolrip"><span>${key}</span>: ${event[key]}</p>`;
          })
        }

        moveTooltip(event);

        tooltipBlock.innerHTML = tooltip;
        tooltipBlock.style.opacity = '0.9';
        tooltipBlock.style.visibility = 'visible';
      }).on('mousemove', function(event) {
        moveTooltip(event);

      }).on('mouseout', function() {
        tooltipBlock.style.opacity = '0';
        tooltipBlock.style.visibility = 'hidden';

      }).on('click', function (d)  { 
        return that.setClick(d)
      });


      let texts =  bars.append("text")
        .text(function(d){
          if (d.phase) {
            if((x(Date.parse(d.end_date))-x(Date.parse(d.start_date))) > d.phase.length*8) {
              return d.phase;
            }
          }
          return '';
        })
        .attr("x", function(d){
          return ( x(Date.parse(d.start_date))+(x(Date.parse(d.end_date))-x(Date.parse(d.start_date)))/2 );
        })
        .attr("y", function(d){
          let j = -1;
          ids.forEach( (item,i) => {
            if (item == d.id) {
              j = i;
            }
          })
          return j*barHeight+barHeight/2+3
        })
        .attr('class','text-bar')
        .attr("font-size", 11)
        .attr("text-anchor", "middle")
        .style("cursor",'pointer')
        .attr("fill", "#fff");

      texts.on('mouseover', function() {

        tooltipBlock.style.opacity = '0.9';
        tooltipBlock.style.visibility = 'visible';
      }).on('mousemove', function(event) {
        moveTooltip(event);
      }).on('mouseout', function() {
        tooltipBlock.style.opacity = '0';
        tooltipBlock.style.visibility = 'hidden';

      }).on('click', function (d)  {
        return that.setClick(d)
      });

            


      // подписи слева

      let currentPos = 0;

      let idsCaption = svg.append("g")
        .selectAll("text")
        .data(ids)
        .enter();



      idsCaption.append("text")
        .text(function(d){
          return checkCaption(d);
        })
        .attr("x", 10)
        .attr("y", function(d, i){
          if (i == 0){
            currentPos = barHeight/2+2;
          } else{
            currentPos += barHeight+2;
          }
          return currentPos
        })
        .attr('class','ids-caption')
        .attr("font-size", 11)
        .attr("text-anchor", "start")
        .style("opacity","0.8")
        .attr("fill", this.colorFrom.text);

            

      currentPos = 0
      
      idsCaption.append("line")
        .attr("x1", 0)
        .attr("x2", width-otstupRight)
        .attr("y1",function(d, i){
          let curPos = 0;
          if (i != ids.length-1) {
            curPos = currentPos + barHeight;
            currentPos += barHeight;
          } else {
            curPos = currentPos + barHeight;
            currentPos = 0;
          }
          return  curPos;
        })
        .attr("y2", function(){
          let curPos = 0;
          curPos = currentPos + barHeight;
          currentPos += barHeight;
          return  curPos;
        })
        .style("stroke", this.colorFrom.text) 
        .attr("opacity", "0.3");

            
                
      // линия отделяющяя подписи (ids) от блока данных

      svg.append("g") 
        .append("line")
        .attr("x1", otstupLeft)
        .attr("x2", otstupLeft)
        .attr("y1",0)
        .attr("y2", height-50)
        .style("stroke", "black") 
        .attr("opacity", "0.3");

      // линия отделяющяя блоки данных от легенды

      svg.append("g") 
        .append("line")
        .attr("x1", width-otstupRight)
        .attr("x2", width-otstupRight)
        .attr("y1",0)
        .attr("y2", height-50)
        .style("stroke", "black") 
        .attr("opacity", "0.3");

      // легенда


      function moveTooltip(event) {
        let x = d3.event.offsetY - 50;
        let y = d3.event.offsetX + 30;
        // if (y < 0) {
        //   y = 0;
        //   x += 5;
        // }
        // if(x-20+tooltipBlock.offsetWidth>width-otstupRight) {
        //   x = d3.event.layerX - 10 - tooltipBlock.offsetWidth;
        // }
        tooltipBlock.style.top = x+'px';
        tooltipBlock.style.left = y+'px';
      }

      function transformDescription(text) {
        let rows = text.split('\\n');
        rows = rows.map( item => {
          return `<p class="row-toolrip">${item}</p>`
        })
        //rows = '<div class = "tooltip-guntt">' + rows.join('') + '</div>';
        return rows.join('')  
      }

      function checkCaption(name) {
        if (name.length > 6) {  // если там больше 10 символов
          name = name.substring(0,6) + '...'; // обрезаем и добовляем троеточие
        }
        return name 
      }

      function checkZero(item) {
        if (item < 10) {  // если там больше 10 символов
          item = `0${item}`;
        }
        return item 
      }

      function wrap(text) {
        text.each(function() {
          let text = d3.select(this);
          let row = [];
          text.node().querySelectorAll('text').forEach( item => {
            row = item.innerHTML.split(' ').filter( rowItem => {
              if  (rowItem != '') {
                return rowItem
              }
            });
            if (row[1]) {
              row[0] = `<tspan x=0 y=10>${row[0]}</tspan>`;
              row[1] = `<tspan x=0 y=30>${row[1]}</tspan>`;
              item.innerHTML = row.join('');
            }
          })

        })

      }

    },
      
    setClick: function(item) {
  
      let tockens = this.$store.getters.getTockens(this.idDash);
      let tocken = {};

      Object.keys(tockens).forEach( i =>{
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        }
        if (tockens[i].elem == this.id && tockens[i].action == 'click') {
          this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: item[tockens[i].capture], store: this.$store });
        } 
      })

    },

  },
  mounted() {
    this.$emit('setVissible',this.id);
  } 
}


</script>

<style lang="scss" > 

    @import '../../sass/dashGuntt.sass'

</style>