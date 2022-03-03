<template>
  <div
    ref="lineChart"
    class="graph-block"
  >
    <div
      v-if="props.nodata"
      class="nodata"
    >
      {{ props.message }}
    </div>
    <div
      v-show="!dataLoading"
      :class="props.class"
      class="dash-graph report-lineChart"
      :data-change="change"
    />
    <div
      v-show="dataLoading"
      class="loading"
    >
      <div class="preloader">
        <div class="stable" />
        <div class="dynamic" />
      </div>
      <p>Загружаю данные...</p>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: {
    dataRestFrom: null,
    colorFrom: null,
    widthFrom: null,
    heightFrom: null,
    idFrom: null,
    idDashFrom: null,
    dataLoadingFrom: null,
    activeElemFrom: null,
    dataReport: null,
  },
  data() {
    return {
      props: {
        id: '',
        result: [],
        loading: false,
        nodata: true,
        message: 'Нет данных для отображения',
        class: '',
        hash: '',
        actions: [
          {
            name: 'click',
            capture: ['pointX', 'pointY'],
          },
          {
            name: 'select',
            capture: ['start', 'end'],
          },
        ],
      },
    };
  },
  computed: {
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.id, idDash: this.idDash });
      }

      if (!this.dashFromStore?.options.pinned) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pinned',
          value: false,
        }]);
      }

      if (!this.dashFromStore.options.lastDot) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'lastDot',
          value: false,
        }]);
      }
      if (!this.dashFromStore.options.stringOX) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'stringOX',
          value: false,
        }]);
      }
      if (!this.dashFromStore?.options.united) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'united',
          value: false,
        }]);
      }

      return this.dashFromStore.options;
    },
    // dataRest: function() {
    //   return this.dataRestFrom
    // },
    color() {
      return this.colorFrom;
    },
    dataLoading() {
      return this.dataLoadingFrom;
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
            const graphics = d3
              .select(this.$el.querySelector('.dash-graph'))
              .selectAll('svg')
              .nodes();
            if (graphics.length !== 0) {
              // если график уже есть
              graphics[0].remove(); // удаляем его
            }
          }
        } else {
          this.getDataAsynchrony();
        }
      }
      return true;
    },
    getTockens() {
      return this.$store.state[this.idDash].tockens;
    },
  },
  mounted() {
    this.$store.commit('setActions', {
      actions: this.props.actions,
      idDash: this.idDash,
      id: this.id,
    });
    this.$refs.lineChart.parentElement.style.overflow = 'hidden';
  },
  methods: {
    getDataAsynchrony() {
      const prom = new Promise((resolve) => {
        // создаем promise чтобы затем отрисовать график асинхронно

        const sizeLine = { width: 0, height: 0 }; // получаем размеры от родителя
        sizeLine.width = this.width;
        sizeLine.height = this.height;

        if (this.dataRestFrom.error) {
          // смотрим если с ошибкой
          this.props.message = this.dataRestFrom.error; // то выводим сообщение о ошибке
        } else {
          // если нет

          resolve(sizeLine); // передаем в результат размеры графика
        }
      });

      prom.then((sizeLine) => {
        // как раз тут делаем асинхронность
        let time = false;
        const key = Object.keys(this.dataRestFrom[0])[0];
        const { lastDot } = this.getOptions;
        const onlyNum = typeof this.dataRestFrom[0][key] === 'number';
        if (onlyNum) {
          // если все-таки число
          if (
            this.dataRestFrom[0][key] > 1000000000
            && this.dataRestFrom[0][key] < 2000000000
          ) {
            time = true;
          }
          this.props.nodata = false; // то убираем соощение о отсутствии данных
          this.props.result = this.dataRestFrom; // заносим все данные в переменную
          this.createLineChart(this.props, this, sizeLine, time, lastDot); // и собственно создаем график
        } else {
          // если первое значение первого элемнета (подразумеваем что это time не число)
          this.props.nodata = true; // показываем сообщение о некорректности данных
          this.props.result = []; // очищаем массив результатов
          this.props.message = 'К сожалению данные не подходят к линейному графику'; // выводим сообщение
          d3.select(this.$el.querySelector('.dash-graph'))
            .selectAll('svg')
            .remove(); // и еще график очищаем, чтобы не мешался
        }
      });
    },
    createLineChart(props, that, sizeLine, time, lastDot) {
      // основные используемые цвета
      const colors = [
        this.colorFrom.controls || this.colorFrom.$accent_ui_color,
        this.colorFrom.text || this.colorFrom.$blue,
        this.colorFrom.controlsActive || this.colorFrom.$primary_button_hover,
        '#660099',
        '#3366FF',
        '#e5194a',
        '#fbbe18',
        '#26295a',
        '#228B22',
      ];

      // устанавливаем размер и отступы графика
      let otstupBottom = 60;
      if (window.screen.width <= 1600) {
        otstupBottom = 40;
      }

      const margin = {
        top: 10, right: 20, bottom: 20, left: 60,
      };
      const width = sizeLine.width - margin.left - margin.right - 20;
      const height = sizeLine.height - margin.top - margin.bottom - otstupBottom;

      // получаем область в которой будем рисовтаь график
      const graphics = d3
        .select(this.$el.querySelector('.dash-graph'))
        .selectAll('svg')
        .nodes();

      // если график уже есть
      if (graphics.length !== 0) {
        // удаляем его
        graphics[0].remove();
      }

      // полготавливаем данные

      const data = props.result;

      let secondTransf = 1000;

      // в эту переменную кладем временную метрику (подразумеваем, что она первая по счету)
      const xMetric = Object.keys(data[0])[0];

      // массив из всех метрик что доступны на графике и в нужном нам порядке
      const metricsName = [];

      // предполагаем что наших метрик всегда максимум пять не считая временной
      for (let i = 0; i < 5; i += 1) {
        // пробегаемся по первому элементу, на основе него и будем делать выводы о метриках
        Object.keys(data[0]).forEach((item, j) => {
          switch (i) {
            // в первый элемнет массива нам надо занести основную метрику
            // которая рисует основную линию
            case 0:
              if (j !== 0
                && item.indexOf('lowerbound') === -1
                && item.indexOf('upperbound') === -1
                && item.indexOf('upperthreshold') === -1
                && item.indexOf('lowerthreshold') === -1) {
                metricsName.push(item);
              }
              break;
            // во второй заносим верхнию границу коридора
            case 1:
              if (item.indexOf('upperbound') !== -1) {
                metricsName.push(item);
              }
              break;
            // нижняя граница коридора
            case 2:
              if (item.indexOf('lowerbound') !== -1) {
                metricsName.push(item);
              }
              break;
            // верхняя граница порога
            case 3:
              if (item.indexOf('upperthreshold') !== -1) {
                metricsName.push(item);
              }
              break;
            // нижняя
            case 4:
              if (item.indexOf('lowerthreshold') !== -1) {
                metricsName.push(item);
              }
              break;
            default:
              break;
          }
        });
      }

      // если метрик вообще не найдено
      if (metricsName.length === 0) {
        // показываем сообщение о некорректности данных
        this.props.nodata = true;
        // очищаем массив результатов
        this.props.result = [];
        // выводим сообщение
        this.props.message = 'Ни одной метрики не найдено. Проверьте корректность данных';
        // и еще график очищаем, чтобы не мешался
        d3.select(this.$el.querySelector('.dash-graph'))
          .selectAll('svg')
          .remove();
        // завершаем создание графика
        return;
      }

      let x = null;
      let maxX = 0;
      let minX = 0;
      if (time) {
        x = d3
          .scaleTime()
          .domain(
            d3.extent(data, (d) => new Date(d[xMetric] * secondTransf)),
          )
          .range([0, width]);
      } else {
        // находим максимальное значение среди всех метрик
        maxX = data.reduce((last, next) => {
          if (next[xMetric] > last) {
            return next[xMetric];
          }
          return last;
        }, 0);
        // находим максимальное значение среди всех метрик
        minX = data.reduce((last, next) => {
          if (next[xMetric] < last) {
            return next[xMetric];
          }
          return last;
        }, maxX);
        x = d3.scaleLinear().domain([minX, maxX]).range([0, width]);
        secondTransf = 1;
      }

      // получаем массив с максимальным значением каждой метрики, кроме временной
      let max = metricsName.map((item, i) => d3.max(data, (d) => +d[metricsName[i]]));

      // находим максимальное значение среди всех метрик
      max = max.reduce((last, next) => (next > last ? next : last), 0);

      const y = d3.scaleLinear().domain([0, max]).range([height, 20]);

      // добовляем svg элемент на страницу
      const svg = d3
        .select(this.$el.querySelector('.dash-graph'))
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('data-id', props.id)
        .attr('class', 'graph-svg')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      let deliter = 2;

      if (width + margin.left + margin.right < 550) {
        deliter = 3;
      }
      if (width + margin.left + margin.right < 400) {
        deliter = 4;
      }
      if (width + margin.left + margin.right < 350) {
        deliter = 5;
      }
      if (width + margin.left + margin.right < 300) {
        deliter = 6;
      }

      const annotation = Object.keys(data[0]).filter((item) => item.indexOf('annotation') !== -1);

      // добавляем ось X
      let xAxis = null;
      if (time) {
        xAxis = svg
          .append('g')
          .attr('class', 'xAxis')
          .attr('transform', `translate(0,${height})`)
          .call(
            d3
              .axisBottom(x)
              .tickFormat(d3.timeFormat('%d-%m-%Y '))
              .tickValues(
                x.ticks().filter((item, i) => i % deliter === 0),
              )
              .ticks(5),
          );
      } else {
        xAxis = svg
          .append('g')
          .attr('class', 'xAxis')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x));
      }

      // добавляем ось Y
      svg
        .append('g')
        .attr('class', 'yAxis')
        .call(d3.axisLeft(y).ticks(y.ticks().length / 2));

      // отрисуем сетку сперва для горизотнальных тиков
      verticalLineX();

      // и для вертикальных
      svg
        .selectAll('g.yAxis g.tick')
        .append('line')
        .attr('class', 'grid-line-y')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', width)
        .attr('y2', 0)
        .attr('stroke', that.colorFrom.text)
        .style('opacity', '0.3');

      // создаем область графика, все-что вне этой области не будет отрисованно
      svg
        .append('defs')
        .append('svg:clipPath')
        .attr('id', `clip-${that.id}`)
        .append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('x', 0)
        .attr('y', 0);

      // создаем tooltip
      d3.select(this.$el.querySelector('.dash-graph'))
        .selectAll('.tooltip')
        .remove();

      const tooltip = d3
        .select(this.$el.querySelector('.dash-graph'))
        .append('div')
        .attr('class', 'tooltip')
        .style('color', colors[1])
        .style('background', this.color.backElement)
        .style('border-color', colors[1])
        .text('');

      const brushObj = {};
      brushObj.selections = [];
      brushObj.mouseDown = false;
      brushObj.direction = 'right';
      brushObj.startX = 0;
      brushObj.endX = 0;

      // массив в котором будем хранить наши линии,
      // основную, и коридор, сейчас названия произвольные выставлены
      const lineName = ['general', 'upbound', 'lowbound'];

      // строим коридор метрики

      // массив с точками для области закрашивания
      const areaData = [];

      //  если коридор вообще есть (может быть и просто линейный график)
      if (metricsName[1] && metricsName[2]) {
        // функция строящая линию коридора
        addHall(1);
        addHall(2);
      }

      //  добовляем область заливки
      //  Add the area
      svg
        .append('path')
        .datum(areaData)
        .attr('fill', colors[1])
        .attr('class', 'area') // добовляем свой класс
        .style('opacity', 0.05)
        .attr('clip-path', `url(#clip-${that.id})`)
        .attr(
          'd',
          d3
            .area()
            .x((d) => d.above.x)
            .y0((d) => d.below.y)
            .y1((d) => d.above.y),
        );

      // подготавливаем данные для порога

      // здесь будет объект с границами порога
      const treshold = {};

      // если порог вообще есть (может быть просто линия ведь графика)
      if (metricsName[3] && metricsName[4]) {
        // сперва создаем объекты верхнего и нижнего порога во избежании ошибок
        treshold[metricsName[3]] = [];
        treshold[metricsName[4]] = [];

        // пробегаемся пов сем данным
        data.forEach((item) => {
          // изаносим в нужном нам виде порог
          treshold[metricsName[3]].push(item[metricsName[3]]);
          treshold[metricsName[4]].push(item[metricsName[4]]);
        });
      }

      // строим основную линию

      // основная линия графика
      lineName[0] = svg
        .append('g')
        .attr('clip-path', `url(#clip-${that.id})`);

      // Добовляем линию
      // добовляем свой класс
      lineName[0]
        .append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', colors[0])
        .attr('stroke-width', 1.5)
        .attr(
          'd',
          d3
            .line()
            .x((d) => x(d[xMetric] * secondTransf))
            .y((d) => y(d[metricsName[0]])),
        );
      // Добовляем точки
      // нам нужно понять какие точки выходят за значение порога и их мы окрасим в другой цвет
      svg
        .append('g')
        .selectAll('dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d[xMetric] * secondTransf))
        .attr('cy', (d, i) => {
          // поэтому сперва по умолчанию красив в цвет графика
          this.setAttribute('fill', colors[0]);
          // и делаем точки прозрачными
          this.style = 'opacity:0';
          // затем если вообще есть порог
          if (Object.keys(treshold).length === 2) {
            // смотрим если значение  выходят за верхний или нижний порог
            if (
              treshold[metricsName[3]][i] > d[metricsName[0]]
              || treshold[metricsName[4]][i] < d[metricsName[0]]
            ) {
              // красим точку в другой цвет
              this.setAttribute('fill', colors[2]);
              // и постоянно ее отображаем
              this.style = 'opacity:1';
              // так же зададим атрибут сосбтвенный, чтобы потом понимать с какой точки мышка ушла
              this.setAttribute('data-anomaly', 'true');
            }
          }
          if (lastDot) {
            // если это последняя точка, то
            if (i === data.length - 1) {
              putLabelDot(
                'data-last-dote',
                'last-dot-text',
                d,
                metricsName[0],
                this,
              );
            }
          }

          if (
            d[`_${metricsName[0]}_caption`]
            && !this.getAttribute('data-last-dote')
          ) {
            putLabelDot(
              'data-with-caption',
              'caption-dot-text',
              d,
              `_${metricsName[0]}_caption`,
              this,
            );
          }
          if (annotation.length !== 0) {
            annotation.forEach((item, i) => {
              if (d[item]) {
                verticalLine(d, item, i);
              }
            });
          }

          return y(d[metricsName[0]]);
        })
        .attr('r', 5)
        .attr('class', 'dot')
        .on('click', (d) => that.setClick(
          { x: d[xMetric], y: d[metricsName[0]] },
          'click',
        ))
        // при наведении мышки точка появляется
        .on('mouseover', (d) => {
          let x = d[xMetric];
          if (time) {
            x = new Date(d[xMetric] * secondTransf);
            x = `${x.getDate()}-${x.getMonth() + 1}-${x.getFullYear()}`;
          }
          tooltip
            .style('opacity', '1')
            .style('visibility', 'visible')
            .html(
              `<p><span>${xMetric}</span> : ${x}</p>
            <p><span>${metricsName[0]}</span> : ${d[metricsName[0]]}</p>`,
            )
            .style('top', `${event.layerY - 30}px`)
            .style('right', 'auto')
            .style('left', `${event.layerX + 20}px`);
          if (event.layerX + 100 > width) {
            tooltip
              .style('left', 'auto')
              .style('right', `${width - event.layerX + 110}px`);
          }

          if (brushObj.mouseDown) {
            brushObj.selectionMove();
          }

          this.style = 'opacity:1';
        })
        .on('mouseout', () => {
          if (
            !this.getAttribute('data-anomaly')
            && !this.getAttribute('data-last-dote')
            && !this.getAttribute('data-with-caption')
          ) {
            this.style = 'opacity:0';
          }
          tooltip.style('opacity', '0').style('visibility', 'hidden');
        }) // при уводе мышки исчезает, только если это не точка выходящяя порог
        .on('mousedown', () => {
          brushObj.selectionDown();
        })
        .on('mouseup', () => {
          brushObj.selectionUp();
        });

      const legend = svg
        .append('g') // доволяем легенду
        .attr('class', 'legend')
        .attr('transform', `translate(${-100},0)`);

      legend
        .append('circle') // кружок легенды
        .style('fill', colors[0])
        .style('stroke', colors[0])
        .attr('r', 5)
        .attr('transform', `translate(${width - 15},0)`);
      legend
        .append('text') // текст легенды (название метрики)
        .attr('transform', `translate(${width - 5},5)`)
        .attr('data-name', metricsName[0])
        .style('fill', colors[1])
        // здесь вызываем функцию которая проверяет не слишком ли длинное название и сокращает его
        .text(checkName(metricsName[0]));

      const brush = lineName[0].append('g').attr('class', 'brush');

      brush
        .append('rect')
        .attr('class', 'overlay')
        // .attr("id", i)
        .attr('x', 0)
        .style('fill', 'transparent')
        .attr('y', 20)
        .attr('width', width)
        .attr('height', height)
        .attr('pointer-events', 'all')
        .on('mousedown', () => {
          brushObj.selectionDown();
        })
        .on('mousemove', () => {
          brushObj.selectionMove();
        })
        .on('mouseup', () => {
          brushObj.selectionUp();
        });

      brushObj.selectionDown = () => {
        brushObj.mouseDown = true;
        brushObj.clearBrush();
        brushObj.startX = event.layerX - 65;
        brush
          .append('rect')
          .attr('class', 'selection')
          .attr('x', brushObj.startX)
          .attr('y', 20)
          .attr('width', 0)
          .attr('height', height)
          .style('fill', colors[2])
          .style('opacity', '0.3')
          .on('mousemove', () => {
            brushObj.selectionMove();
          })
          .on('mouseup', () => {
            brushObj.selectionUp();
          });
      };

      brushObj.selectionMove = () => {
        if (brushObj.mouseDown) {
          if (event.layerX - 65 - brushObj.startX > 0) {
            brushObj.direction = 'right';
            brushObj.endX = event.layerX - 65;
            brush
              .select('.selection')
              .attr('width', event.layerX - 65 - brushObj.startX);
          } else {
            brushObj.direction = 'left';
            brushObj.endX = brushObj.startX + (event.layerX - 65 - brushObj.startX);
            brush
              .select('.selection')
              .attr(
                'x',
                brushObj.startX + (event.layerX - 65 - brushObj.startX),
              )
              .attr('width', -(event.layerX - 65 - brushObj.startX));
          }
        }
      };

      brushObj.selectionUp = () => {
        brushObj.mouseDown = false;
        if (brushObj.direction === 'left') {
          const change = brushObj.startX;
          brushObj.startX = brushObj.endX;
          brushObj.endX = change;
        }
        if (brush.select('.selection').attr('width') > 5) {
          updateData([brushObj.startX, brushObj.endX], brushObj);
        }
      };

      brushObj.clearBrush = () => {
        brushObj.selections = brush.selectAll('.selection').nodes();
        if (brushObj.selections.length !== 0) {
          brushObj.selections.forEach((item, i) => {
            brushObj.selections[i].remove();
          });
        }
      };

      function verticalLineX() {
        const linesX = svg.selectAll('.grid-line-x').nodes();
        if (linesX.length !== 0) {
          linesX.forEach((item, i) => {
            linesX[i].remove();
          });
        }

        svg
          .selectAll('g.xAxis g.tick')
          .append('line') // добавляем линию
          .attr('class', 'grid-line-x') // добавляем класс
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', 0)
          .attr('y2', -(height - 20))
          .attr('stroke', colors[1])
          .style('opacity', '0.3');
      }

      function verticalLine(d, item, i) {
        const group = svg.append('g').attr('class', 'vetical-line-group');

        group
          .append('line')
          .attr('class', 'vetical-line')
          .attr('x1', x(d[xMetric] * secondTransf))
          .attr('y1', 20)
          .attr('x2', x(d[xMetric] * secondTransf))
          .attr('y2', height)
          .attr('xVal', d[xMetric] * secondTransf)
          .attr('stroke', colors[i + 2])
          .style('opacity', '0.7');

        group
          .append('circle')
          .attr('cx', x(d[xMetric] * secondTransf))
          .attr('cy', 20)
          .attr('xVal', d[xMetric] * secondTransf)
          .attr('r', 5)
          .attr('opacity', '0.7')
          .attr('fill', colors[i + 2])
          .attr('class', 'dot-vertical')
          .on('mouseover', () => {
            tooltip
              .style('opacity', '1')
              .style('visibility', 'visible')
              .html(`<p>${d[item]}</p>`)
              .style('top', `${event.layerY - 30}px`)
              .style('right', 'auto')
              .style('left', `${event.layerX + 20}px`);
            if (event.layerX + 100 > width) {
              tooltip
                .style('left', 'auto')
                .style('right', `${width - event.layerX + 110}px`);
            }
          }) // при наведении мышки точка появляется
          .on('mouseout', () => {
            tooltip.style('opacity', '0').style('visibility', 'hidden');
          });
      }

      function putLabelDot(attr, classText, d, metric, that) {
        // красим точку в другой цвет
        that.setAttribute('fill', colors[0]);
        // и постоянно ее отображаем
        that.style = 'opacity:1';
        // так же зададим атрибут сосбтвенный, чтобы потом понимать с какой точки мышка ушла
        that.setAttribute(attr, 'true');
        // текст легенды (название метрики)
        svg
          .append('text')
          .attr('class', classText)
          .attr(
            'transform',
            `translate(${x(d[xMetric] * secondTransf)},${
              y(d[metricsName[0]]) - 10
            })`,
          )
          .attr('font-size', '0.7em')
          .attr('text-anchor', 'end')
          .style('fill', colors[1])
          .text(d[metric])
          .on('mouseover', () => {
            if (brushObj.mouseDown) {
              brushObj.selectionMove();
            }
          })
          .on('mousemove', () => {
            if (brushObj.mouseDown) {
              brushObj.selectionMove();
            }
          })
          .on('mouseup', () => {
            brushObj.selectionUp();
          });
      }

      // функция которая проверяет не слишком ли длинное название и сокращает его
      function checkName(name) {
        // если там больше 10 символов
        if (name.length > 10) {
          // обрезаем и добовляем троеточие
          name = `${name.substring(0, 10)}...`;
        }
        return name;
      }

      // функция создающяя линию коридора
      function addHall(j) {
        // добовляем объект для линии коридора, верхней или нижней
        lineName[j] = svg
          .append('g')
          .attr('clip-path', `url(#clip-${that.id})`);

        // Добовляем  саму линию
        // добовляем свой класс
        lineName[j]
          .append('path')
          .datum(data)
          .attr('class', 'lineHall')
          .attr('fill', 'none')
          .attr('stroke', colors[0])
          .style('stroke-dasharray', '3 3')
          .attr('stroke-width', 1.5)
          .attr(
            'd',
            d3
              .line()
              .x((d, i) => {
                addToArea(x(d[xMetric] * secondTransf), i, 'x', metricsName[j]);
                return x(d[xMetric] * secondTransf);
              }) // тут вызываем функцию которая еще и правлиьно формирует точки
              // для области закрашивания между линиями коридора
              .y((d, i) => {
                addToArea(y(d[metricsName[j]]), i, 'y', metricsName[j]);
                return y(d[metricsName[j]]);
              }),
          );
      }

      // функция которая создает правильный массив точек для области закрашивания коридора
      function addToArea(item, i, point, name) {
        // если элемнета массива еще нет
        if (!areaData[i]) {
          // то создаем его нужным нам образом
          areaData[i] = {
            above: { x: null, y: null },
            below: { x: null, y: null },
          };
        }
        // и наполняем его значениями
        if (name.indexOf('upperbound') !== -1) {
          areaData[i].above[point] = item;
        } else {
          areaData[i].below[point] = item;
        }
      }

      // функция которая вызывается каждый раз, когда происходит выделение области (brush)
      function updateData(extent, brushObj) {
        if (extent) {
          // если область выделена всё-таки
          let diapason;
          if (time) {
            // получаем эти значения в нужном нам виде
            diapason = [
              parseInt(new Date(x.invert(extent[0])).getTime() / 1000, 10),
              parseInt(new Date(x.invert(extent[1])).getTime() / 1000, 10),
            ];
          } else {
            diapason = [
              parseFloat(x.invert(extent[0]).toFixed(5)),
              parseFloat(x.invert(extent[1]).toFixed(5)),
            ];
          }
          // вызываем функцию создающию токены
          that.setClick(diapason, 'select');
          // делаем зумирование  графика
          zoom(extent, brushObj);
        }
      }
      // функция делающяя зумирование графика
      function zoom(extent, brushObj) {
        // меняем значения оси х на основе нашего выделенного диапазона
        x.domain([x.invert(extent[0]), x.invert(extent[1])]);
        brushObj.clearBrush();

        // растягиваем плавно ось x
        if (time) {
          xAxis
            .transition()
            .duration(secondTransf)
            .call(
              d3
                .axisBottom(x)
                .tickFormat(d3.timeFormat('%d-%m-%Y '))
                .tickValues(
                  x.ticks().filter((item, i) => i % 2 === 0),
                )
                .ticks(5),
            );
        } else {
          xAxis.transition().duration(1000).call(d3.axisBottom(x));
        }

        verticalLineX();
        // вызываем функцию которая перересует все линии и точки как надо
        changeZoom(1000);
        // если дважды щелкнуть по любому месту
        svg.on('dblclick', () => {
          // то вернем ось х в исходное состояние
          if (time) {
            x.domain(
              d3.extent(data, (d) => new Date(d[xMetric] * secondTransf)),
            );
            xAxis
              .transition()
              .duration(secondTransf)
              .call(
                d3
                  .axisBottom(x)
                  .tickFormat(d3.timeFormat('%d-%m-%Y '))
                  .tickValues(
                    x.ticks().filter((item, i) => i % 2 === 0),
                  )
                  .ticks(5),
              );
          } else {
            x.domain([minX, maxX]);
            xAxis.transition().duration(1000).call(d3.axisBottom(x));
          }

          verticalLineX();
          // и вернем все линии  в исходное состояние
          changeZoom(300);
        });
        // функция которая перерисовывает все линии
        function changeZoom(dauration) {
          // основная линия
          lineName[0]
            .select('.line')
            .transition()
            .duration(dauration)
            .attr(
              'd',
              d3
                .line()
                .x((d) => x(d[xMetric] * secondTransf))
                .y((d) => y(d[metricsName[0]])),
            );
          const dotLabelPos = [];
          let lastDotPos = null;

          svg // все точки на графике
            .selectAll('.dot')
            .transition()
            .duration(dauration)
            .attr('cx', (d) => {
              if (this.getAttribute('data-with-caption')) {
                dotLabelPos.push({
                  x: x(d[xMetric] * secondTransf),
                  y: y(d[metricsName[0]]),
                });
              }
              if (this.getAttribute('data-last-dote')) {
                lastDotPos = {
                  x: x(d[xMetric] * secondTransf),
                  y: y(d[metricsName[0]]),
                };
              }
              return x(d[xMetric] * secondTransf);
            })
            .attr('cy', (d) => y(d[metricsName[0]]));

          svg
            .selectAll('.caption-dot-text')
            .transition()
            .duration(dauration)
            .attr('transform', (d, i) => `translate(${dotLabelPos[i].x},${dotLabelPos[i].y})`);
          if (lastDotPos != null) {
            svg
              .select('.last-dot-text')
              .transition()
              .duration(dauration)
              .attr('transform', `translate(${lastDotPos.x},${lastDotPos.y})`);
          }

          const group = svg.selectAll('.vetical-line-group');

          group
            .selectAll('.vetical-line')
            .transition()
            .duration(dauration)
            .attr('x1', () => x(this.getAttribute('xVal')))
            .attr('x2', () => x(this.getAttribute('xVal')));

          group
            .selectAll('.dot-vertical')
            .transition()
            .duration(dauration)
            .attr('cx', () => x(this.getAttribute('xVal')));

          // проверяем если коридор есть
          if (metricsName[1] && metricsName[2]) {
            // его тоже перерисовываем
            addHallBrush(1, dauration);
            addHallBrush(2, dauration);

            // и закрашиваем
            svg
              .select('.area')
              .transition()
              .duration(dauration)
              .attr(
                'd',
                d3
                  .area()
                  .x((d) => d.above.x)
                  .y0((d) => d.below.y)
                  .y1((d) => d.above.y),
              );
          }

          // функция которая перерисовывает коридор
          function addHallBrush(j, duration) {
            // Добовляем линию
            // линии кордиора - нижняя и верхняя
            lineName[j]
              .select('.lineHall')
              .transition()
              .duration(duration)
              .attr(
                'd',
                d3
                  .line()
                  .x((d, i) => {
                    addToArea(
                      x(d[xMetric] * secondTransf),
                      i,
                      'x',
                      metricsName[j],
                    );
                    return x(d[xMetric] * secondTransf);
                  }) // приходиться пересчитывать массив с точками для коридора снова
                  .y((d, i) => {
                    addToArea(y(d[metricsName[j]]), i, 'y', metricsName[j]);
                    return y(d[metricsName[j]]);
                  }),
              );
          }
        }
      }
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
    setClick(point, action) {
      const tockens = this.getTockens;
      let tocken = {};

      const setTocken = (value) => {
        this.$store.commit('setTocken', {
          tocken,
          idDash: this.idDash,
          value,
          store: this.$store,
        });
      };

      Object.keys(tockens).forEach((i) => {
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        };
        if (
          tockens[i].elem === this.id
          && tockens[i].action === action
          && tockens[i].capture === 'pointX'
        ) {
          setTocken(point.x);
          // this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: point.x });
        } else if (
          tockens[i].elem === this.id
          && tockens[i].action === action
          && tockens[i].capture === 'pointY'
        ) {
          setTocken(point.y);
          // this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: point.y });
        } else if (
          tockens[i].elem === this.id
          && tockens[i].action === action
          && tockens[i].capture === 'start'
        ) {
          setTocken(point[0]);
          //  this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: point[0] });
        } else if (
          tockens[i].elem === this.id
          && tockens[i].action === action
          && tockens[i].capture === 'end'
        ) {
          setTocken(point[1]);
          // this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: point[1] });
        }
      });

      const events = this.getEvents({
        event: 'onclick',
        partelement: 'point',
      });

      if (events.length !== 0) {
        events.forEach((item) => {
          if (item.action === 'set') {
            this.$store.commit('letEventSet', {
              events,
              idDash: this.idDash,
            });
          } else if (item.action === 'go') {
            if (action !== 'select') {
              this.$store.commit('letEventGo', {
                event: item,
                idDash: this.idDash,
                route: this.$router,
                store: this.$store,
              });
              // this.$router.push(`/dashboards/${item.target.toLowerCase()}`);
            }
          }
        });
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashLineChart.sass';
</style>
