import * as d3 from 'd3';

export default class RIskReviewClass {
    // Общие настройки
    options = {};

    width = null;

    height = null;

    marginX = 0;

    marginY = 0;

    paddingInner = 0.3;

    paddingOuter = 0.7;

    chartPaddingInner = 0;

    chartPaddingOuter = 0;

    barHeight = 0;

    svgContainer = null;

    dataRest = [];

    barParts = [];

    dataAttr = [];

    onClickFn = null;

    setTokenFn = null;

    toDivide = (number) => `${number}`;

    // Технические поля
    svg = null;

    // Проверка данных на валидность
    static validateData(dataRest, barParts, isLoading) {
      if (dataRest.length <= 0) {
        if (isLoading) {
          return { isValid: false, error: 'Загрузка' };
        }
        return { isValid: false, error: 'Нет данных для построения' };
      }

      if (barParts.length <= 0) {
        return { isValid: false, error: 'Не указаны части столбцов' };
      }

      const dsCols = Object.keys(dataRest[0]);

      // eslint-disable-next-line no-restricted-syntax
      for (const id of barParts.map((p) => p.id)) {
        if (!dsCols.includes(id)) {
          return { isValid: false, error: `Отсутствует столбец данных "${id}"` };
        }
      }

      return { isValid: true, error: '' };
    }

    get chartPaddingInner() {
      return this.chartPaddingInner;
    }

    set chartPaddingInner(val) {
      this.chartPaddingInner = val;
    }

    get chartPaddingOuter() {
      return this.chartPaddingOuter;
    }

    set chartPaddingOuter(val) {
      this.chartPaddingOuter = val;
    }

    get barHeight() {
      return this.barHeight;
    }

    set barHeight(val) {
      this.barHeight = val;
    }

    get xScale() {
      const extent = [];
      this.barParts.forEach((part) => {
        this.dataRest.forEach((ds) => {
          extent.push(ds[part.id]);
          extent.push(ds[part.idStart] + ds[part.id]);
        });
      });

      const xDomain = d3.extent(extent);
      const symbolWidth = 10;
      const symbolCount = Math.round((`${xDomain[0]}`.length + `${xDomain[1]}`.length) / 2);
      const width = this.svgContainer.offsetWidth - (this.marginX * 2);

      return d3.scaleLinear()
        .range([symbolCount * symbolWidth, width - (symbolCount * symbolWidth)])
        .domain(d3.extent(xDomain));
    }

    get yScale() {
      const height = (this.height) - this.marginY * 2;

      return d3.scaleBand()
        .range([0, height])
        .domain(this.dataRest.map((b, i) => i))
        .paddingInner(this.paddingInner)
        .paddingOuter(this.paddingOuter);
    }

    constructor({
      container,
      width,
      height,
      dataRest = [],
      barParts = [],
      options = {},
      paddingOuter = 0.5,
      paddingInner = 0.5,
      setTokenFn = null,
      onClickFn = null,
      marginX = 0,
      marginY = 0,
      toDivideFn,
    }) {
      this.svgContainer = container;
      this.dataRest = dataRest;
      this.barParts = barParts;
      this.options = options;
      this.paddingOuter = paddingOuter;
      this.paddingInner = paddingInner;
      this.setTokenFn = setTokenFn;
      this.onClickFn = onClickFn;
      this.width = width;
      this.height = height;
      this.marginX = marginX;
      this.marginY = marginY;
      if (toDivideFn) {
        this.toDivide = toDivideFn;
      }

      this.render();
    }

    // Очистить полотно
    clear() {
      d3.select(this.svgContainer).select('svg').remove();
    }

    render() {
      this.clear();
      this.prepareRenderData();
      this.createXAxis();
      this.createBars();
      this.createLines();
    }

    createSvg() {
      this.svg = d3.select(this.svgContainer)
        .append('svg')
        .attr('class', 'content')
        .append('g')
        .attr('transform', `translate(${this.marginX}, ${this.marginY})`);

      this.svg.append('rect')
        .attr('class', 'chart-back')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', '100%')
        .attr('height', '100%');
    }

    prepareRenderData() {
      this.createSvg();
      this.barHeight = this.yScale.bandwidth();
      this.chartPaddingInner = this.yScale.step() * this.paddingInner;
      this.chartPaddingOuter = this.yScale.step() * this.paddingOuter;
    }

    getMaxCountChars() {
      let maxNumLength = 0;

      this.barParts.forEach((part) => {
        this.dataRest.forEach((ds) => {
          const number = ds[part.id];
          const numLength = number.toString().length;
          if (numLength > maxNumLength) {
            maxNumLength = numLength;
          }
        });
      });

      return maxNumLength;
    }

