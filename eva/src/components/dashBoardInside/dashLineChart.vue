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
    dataLoading: function () {
      return this.dataLoadingFrom;
    },
    width: function () {
      return this.widthFrom;
    },
    height: function () {
      return this.heightFrom;
    },
    // getDataStart: function() {
    //   if (this.width != 0 && this.height != 0 && this.dataRest.length > 0) {   // если размеры получены выше нуля и  если данные от родителя тоже пришли
    //     //this.getDataAsynchrony(); // вызываем функцию в которой будет происходить асинхронная отрисовка графика
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
            let graphics = d3
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
    getDataAsynchrony: function () {
      let prom = new Promise((resolve) => {
        // создаем promise чтобы затем отрисовать график асинхронно

        let sizeLine = { width: 0, height: 0 }; // получаем размеры от родителя
        sizeLine['width'] = this.width;
        sizeLine['height'] = this.height;

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
        let onlyNum = true;
        let key = Object.keys(this.dataRestFrom[0])[0];
        let lastDot = this.$store.getters.getOptions({
          idDash: this.idDash,
          id: this.id,
        }).lastDot;
        typeof this.dataRestFrom[0][key] != 'number'
          ? (onlyNum = false)
          : false;
        if (onlyNum) {
          // если все-таки число
          if (
            this.dataRestFrom[0][key] > 1000000000 &&
            this.dataRestFrom[0][key] < 2000000000
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
          this.props.message =
            'К сожалению данные не подходят к линейному графику'; // выводим сообщение
          d3.select(this.$el.querySelector('.dash-graph'))
            .selectAll('svg')
            .remove(); // и еще график очищаем, чтобы не мешался
        }
      });
    },
    createLineChart: function (props, that, sizeLine, time, lastDot) {
      // создает график

      let colors = [
        this.colorFrom.controls || this.colorFrom.$accent_ui_color,
        this.colorFrom.text || this.colorFrom.$blue,
        this.colorFrom.controlsActive || this.colorFrom.$primary_button_hover,
        '#660099',
        '#3366FF',
        '#e5194a',
        '#fbbe18',
        '#26295a',
        '#228B22',
      ]; // основные используемые цвета

      let otstupBottom = 60;
      if (screen.width <= 1600) {
        otstupBottom = 40;
      }
      // устанавливаем размер и отступы графика
      let margin = { top: 10, right: 20, bottom: 20, left: 60 },
        width = sizeLine.width - margin.left - margin.right - 20,
        height = sizeLine.height - margin.top - margin.bottom - otstupBottom;

      let graphics = d3
        .select(this.$el.querySelector('.dash-graph'))
        .selectAll('svg')
        .nodes(); // получаем область в которой будем рисовтаь график

      if (graphics.length !== 0) {
        // если график уже есть
        graphics[0].remove(); // удаляем его
      }

      // полготавливаем данные

      let data = props.result;

      let secondTransf = 1000;

      let xMetric = Object.keys(data[0])[0]; // в эту переменную кладем временную метрику (подразумеваем, что она первая по счету)

      let metricsName = []; // массив из всех метрик что доступны на графике и в нужном нам порядке

      for (let i = 0; i < 5; i++) {
        // предполагаем что наших метрик всегда максимум пять не считая временной
        Object.keys(data[0]).forEach((item, j) => {
          // пробегаемся по первому элементу, на основе него и будем делать выводы о метриках
          switch (i) {
            case 0: // в первый элемнет массива нам надо занести основную метрику которая рисует основную линию
              j !== 0 &&
              item.indexOf('lowerbound') === -1 &&
              item.indexOf('upperbound') === -1 &&
              item.indexOf('upperthreshold') === -1 &&
              item.indexOf('lowerthreshold') === -1
                ? metricsName.push(item)
                : false;
              break;
            case 1: // во второй заносим верхнию границу коридора
              item.indexOf('upperbound') !== -1
                ? metricsName.push(item)
                : false;
              break;
            case 2: // нижняя граница коридора
              item.indexOf('lowerbound') !== -1
                ? metricsName.push(item)
                : false;
              break;
            case 3: // верхняя граница порога
              item.indexOf('upperthreshold') !== -1
                ? metricsName.push(item)
                : false;
              break;
            case 4: // нижняя
              item.indexOf('lowerthreshold') !== -1
                ? metricsName.push(item)
                : false;
              break;
          }
        });
      }

      if (metricsName.length === 0) {
        // если метрик вообще не найдено
        this.props.nodata = true; // показываем сообщение о некорректности данных
        this.props.result = []; // очищаем массив результатов
        this.props.message =
          'Ни одной метрики не найдено. Проверьте корректность данных'; // выводим сообщение
        d3.select(this.$el.querySelector('.dash-graph'))
          .selectAll('svg')
          .remove(); // и еще график очищаем, чтобы не мешался
        return false; // завершаем создание графика
      }

      let x = null;
      let maxX = 0,
        minX = 0;
      if (time) {
        x = d3
          .scaleTime()
          .domain(
            d3.extent(data, function (d) {
              return new Date(d[xMetric] * secondTransf);
            })
          )
          .range([0, width]);
      } else {
        maxX = data.reduce(function (last, next) {
          // находим максимальное значение среди всех метрик
          if (next[xMetric] > last) {
            return next[xMetric];
          } else {
            return last;
          }
        }, 0);
        minX = data.reduce(function (last, next) {
          // находим максимальное значение среди всех метрик
          if (next[xMetric] < last) {
            return next[xMetric];
          } else {
            return last;
          }
        }, maxX);
        x = d3.scaleLinear().domain([minX, maxX]).range([0, width]);
        secondTransf = 1;
      }

      let max = metricsName.map((item, i) => {
        // получаем массив с максимальным значением каждой метрики, кроме временной
        return d3.max(data, function (d) {
          return +d[metricsName[i]];
        });
      });

      max = max.reduce(function (last, next) {
        // находим максимальное значение среди всех метрик
        if (next > last) {
          return next;
        } else {
          return last;
        }
      }, 0);

      let y = d3.scaleLinear().domain([0, max]).range([height, 20]);

      // добовляем svg элемент на страницу
      let svg = d3
        .select(this.$el.querySelector('.dash-graph'))
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('data-id', props.id)
        .attr('class', 'graph-svg')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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

      let annotation = Object.keys(data[0]).filter((item) => {
        if (item.indexOf('annotation') !== -1) {
          return item;
        }
      });

      // добавляем ось X
      let xAxis = null;
      if (time) {
        xAxis = svg
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
              .ticks(5)
          );
      } else {
        xAxis = svg
          .append('g')
          .attr('class', 'xAxis')
          .attr('transform', 'translate(0,' + height + ')')
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

      let tooltip = d3
        .select(this.$el.querySelector('.dash-graph'))
        .append('div')
        .attr('class', 'tooltip')
        .style('color', colors[1])
        .style('background', this.color.backElement)
        .style('border-color', colors[1])
        .text('');

      // // создаем область выделения
      // let brush = d3.brushX()                   // область выделения
      //   .extent( [ [0,0], [width,height] ] )  // инициализируем область выделения на весь граф от начала до width, heigh
      //   .on("end", updateData)               // каждый раз как область выделения изменится вызовется функция

      let brushObj = {};
      brushObj['selections'] = [];
      brushObj['mouseDown'] = false;
      brushObj['direction'] = 'right';
      brushObj['startX'] = 0;
      brushObj['endX'] = 0;

      let lineName = ['general', 'upbound', 'lowbound']; // массив в котором будем хранить наши линии, основную, и коридор, сейчас названия произвольные выставлены

      // строим коридор метрики

      let areaData = []; // массив с точками для области закрашивания

      if (metricsName[1] && metricsName[2]) {
        //  если коридор вообще есть (может быть и просто линейный график)

        addHall(1); // функция строящая линию коридора
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
            .x(function (d) {
              return d.above.x;
            })
            .y0(function (d) {
              return d.below.y;
            })
            .y1(function (d) {
              return d.above.y;
            })
        );

      // подготавливаем данные для порога

      let treshold = {}; // здесь будет объект с границами порога

      if (metricsName[3] && metricsName[4]) {
        // если порог вообще есть (может быть просто линия ведь графика)
        treshold[metricsName[3]] = []; // сперва создаем объекты верхнего и нижнего порога во избежании ошибок
        treshold[metricsName[4]] = [];

        data.forEach((item) => {
          // пробегаемся пов сем данным
          treshold[metricsName[3]].push(item[metricsName[3]]); // изаносим в нужном нам виде порог
          treshold[metricsName[4]].push(item[metricsName[4]]);
        });
      }

      // строим основную линию

      lineName[0] = svg
        .append('g') // основная линия графика
        .attr('clip-path', `url(#clip-${that.id})`);

      // Добовляем линию
      lineName[0]
        .append('path')
        .datum(data)
        .attr('class', 'line') // добовляем свой класс
        .attr('fill', 'none')
        .attr('stroke', colors[0])
        .attr('stroke-width', 1.5)
        .attr(
          'd',
          d3
            .line()
            .x(function (d) {
              return x(d[xMetric] * secondTransf);
            })
            .y(function (d) {
              return y(d[metricsName[0]]);
            })
        );
      // Добовляем точки
      svg
        .append('g')
        .selectAll('dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', function (d) {
          return x(d[xMetric] * secondTransf);
        })
        .attr('cy', function (d, i) {
          // нам нужно понять какие точки выходят за значение порога и их мы окрасим в другой цвет
          this.setAttribute('fill', colors[0]); // поэтому сперва по умолчанию красив в цвет графика
          this.style = 'opacity:0'; // и делаем точки прозрачными
          if (Object.keys(treshold).length === 2) {
            // затем если вообще есть порог
            if (
              treshold[metricsName[3]][i] > d[metricsName[0]] ||
              treshold[metricsName[4]][i] < d[metricsName[0]]
            ) {
              // смотрим если значение  выходят за верхний или нижний порог
              this.setAttribute('fill', colors[2]); // красим точку в другой цвет
              this.style = 'opacity:1'; // и постоянно ее отображаем
              this.setAttribute('data-anomaly', 'true'); // так же зададим атрибут сосбтвенный, чтобы потом понимать с какой точки мышка ушла
            }
          }
          if (lastDot) {
            if (i === data.length - 1) {
              // если это последняя точка, то
              putLabelDot(
                'data-last-dote',
                'last-dot-text',
                d,
                metricsName[0],
                this
              );
            }
          }

          if (
            d[`_${metricsName[0]}_caption`] &&
            !this.getAttribute('data-last-dote')
          ) {
            putLabelDot(
              'data-with-caption',
              'caption-dot-text',
              d,
              `_${metricsName[0]}_caption`,
              this
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
        .on('click', function (d) {
          return that.setClick(
            { x: d[xMetric], y: d[metricsName[0]] },
            'click'
          );
        })
        .on('mouseover', function (d) {
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
            <p><span>${metricsName[0]}</span> : ${d[metricsName[0]]}</p>`
            )
            .style('top', event.layerY - 30 + 'px')
            .style('right', 'auto')
            .style('left', event.layerX + 20 + 'px');
          if (event.layerX + 100 > width) {
            tooltip
              .style('left', 'auto')
              .style('right', width - event.layerX + 110 + 'px');
          }

          if (brushObj.mouseDown) {
            brushObj.selectionMove();
          }

          this.style = 'opacity:1';
        }) // при наведении мышки точка появляется
        .on('mouseout', function () {
          if (
            !this.getAttribute('data-anomaly') &&
            !this.getAttribute('data-last-dote') &&
            !this.getAttribute('data-with-caption')
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

      let legend = svg
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
        .text(checkName(metricsName[0])); // здесь вызываем функцию которая проверяет не слишком ли длинное название и сокращает его

      // добовляем область выделения
      // lineName[0]
      //   .append("g")
      //   .attr("class", `brush-${that.id}`)
      //   .call(brush);

      let brush = lineName[0].append('g').attr('class', `brush`);

      brush
        .append('rect')
        .attr('class', `overlay`)
        //.attr("id", i)
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

      brushObj['selectionDown'] = () => {
        brushObj.mouseDown = true;
        brushObj.clearBrush();
        brushObj.startX = event.layerX - 65;
        brush
          .append('rect')
          .attr('class', `selection`)
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

      brushObj['selectionMove'] = () => {
        if (brushObj.mouseDown) {
          if (event.layerX - 65 - brushObj.startX > 0) {
            brushObj.direction = 'right';
            brushObj.endX = event.layerX - 65;
            brush
              .select(`.selection`)
              .attr('width', event.layerX - 65 - brushObj.startX);
          } else {
            brushObj.direction = 'left';
            brushObj.endX =
              brushObj.startX + (event.layerX - 65 - brushObj.startX);
            brush
              .select(`.selection`)
              .attr(
                'x',
                brushObj.startX + (event.layerX - 65 - brushObj.startX)
              )
              .attr('width', -(event.layerX - 65 - brushObj.startX));
          }
        }
      };

      brushObj['selectionUp'] = () => {
        brushObj.mouseDown = false;
        if (brushObj.direction === 'left') {
          let change = brushObj.startX;
          brushObj.startX = brushObj.endX;
          brushObj.endX = change;
        }
        if (brush.select(`.selection`).attr('width') > 5) {
          updateData([brushObj.startX, brushObj.endX], brushObj);
        }
      };

      brushObj['clearBrush'] = () => {
        brushObj.selections = brush.selectAll(`.selection`).nodes();
        if (brushObj.selections.length !== 0) {
          brushObj.selections.forEach((item, i) => {
            brushObj.selections[i].remove();
          });
        }
      };

      function verticalLineX() {
        let linesX = svg.selectAll(`.grid-line-x`).nodes();
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
        let group = svg.append('g').attr('class', 'vetical-line-group');

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
          .on('mouseover', function () {
            tooltip
              .style('opacity', '1')
              .style('visibility', 'visible')
              .html(`<p>${d[item]}</p>`)
              .style('top', event.layerY - 30 + 'px')
              .style('right', 'auto')
              .style('left', event.layerX + 20 + 'px');
            if (event.layerX + 100 > width) {
              tooltip
                .style('left', 'auto')
                .style('right', width - event.layerX + 110 + 'px');
            }
          }) // при наведении мышки точка появляется
          .on('mouseout', function () {
            tooltip.style('opacity', '0').style('visibility', 'hidden');
          });
      }

      function putLabelDot(attr, classText, d, metric, that) {
        that.setAttribute('fill', colors[0]); // красим точку в другой цвет
        that.style = 'opacity:1'; // и постоянно ее отображаем
        that.setAttribute(attr, 'true'); // так же зададим атрибут сосбтвенный, чтобы потом понимать с какой точки мышка ушла
        svg
          .append('text') // текст легенды (название метрики)
          .attr('class', classText)
          .attr(
            'transform',
            `translate(${x(d[xMetric] * secondTransf)},${
              y(d[metricsName[0]]) - 10
            })`
          )
          .attr('font-size', `0.7em`)
          .attr('text-anchor', 'end')
          .style('fill', colors[1])
          .text(d[metric])
          .on('mouseover', function () {
            if (brushObj.mouseDown) {
              brushObj.selectionMove();
            }
          })
          .on('mousemove', function () {
            if (brushObj.mouseDown) {
              brushObj.selectionMove();
            }
          })
          .on('mouseup', () => {
            brushObj.selectionUp();
          });
      }

      function checkName(name) {
        // функция которая проверяет не слишком ли длинное название и сокращает его
        if (name.length > 10) {
          // если там больше 10 символов
          name = name.substring(0, 10) + '...'; // обрезаем и добовляем троеточие
        }
        return name;
      }

      function addHall(j) {
        // функция создающяя линию коридора

        lineName[j] = svg
          .append('g') // добовляем объект для линии коридора, верхней или нижней
          .attr('clip-path', `url(#clip-${that.id})`);

        // Добовляем  саму линию
        lineName[j]
          .append('path')
          .datum(data)
          .attr('class', 'lineHall') // добовляем свой класс
          .attr('fill', 'none')
          .attr('stroke', colors[0])
          .style('stroke-dasharray', '3 3')
          .attr('stroke-width', 1.5)
          .attr(
            'd',
            d3
              .line()
              .x(function (d, i) {
                addToArea(x(d[xMetric] * secondTransf), i, 'x', metricsName[j]);
                return x(d[xMetric] * secondTransf);
              }) // тут вызываем функцию которая еще и правлиьно формирует точки
              // для области закрашивания между линиями коридора
              .y(function (d, i) {
                addToArea(y(d[metricsName[j]]), i, 'y', metricsName[j]);
                return y(d[metricsName[j]]);
              })
          );
      }

      function addToArea(item, i, point, name) {
        // функция которая создает правильный массив точек для области закрашивания коридора

        if (!areaData[i]) {
          // если элемнета массива еще нет
          areaData[i] = {
            // то создаем его нужным нам образом
            above: { x: null, y: null },
            below: { x: null, y: null },
          };
        }
        name.indexOf('upperbound') !== -1
          ? (areaData[i].above[point] = item)
          : (areaData[i].below[point] = item); // и наполняем его значениями
      }

      function updateData(extent, brushObj) {
        // функция которая вызывается каждый раз, когда происходит выделение области (brush)

        //let extent = d3.event.selection;  // значения выделенной области

        if (extent) {
          // если область выделена всё-таки
          let diapason;
          if (time) {
            diapason = [
              parseInt(new Date(x.invert(extent[0])).getTime() / 1000),
              parseInt(new Date(x.invert(extent[1])).getTime() / 1000),
            ]; // получаем эти значения в нужном нам виде
          } else {
            diapason = [
              parseFloat(x.invert(extent[0]).toFixed(5)),
              parseFloat(x.invert(extent[1]).toFixed(5)),
            ];
          }

          that.setClick(diapason, 'select'); // вызываем функцию создающию токены

          zoom(extent, brushObj); // делаем зумирование  графика
        }
      }

      function zoom(extent, brushObj) {
        // функция делающяя зумирование графика

        x.domain([x.invert(extent[0]), x.invert(extent[1])]); // меняем значения оси х на основе нашего выделенного диапазона
        //lineName[0].select(`.brush-${that.id}`).call(brush.move, null);  // убираем область выделения
        brushObj.clearBrush();

        if (time) {
          xAxis
            .transition()
            .duration(secondTransf)
            .call(
              d3
                .axisBottom(x)
                .tickFormat(d3.timeFormat('%d-%m-%Y '))
                .tickValues(
                  x.ticks().filter((item, i) => {
                    if (i % 2 === 0) {
                      return item;
                    }
                  })
                )
                .ticks(5)
            ); // растягиваем плавно ось x
        } else {
          xAxis.transition().duration(1000).call(d3.axisBottom(x));
        }

        verticalLineX();

        changeZoom(1000); // вызываем функцию которая перересует все линии и точки как надо

        svg.on('dblclick', function () {
          // если дважды щелкнуть по любому месту
          if (time) {
            x.domain(
              d3.extent(data, function (d) {
                return new Date(d[xMetric] * secondTransf);
              })
            ); // то вернем ось х в исходное состояние
            xAxis
              .transition()
              .duration(secondTransf)
              .call(
                d3
                  .axisBottom(x)
                  .tickFormat(d3.timeFormat('%d-%m-%Y '))
                  .tickValues(
                    x.ticks().filter((item, i) => {
                      if (i % 2 === 0) {
                        return item;
                      }
                    })
                  )
                  .ticks(5)
              );
          } else {
            x.domain([minX, maxX]);
            xAxis.transition().duration(1000).call(d3.axisBottom(x));
          }

          verticalLineX();

          changeZoom(300); // и вернем все линии  в исходное состояние
        });

        function changeZoom(dauration) {
          // функция которая перерисовывает все линии
          lineName[0] // основная линия
            .select('.line')
            .transition()
            .duration(dauration)
            .attr(
              'd',
              d3
                .line()
                .x(function (d) {
                  return x(d[xMetric] * secondTransf);
                })
                .y(function (d) {
                  return y(d[metricsName[0]]);
                })
            );
          let dotLabelPos = [];
          let lastDotPos = null;

          svg // все точки на графике
            .selectAll('.dot')
            .transition()
            .duration(dauration)
            .attr('cx', function (d) {
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
            .attr('cy', function (d) {
              return y(d[metricsName[0]]);
            });

          svg
            .selectAll('.caption-dot-text')
            .transition()
            .duration(dauration)
            .attr('transform', function (d, i) {
              return `translate(${dotLabelPos[i].x},${dotLabelPos[i].y})`;
            });
          if (lastDotPos != null) {
            svg
              .select('.last-dot-text')
              .transition()
              .duration(dauration)
              .attr('transform', `translate(${lastDotPos.x},${lastDotPos.y})`);
          }

          let group = svg.selectAll('.vetical-line-group');

          group
            .selectAll('.vetical-line')
            .transition()
            .duration(dauration)
            .attr('x1', function () {
              return x(this.getAttribute('xVal'));
            })
            .attr('x2', function () {
              return x(this.getAttribute('xVal'));
            });

          group
            .selectAll('.dot-vertical')
            .transition()
            .duration(dauration)
            .attr('cx', function () {
              return x(this.getAttribute('xVal'));
            });

          if (metricsName[1] && metricsName[2]) {
            // проверяем если коридор есть

            addHallBrush(1, dauration); // его тоже перерисовываем
            addHallBrush(2, dauration);

            svg // и закрашиваем
              .select('.area')
              .transition()
              .duration(dauration)
              .attr(
                'd',
                d3
                  .area()
                  .x(function (d) {
                    return d.above.x;
                  })
                  .y0(function (d) {
                    return d.below.y;
                  })
                  .y1(function (d) {
                    return d.above.y;
                  })
              );
          }

          function addHallBrush(j, duration) {
            // функция которая перерисовывает коридор

            // Добовляем линию
            lineName[j] // линии кордиора - нижняя и верхняя
              .select('.lineHall')
              .transition()
              .duration(duration)
              .attr(
                'd',
                d3
                  .line()
                  .x(function (d, i) {
                    addToArea(
                      x(d[xMetric] * secondTransf),
                      i,
                      'x',
                      metricsName[j]
                    );
                    return x(d[xMetric] * secondTransf);
                  }) // приходиться пересчитывать массив с точками для коридора снова
                  .y(function (d, i) {
                    addToArea(y(d[metricsName[j]]), i, 'y', metricsName[j]);
                    return y(d[metricsName[j]]);
                  })
              );
          }
        }
      }
    },
    setClick: function (point, action) {
      let tockens = this.$store.getters.getTockens(this.idDash);
      let tocken = {};

      let setTocken = (value) => {
        this.$store.commit('setTocken', {
          tocken: tocken,
          idDash: this.idDash,
          value: value,
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
          tockens[i].elem === this.id &&
          tockens[i].action === action &&
          tockens[i].capture === 'pointX'
        ) {
          setTocken(point.x);
          // this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: point.x });
        } else if (
          tockens[i].elem === this.id &&
          tockens[i].action === action &&
          tockens[i].capture === 'pointY'
        ) {
          setTocken(point.y);
          // this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: point.y });
        } else if (
          tockens[i].elem === this.id &&
          tockens[i].action === action &&
          tockens[i].capture === 'start'
        ) {
          setTocken(point[0]);
          //  this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: point[0] });
        } else if (
          tockens[i].elem === this.id &&
          tockens[i].action === action &&
          tockens[i].capture === 'end'
        ) {
          setTocken(point[1]);
          // this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: point[1] });
        }
      });

      let events = this.$store.getters.getEvents({
        idDash: this.idDash,
        event: 'onclick',
        element: this.id,
        partelement: 'point',
      });

      if (events.length !== 0) {
        events.forEach((item) => {
          if (item.action === 'set') {
            this.$store.commit('letEventSet', {
              events: events,
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
