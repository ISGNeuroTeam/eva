<template>
  <div class="dash-barchart-block">
    <div
      class="dash-barchart"
      :data-status="change"
    >
      <p
        v-if="nodata"
        class="nodata"
      >
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
    idFrom: {
      type: String,
      required: true,
    }, // id элемнета (table, graph-2)
    idDashFrom: {
      type: String,
      required: true,
    }, // id дашборда
    dataRestFrom: {
      type: Array,
      required: true,
    }, // данные полученые после выполнения запроса
    colorFrom: {
      type: Object,
      required: true,
    }, // цветовые переменные
    widthFrom: {
      type: Number,
      required: true,
    },
    heightFrom: {
      type: Number,
      required: true,
    },
    activeElemFrom: {
      type: String,
      required: true,
    },
    dataReport: {
      type: Boolean,
      required: true,
    },
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
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    color() {
      return this.colorFrom;
    },
    width() {
      return this.widthFrom;
    },
    height() {
      return this.heightFrom;
    },
    change() {
      if (
        this.dataRestFrom
        && Object.keys(this.dataRestFrom).length !== 0
        && this.width !== 0
        && this.height !== 0
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
    //  В первый раз раскомментить чтобы создать события для элемнета,
    //  а затем лучше закоментить чтобы каждый раз не обращаться к store
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
  },
  methods: {
    getDataAsynchrony() {
      const prom = new Promise((resolve) => {
        // создаем promise чтобы затем отрисовать график асинхронно

        let otstupBottom = 55;
        if (window.screen.width <= 1600) {
          otstupBottom = 30;
        }

        const sizeLine = { width: 0, height: 0 }; // получаем размеры от родителя
        sizeLine.width = this.width;
        sizeLine.height = this.height - otstupBottom;

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
    createBarChart(that, sizeLine) {
      const data = this.dataRestFrom;

      this.nodata = false;

      // let max = 0;

      let otstupTop = 20;
      if (window.screen.width <= 1600) {
        otstupTop = 10;
      }

      // устанавливаем размер и отступы графика
      const margin = {
        top: otstupTop, right: 20, bottom: 40, left: 30,
      };
      const width = sizeLine.width - margin.left - margin.right - 40;
      const height = sizeLine.height - margin.top - margin.bottom;

      d3.select(this.$el.querySelector('.dash-barchart'))
        .selectAll('svg')
        .remove();
      d3.select(this.$el.querySelector('.dash-barchart'))
        .selectAll('.tooltip')
        .remove();

      // добовляем svg элемент на страницу
      const svg = d3
        .select(this.$el.querySelector('.dash-barchart'))
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

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

      const xMetric = Object.keys(data[0])[0];
      const yMetric = Object.keys(data[0])[1];

      let time = false;

      if (
        this.dataRestFrom[0][xMetric] > 1000000000
        && this.dataRestFrom[0][xMetric] < 2000000000
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

      // добавляем ось X
      let x = d3
        .scaleBand()
        .range([0, width])
        .domain(
          data.map((d) => d[xMetric]),
        );

      let z;
      if (time) {
        // Добавляем ось для bar chart, чтобы использовать его метод расчета ширины столбцов
        z = d3
          .scaleBand()
          .range([0, width])
          .domain(
            data.map((d) => d[xMetric] * secondTransf),
          );

        // добавляем ось X
        x = d3
          .scaleTime()
          .domain(
            d3.extent(data, (d) => new Date(d[xMetric] * secondTransf)),
          )
          .range([0, width]);
      } else {
        // добавляем ось X
        x = d3
          .scaleBand()
          .range([0, width])
          .domain(
            data.map((d) => d[xMetric] * secondTransf),
          );
      }

      if (time) {
        svg
          .append('g')
          .attr('class', 'xAxis')
          .attr('transform', `translate(0,${height})`)
          .call(
            d3
              .axisBottom(x)
              .tickFormat(d3.timeFormat('%d-%m-%Y '))
              .tickValues(
                x.ticks().filter((item, i) => i % deliter === 0),
              ),
          );
      } else {
        svg
          .append('g')
          .attr('class', 'xAxis')
          .attr('transform', `translate(0,${height})`)
          .call(
            d3.axisBottom(x).tickValues(
              x.domain().filter((item, i) => i % deliter === 0),
            ),
          );
      }

      const max = d3.max(data, (d) => +d[yMetric]);

      const min = d3.min(data, (d) => d[yMetric]);

      const maxYTop = max + 0.1 * Math.abs(max);
      const minYBottom = min - 0.1 * Math.abs(min);

      let tickvals;
      if (minYBottom === maxYTop) {
        tickvals = [minYBottom];
      } else if (minYBottom < 0) {
        tickvals = [minYBottom, 0, maxYTop];
      } else {
        tickvals = [minYBottom, maxYTop];
      }

      const y = d3
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
      const tooltip = d3
        .select(this.$el.querySelector('.dash-barchart'))
        .append('div')
        .attr('class', 'tooltip')
        .style('color', this.color.text)
        .style('background', this.color.backElement)
        .style('border-color', this.color.text)
        .style('z-index', '2')
        .text('');

      const toolTopBlock = tooltip.nodes()[0];

      svg
        .append('g') // основная линия графика
        .attr('clip-path', `url(#clip-${this.id})`)
        .selectAll(`bar-${this.id}`) // добовляем сами столбики
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d) => x(d[xMetric] * secondTransf))
        .attr('y', (d) => {
          if (negative) {
            if (d[yMetric] > 0) {
              return y(0) - Math.abs(y(d[yMetric]) - y(0));
            }
            return y(0);
          }
          return y(d[yMetric]);
        })
        .attr('width', () => {
          if (time) {
            return z.bandwidth();
          }
          return x.bandwidth();
        })
        .attr('height', (d) => {
          if (d[yMetric] === 0) {
            return 0;
          }
          if (negative) {
            return Math.abs(y(d[yMetric]) - y(0));
          }
          return height - y(d[yMetric]);
        })
        .attr('fill', this.color.controls)
        .on('click', (d) => that.setClick({ x: d[xMetric], y: d[yMetric] }))
        .on('mouseover', (d) => {
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
            // eslint-disable-next-line no-restricted-globals
            .style('top', `${event.layerY - 40}px`)
            .style('right', 'auto')
            // eslint-disable-next-line no-restricted-globals
            .style('left', `${event.layerX + 15}px`);
          // eslint-disable-next-line no-restricted-globals
          if (event.layerX + 100 > width) {
            tooltip
              .style('left', 'auto')
              // eslint-disable-next-line no-restricted-globals
              .style('right', `${width - event.layerX + 100}px`);
          }
          // eslint-disable-next-line no-restricted-globals
          if (event.layerY - 40 + toolTopBlock.offsetHeight > height) {
            tooltip.style(
              'top',
              // eslint-disable-next-line no-restricted-globals
              `${event.layerY - 10 - toolTopBlock.offsetHeight}px`,
            );
          }
        }) // при наведении мышки точка появляется
        .on('mouseout', () => {
          tooltip.style('opacity', '0').style('visibility', 'hidden');
        }); // при уводе мышки исчезает, только если это не точка выходящяя порог
    },
    getEvents({ event, partelement }) {
      let result = [];
      if (!this.$store.state[this.idDash].events) {
        this.$store.commit('setState', [{
          object: this.$store.state[this.idDash],
          prop: 'events',
          value: [],
        }]);
        return [];
      }
      if (partelement) {
        result = this.$store.state[this.idDash].events.filter((item) => (
          item.event === event
          && item.element === this.id
          && item.partelement === partelement
        ));
      } else {
        result = this.$store.state[this.idDash].events.filter(
          (item) => item.event === event
            && item.target === this.id,
        );
      }
      return result;
    },
    setClick(item) {
      const { tockens } = this.$store.state[this.idDash];
      let tocken = {};

      Object.keys(tockens).forEach((i) => {
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        };
        if (tockens[i].elem === this.id && tockens[i].action === 'click') {
          this.$store.commit('setTocken', {
            token: tocken,
            idDash: this.idDash,
            value: item[tockens[i].capture],
            store: this.$store,
          });
        }
      });

      const events = this.getEvents({
        event: 'onclick',
        partelement: 'empty',
      });

      if (events.length !== 0) {
        events.forEach((event) => {
          if (event.action === 'set') {
            this.$store.commit('letEventSet', {
              events,
              idDash: this.idDash,
            });
          } else if (event.action === 'go') {
            this.$store.dispatch('letEventGo', {
              event,
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