    createXAxis() {
      const paddingXOfChart = 70;
      const sizeOfChar = 16;
      const paddingXOfChar = 16;
      const sizeOfNumber = this.getMaxCountChars() * sizeOfChar + paddingXOfChar;
      const widthSVGContainer = this.svgContainer.offsetWidth - this.marginX * 2;
      const axis = this.svg
        .append('g')
        .attr('fill', 'black')
        .call(d3.axisBottom(this.xScale)
          .ticks((widthSVGContainer - paddingXOfChart) / sizeOfNumber)
          .tickFormat((d) => this.toDivide(d)));

      // eslint-disable-next-line func-names
      axis.selectAll('.tick line').each(() => {
        d3.select(this).remove();
      });
      // eslint-disable-next-line func-names
      axis.selectAll('.tick text').each(function () {
        d3.select(this)
          .attr('class', 'x-axis-tick-caption');
      });
      axis.select('.domain').remove();
    }

    createBars() {
      const halfBarHeight = this.barHeight / 2;

      const { toDivide } = this;

      // eslint-disable-next-line no-restricted-syntax
      for (const part of this.barParts) {
        const {
          id, idStart, type, textPosY, textPosX, textColor, textOffset = 10,
        } = part;

        // eslint-disable-next-line no-continue
        if (type !== 'bar') continue;

        const {
          fill = 'var(--secondary_text)',
          isTitleShow = false,
          isFullHeight = true,
        } = part;

        const height = isFullHeight ? this.barHeight : halfBarHeight;

        this.svg.selectAll()
          .data(this.dataRest)
          .enter()
          .append('rect')
          .attr('x', (d) => {
            const start = idStart ? d[idStart] : 0;
            const width = this.xScale(d[id] + start) - this.xScale(start);
            const startX = idStart ? d[idStart] : 0;
            if (start !== 0) {
              return this.xScale(Math.min(startX, d[id] + startX));
            }
            if (width > 0) {
              return this.xScale(Math.min(startX, d[id] + startX)) + 1;
            }
            return this.xScale(Math.min(startX, d[id] + startX)) - 1;
          })
          .attr('y', (d, i) => {
            const y = this.yScale(i);

            if (isTitleShow) {
              const xData = d[id];
              const textPositionsX = {
                default: idStart ? xData + d[idStart] : xData,
                center: idStart ? xData + (d[idStart] / 2) : xData / 2,
              };
              const x = textPosX
                ? this.xScale(textPositionsX[textPosX])
                : this.xScale(textPositionsX.default);
              const xAttr = xData >= 0 ? x + +textOffset : x - +textOffset;
              const yAttr = y + this.barHeight / 2;
              const anchor = xData >= 0 ? 'start' : 'end';
              this.svg.append('text')
                .text(Number(xData) >= 0 ? `+${toDivide(xData)}` : toDivide(xData))
                .attr('class', 'bar-text-caption')
                .attr('fill', textColor || fill)
                .attr('text-anchor', anchor)
                .attr('x', xAttr)
                .attr('y', yAttr)
              // eslint-disable-next-line func-names
                .attr('dy', function () {
                  const textHeight = this.getBBox().height;
                  const textPositionsY = {
                    top: textHeight - (textHeight * 3),
                    bottom: textHeight * 2.5,
                    center: textHeight / 3,
                  };
                  return textPosY ? textPositionsY[textPosY] : textHeight / 3;
                });
            }

            return isFullHeight ? y : y + height / 2;
          })
          .attr('fill', fill)
          .attr('height', height)
          .attr('width', (d) => {
            const start = idStart ? d[idStart] : 0;
            const width = Math.abs(this.xScale(d[id] + start) - this.xScale(start));
            // eslint-disable-next-line no-restricted-globals
            if (isNaN(width)) {
              return 1;
            }
            if (width > 1) {
              return width;
            }
            return width + 1;
          })
          .on('click', (event) => {
            if (this.setTokenFn) {
              this.setTokenFn(event);
            }
          });
      }
    }

    createLines() {
      // eslint-disable-next-line no-restricted-syntax
      for (const part of this.barParts) {
        const {
          id, type, fill = 'var(--pink)', isTitleShow = true,
        } = part;

        // eslint-disable-next-line no-continue
        if (type !== 'line') continue;

        this.dataRest.forEach((bar, i) => {
          const value = bar[id];
          const x = this.xScale(value);
          const y = this.yScale(i);
          const line = d3.line();

          this.svg.append('path')
            .attr('stroke', fill)
            .attr('stroke-width', 3)
            .attr('d', line([[x, y - 5], [x, y + this.barHeight + 5]]));

          if (isTitleShow) {
            this.svg.append('text')
              .text(value)
              .attr('class', 'bar-text-caption')
              .attr('fill', fill)
              .attr('text-anchor', 'end')
              .attr('x', x - 5)
              .attr('y', y + this.barHeight / 2)
            // eslint-disable-next-line func-names
              .attr('dy', function () {
                const textHeight = this.getBBox().height;
                return textHeight / 3;
              });
          }
        });
      }
    }
}
