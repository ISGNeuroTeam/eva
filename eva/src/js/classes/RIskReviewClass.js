import * as d3 from 'd3';

export default class RIskReviewClass {
    // Общие настройки
    options = {};

    width = null;

    height = null;

    marginX = 10;

    marginY = 0;

    paddingInner = 0.5;

    paddingOuter = 0.2;

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

      // eslint-disable-next-line no-restricted-syntax
      for (const dsItem of dataRest) {
        const dsCols = Object.keys(dsItem);
        // eslint-disable-next-line no-restricted-syntax
        for (const bar of barParts) {
          if (!dsCols.includes(bar.id)) {
            return { isValid: false, error: `Отсутствует столбец данных "${bar.id}"` };
          }
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
      const height = (this.height) - 40;

      return d3.scaleBand()
        .range([30, height])
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
      paddingOuter,
      paddingInner,
      setTokenFn = null,
      onClickFn = null,
      marginX,
      marginY,
      toDivideFn,
    }) {
      this.svgContainer = container;
      this.dataRest = dataRest;
      this.barParts = barParts;
      this.options = options;
      if (paddingOuter) this.paddingOuter = paddingOuter;
      if (paddingInner) this.paddingInner = paddingInner;
      if (marginX) this.marginX = marginX;
      if (marginY) this.marginY = marginY;
      this.setTokenFn = setTokenFn;
      this.onClickFn = onClickFn;
      this.width = width;
      this.height = height;
      if (toDivideFn) {
        this.toDivide = toDivideFn;
      }
      this.render();
    }

    filteringData() {
      const updatedData = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const currentItem of this.dataRest) {
        const updatedItem = {};

        // eslint-disable-next-line no-restricted-syntax
        for (const currentBar of this.barParts) {
          const targetId = currentBar.id;
          const currentValue = currentItem[targetId];

          if (!currentBar.hideZeroValue || Math.abs(Number(currentValue)) !== 0) {
            updatedItem[targetId] = currentValue;
          }
        }

        updatedData.push(updatedItem);
      }

      this.dataRest = updatedData;
    }

    // Очистить полотно
    clear() {
      d3.select(this.svgContainer).select('svg').remove();
    }

    render(rerender = false) {
      this.clear();
      this.prepareRenderData();
      this.createXAxis();
      this.createBars();
      this.createLines();
      if (!rerender) {
        setTimeout(() => {
          this.fitContent();
        }, 0);
      }
    }

    fitContent() {
      const gBox = d3.select(this.svgContainer).select('.content-g').node().getBBox();
      const containerWidth = this.svgContainer.offsetWidth;
      const gXOffsetLeft = Math.round(Math.abs(gBox.x + (gBox.x * 0.05)));
      let gXOffsetRight = 0;
      if (gBox.width > containerWidth) {
        const boxSizeWithOffset = Math.abs(Math.round(gBox.width + (gBox.width * 0.05)));
        gXOffsetRight = boxSizeWithOffset - containerWidth;
      }
      const updatedMarginX = gXOffsetRight + gXOffsetLeft;
      if (updatedMarginX > 0) {
        this.marginX += updatedMarginX;
        this.render(true);
      }
    }

    createSvg() {
      this.svg = d3.select(this.svgContainer)
        .append('svg')
        .attr('class', 'content')
        .append('g')
        .attr('class', 'content-g')
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
          if (number) {
            const numLength = number.toString().length;
            if (numLength > maxNumLength) {
              maxNumLength = numLength;
            }
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

      // eslint-disable-next-line no-restricted-syntax
      for (const part of this.barParts) {
        const {
          id, idStart, type, textPosY, textPosX, textColor, textOffset = 10, hideZeroValue,
        } = part;

        // eslint-disable-next-line no-continue
        if (type !== 'bar') continue;

        const {
          fill = 'var(--main_text)',
          isTitleShow = false,
          isFullHeight = true,
        } = part;

        const height = isFullHeight ? this.barHeight : halfBarHeight;

        this.svg.selectAll()
          .data(this.dataRest)
          .enter()
          .append('rect')
          .attr('x', (d) => {
            const value = typeof d[id] !== 'undefined' ? d[id] : 0;
            const startValue = typeof d[idStart] !== 'undefined' ? d[idStart] : 0;
            const start = idStart ? startValue : 0;
            const width = this.xScale(value + start) - this.xScale(start);
            const startX = idStart ? startValue : 0;
            if (start !== 0) {
              return this.xScale(Math.min(startX, value + startX));
            }
            if (d[id] === 0 && hideZeroValue) {
              return 0;
            }
            if (width > 0) {
              return this.xScale(Math.min(startX, value + startX)) + 1;
            }
            return this.xScale(Math.min(startX, value + startX)) - 1;
          })
          .attr('y', (d, i) => {
            const y = this.yScale(i);

            if (isTitleShow && (typeof d[id] !== 'undefined')) {
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
                .text(() => {
                  if (hideZeroValue && xData === 0) {
                    return '';
                  }
                  return Number(xData) >= 0 ? `+${this.toDivide(xData)}` : this.toDivide(xData);
                })
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
            if (isNaN(width) || (d[id] === 0 && hideZeroValue)) {
              return 0;
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
          id, type, fill = 'var(--main_text)', textColor, isTitleShow = true, hideZeroValue,
        } = part;

        // eslint-disable-next-line no-continue
        if (type !== 'line') continue;

        this.dataRest.forEach((bar, i) => {
          const value = bar[id] ? Number(bar[id]) : 0;
          const x = this.xScale(value);
          const y = this.yScale(i);
          const line = d3.line();

          this.svg.append('path')
            .attr('stroke', () => {
              if (hideZeroValue && value === 0) {
                return 'transparent';
              }
              return fill;
            })
            .attr('stroke-width', () => {
              if (hideZeroValue && (value === 0 || `${value}` === '-0' || `${value}` === '+0')) {
                return 0;
              }
              return 3;
            })
            .attr('d', line([[x, y - 5], [x, y + this.barHeight + 5]]));

          if (isTitleShow) {
            this.svg.append('text')
              .text(() => {
                if (hideZeroValue && value === 0) {
                  return '';
                }
                if (`${value}` === '-0') {
                  return '-0';
                }
                return Number(value) >= 0 ? `+${this.toDivide(value)}` : this.toDivide(value);
              })
              .attr('class', 'bar-text-caption')
              .attr('fill', textColor || fill)
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
