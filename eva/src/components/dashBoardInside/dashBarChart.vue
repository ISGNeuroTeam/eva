<template>
  <div class="dash-barchart-block">
    <div class="dash-barchart" :data-status="change">
      <p v-if="nodata" class="nodata">
        {{ nodataText }}
      </p>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: {
    // переменные полученные от родителя
    idFrom: null, // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null, // цветовые переменные
    widthFrom: null,
    heightFrom: null,
    activeElemFrom: null,
    dataReport: null,
  },
  data() {
    return {
      actions: [{ name: 'click', capture: ['x', 'y'] }],
      nodata: true,
      nodataText: 'Нет данных для отображения',
      // bar: [
      //   {
      //     '_time': 'spider-man',
      //     'value': 300
      //   },
      //   {
      //     '_time': 'batman',
      //     'value': 400
      //   },
      //   {
      //     '_time': 'supermen',
      //     'value': 500
      //   },
      //   {
      //     '_time': 'doomsday',
      //     'value': 600
      //   },
      // ],
      // bar2: [
      //   {
      //     'group': 'mans',
      //     'spider-man': 100,
      //     'batman': 200,
      //     'supermen': 300,
      //   },
      //   {
      //     'group': 'womans',
      //     'spider-man': 150,
      //     'batman': 150,
      //     'supermen': 300,
      //   },
      //   {
      //     'group': 'heroes',
      //     'spider-man': 450,
      //     'batman': 75,
      //     'supermen': 75,
      //   },
      // ],
      stacked: false,
    };
  },
  computed: {
    // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    id: function () {
      return this.idFrom;
    },
    idDash: function () {
      return this.idDashFrom;
    },
    // dataRest: function() {
    //   return this.dataRestFrom
    // },
    color: function () {
      return this.colorFrom;
    },
    width: function () {
      return this.widthFrom;
    },
    height: function () {
      return this.heightFrom;
    },
    // prepareBarChart: function() {

    //   if (this.width != 0 && this.height != 0 && this.dataRest.length > 0) {   // если размеры получены выше нуля и  если данные от родителя тоже пришли
    //     this.getDataAsynchrony(); // вызываем функцию в которой будет происходить асинхронная отрисовка графика
    //   }

    //   return 'done'
    // },
    change: function () {
      if (
        this.dataRestFrom &&
        Object.keys(this.dataRestFrom).length !== 0 &&
        this.width !== 0 &&
        this.height !== 0
      ) {
        if (this.dataReport) {
          if (this.activeElemFrom === this.id) {
            this.getDataAsynchrony();
          } else {
            d3.select(this.$el.querySelector('.dash-barchart'))
              .selectAll('svg')
              .remove();
            d3.select(this.$el.querySelector('.dash-barchart'))
              .selectAll('.tooltip')
              .remove();
          }
        } else {
          this.getDataAsynchrony();
        }
      }
      return true;
    },
  },
  mounted() {
    //  В первый раз раскомментить чтобы создать события для элемнета, а затем лучше закоментить чтобы каждый раз не обращаться к store
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
  },
  methods: {
    getDataAsynchrony: function () {
      let prom = new Promise((resolve) => {
        // создаем promise чтобы затем отрисовать график асинхронно

        let otstupBottom = 55;
        if (screen.width <= 1600) {
          otstupBottom = 30;
        }

        let sizeLine = { width: 0, height: 0 }; // получаем размеры от родителя
        sizeLine['width'] = this.width;
        sizeLine['height'] = this.height - otstupBottom;

        if (this.dataRestFrom.error) {
          // сомтрим если с ошибкой
          this.nodataText = this.dataRestFrom.error; // то выводим сообщение о ошибке
          this.nodata = true;
        } else {
          // если нет
          resolve(sizeLine);
        }
      });

      prom.then((sizeLine) => {
        // как раз тут делаем асинхронность
        this.createBarChart(this, sizeLine);
      });
    },
    createBarChart: function (that, sizeLine) {
      let data = this.dataRestFrom;

      this.nodata = false;

      //let max = 0;

      let otstupTop = 20;
      if (screen.width <= 1600) {
        otstupTop = 10;
      }

      // устанавливаем размер и отступы графика
      let margin = { top: otstupTop, right: 20, bottom: 40, left: 30 },
        width = sizeLine.width - margin.left - margin.right - 40,
        height = sizeLine.height - margin.top - margin.bottom;

      d3.select(this.$el.querySelector('.dash-barchart'))
        .selectAll('svg')
        .remove();
      d3.select(this.$el.querySelector('.dash-barchart'))
        .selectAll('.tooltip')
        .remove();

      // добовляем svg элемент на страницу
      let svg = d3
        .select(this.$el.querySelector('.dash-barchart'))
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // создаем область графика, все-что вне этой области не будет отрисованно
      svg
        .append('defs')
        .append('svg:clipPath')
        .attr('id', `clip-${this.id}`)
        .append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('x', 0)
        .attr('y', 0);

      let xMetric = Object.keys(data[0])[0];
      let yMetric = Object.keys(data[0])[1];

      let time = false;

      if (
        this.dataRestFrom[0][xMetric] > 1000000000 &&
        this.dataRestFrom[0][xMetric] < 2000000000
      ) {
        time = true;
      }

      let deliter = 2;
      if (width + margin.left + margin.right < 500) {
        deliter = 3;
      }
      if (width + margin.left + margin.right < 400) {
        deliter = 4;
      }
      if (width + margin.left + margin.right < 300) {
        deliter = 5;
      }
      if (width + margin.left + margin.right < 250) {
        deliter = 6;
      }

      let secondTransf = 1;

      if (time) {
        secondTransf = 1000;
      }

      //добавляем ось X
      let x = d3
        .scaleBand()
        .range([0, width])
        .domain(
          data.map(function (d) {
            return d[xMetric];
          })
        );

      let z;
      if (time) {
        // Добавляем ось для bar chart, чтобы использовать его метод расчета ширины столбцов
        z = d3
          .scaleBand()
          .range([0, width])
          .domain(
            data.map(function (d) {
              return d[xMetric] * secondTransf;
            })
          );

        // добавляем ось X
        x = d3
          .scaleTime()
          .domain(
            d3.extent(data, function (d) {
              return new Date(d[xMetric] * secondTransf);
            })
          )
          .range([0, width]);
      } else {
        // добавляем ось X
        x = d3
          .scaleBand()
          .range([0, width])
          .domain(
            data.map(function (d) {
              return d[xMetric] * secondTransf;
            })
          );
      }

      if (time) {
        svg
          .append('g')
          .attr('class', 'xAxis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(
            d3
              .axisBottom(x)
              .tickFormat(d3.timeFormat('%d-%m-%Y '))
              .tickValues(
                x.ticks().filter((item, i) => {
                  if (i % deliter === 0) {
                    return item;
                  }
                })
              )
          );
      } else {
        svg
          .append('g')
          .attr('class', 'xAxis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(
            d3.axisBottom(x).tickValues(
              x.domain().filter((item, i) => {
                if (i % deliter === 0) {
                  return item;
                }
              })
            )
          );
      }

      let max = d3.max(data, function (d) {
        return +d[yMetric];
      });

      let min = d3.min(data, function (d) {
        return d[yMetric];
      });

      let maxYTop = max + 0.1 * Math.abs(max);
      let minYBottom = min - 0.1 * Math.abs(min);

      let tickvals;
      if (minYBottom === maxYTop) {
        tickvals = [minYBottom];
      } else {
        if (minYBottom < 0) {
          tickvals = [minYBottom, 0, maxYTop];
        } else {
          tickvals = [minYBottom, maxYTop];
        }
      }

      let y = d3
        .scaleLinear()
        .domain([minYBottom, maxYTop])
        .range([height, 20]);

      // добавляем ось Y
      svg.append('g').call(d3.axisLeft(y).tickValues(tickvals));

      let negative = false;
      if (min < 0) {
        negative = true;
      }

      // создаем tooltip
      let tooltip = d3
        .select(this.$el.querySelector('.dash-barchart'))
        .append('div')
        .attr('class', `tooltip`)
        .style('color', this.color.text)
        .style('background', this.color.backElement)
        .style('border-color', this.color.text)
        .style('z-index', '2')
        .text('');

      let toolTopBlock = tooltip.nodes()[0];

      svg
        .append('g') // основная линия графика
        .attr('clip-path', `url(#clip-${this.id})`)
        .selectAll(`bar-${this.id}`) // добовляем сами столбики
        .data(data)
        .enter()
        .append('rect')
        .attr('x', function (d) {
          return x(d[xMetric] * secondTransf);
        })
        .attr('y', function (d) {
          if (negative) {
            if (d[yMetric] > 0) {
              return y(0) - Math.abs(y(d[yMetric]) - y(0));
            } else {
              return y(0);
            }
          } else {
            return y(d[yMetric]);
          }
        })
        .attr('width', function () {
          if (time) {
            return z.bandwidth();
          } else {
            return x.bandwidth();
          }
        })
        .attr('height', function (d) {
          if (d[yMetric] === 0) {
            return 0;
          }
          if (negative) {
            return Math.abs(y(d[yMetric]) - y(0));
          } else {
            return height - y(d[yMetric]);
          }
        })
        .attr('fill', this.color.controls)
        .on('click', function (d) {
          return that.setClick({ x: d[xMetric], y: d[yMetric] });
        })
        .on('mouseover', function (d) {
          let xVal = d[xMetric];
          if (time) {
            xVal = new Date(d[xMetric] * secondTransf);
            xVal = `${xVal.getDate()}-${
              xVal.getMonth() + 1
            }-${xVal.getFullYear()}`;
          }
          let text = '';
          text += `<p><span>${xMetric}</span> : ${xVal}</p>`;
          text += `<p><span>${yMetric}</span> : ${d[yMetric]}</p>`;

          tooltip
            .style('opacity', '1')
            .style('visibility', 'visible')
            .html(text)
            .style('top', event.layerY - 40 + 'px')
            .style('right', 'auto')
            .style('left', event.layerX + 15 + 'px');
          if (event.layerX + 100 > width) {
            tooltip
              .style('left', 'auto')
              .style('right', width - event.layerX + 100 + 'px');
          }
          if (event.layerY - 40 + toolTopBlock.offsetHeight > height) {
            tooltip.style(
              'top',
              event.layerY - 10 - toolTopBlock.offsetHeight + 'px'
            );
          }
        }) // при наведении мышки точка появляется
        .on('mouseout', function () {
          tooltip.style('opacity', '0').style('visibility', 'hidden');
        }); // при уводе мышки исчезает, только если это не точка выходящяя порог
    },
    setClick: function (item) {
      let tockens = this.$store.getters.getTockens(this.idDash);
      let tocken = {};

      Object.keys(tockens).forEach((i) => {
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        };
        if (tockens[i].elem === this.id && tockens[i].action === 'click') {
          this.$store.commit('setTocken', {
            tocken: tocken,
            idDash: this.idDash,
            value: item[tockens[i].capture],
            store: this.$store,
          });
        }
      });

      let events = this.$store.getters.getEvents({
        idDash: this.idDash,
        event: 'onclick',
        element: this.id,
        partelement: 'empty',
      });

      if (events.length !== 0) {
        events.forEach((item) => {
          if (item.action === 'set') {
            this.$store.commit('letEventSet', {
              events: events,
              idDash: this.idDash,
            });
          } else if (item.action === 'go') {
            this.$store.commit('letEventGo', {
              event: item,
              idDash: this.idDash,
              route: this.$router,
              store: this.$store,
            });
          }
        });
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashBarChart.sass';
</style>
