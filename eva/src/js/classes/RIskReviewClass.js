import * as d3 from 'd3';

export default class RIskReviewClass {
    // Общие настройки
    options = {};

    width = null;

    height = null;

    marginX = 0;

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

    textBlocks = [];

    toDivide = (number) => `${number}`;

    // Технические поля
    svg = null;

    // Проверка данных на валидность
    static validateData(dataRest, requiredFields, isLoading) {
      if (dataRest.length <= 0) {
        if (isLoading) {
          return { isValid: false, error: 'Загрузка...' };
        }
        return { isValid: false, error: 'Нет данных для построения.' };
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const dsItem of dataRest) {
        const dsCols = Object.keys(dsItem);
        // eslint-disable-next-line no-restricted-syntax
        for (const field of requiredFields) {
          if (!dsCols.includes(field)) {
            return {
              isValid: false,
              error: `Отсутствует столбец данных "${field}"`,
            };
          }
        }
      }

      // eslint-disable-next-line no-underscore-dangle
      const orderList = dataRest.map((el, index) => (typeof el._order !== 'undefined'
      // eslint-disable-next-line no-underscore-dangle
        ? el._order
        : index)).sort((a, b) => a - b);
      let counter = 0;
      const uniqueOrderList = [...new Set(orderList)];
      if (orderList.length !== uniqueOrderList.length) {
        return {
          isValid: false,
          error: 'Некорректно заполнено поле "_order".\n '
              + 'Поле должно быть заполнено начиная с 0, без пропусков.',
        };
      }
      if (Math.min(orderList) > 0) {
        return { isValid: false, error: 'Некорректно заполнено поле "_order"' };
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const order of orderList) {
        if (order !== counter) return { isValid: false, error: 'Некорректно заполнено поле "_order"' };
        counter += 1;
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
      const extent = [0];
      this.barParts.forEach((part) => {
        this.dataRest.forEach((ds) => {
          extent.push(ds[part.id]);
          if (part?.idStart) {
            extent.push(ds[part.idStart] + ds[part.id]);
          }
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
      marginY,
      toDivideFn,
    }) {
      this.svgContainer = container;
      this.dataRest = dataRest;
      this.barParts = barParts;
      this.options = options;
      if (paddingOuter) this.paddingOuter = paddingOuter;
      if (paddingInner) this.paddingInner = paddingInner;
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

    // Очистить полотно
    clear() {
      d3.select(this.svgContainer).select('svg').remove();
      this.textBlocks = [];
    }

    render(rerender = false) {
      this.clear();
      this.prepareRenderData();
      this.createXAxis();
      this.createElements();
      if (!rerender) {
        setTimeout(() => {
          this.fitContent();
        }, 0);
      }
    }

    fitContent() {
      const gBox = d3.select(this.svgContainer).select('.content-g').node().getBBox();
      const containerWidth = this.svgContainer.offsetWidth;
      const gWidth = gBox.width + Math.abs(gBox.x);
      const updatedWidth = gWidth + (gWidth * 0.005);
      if (containerWidth < updatedWidth) {
        this.marginX = (updatedWidth - containerWidth);
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
      const sizeOfChar = 32;
      const paddingXOfChar = 16;
      const sizeOfNumber = this.getMaxCountChars() * sizeOfChar + paddingXOfChar;
      const widthSVGContainer = this.svgContainer.offsetWidth;
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

    createTextBlocks() {
      for (let i = 0; i < Object.keys(this.textBlocks).length; i += 1) {
        const element = this.textBlocks[i];
        const {
          textPosY,
          textPosX,
          textColor,
          textOffset,
          yPosition,
          value,
          type,
          startValue,
          isFullHeight,
        } = element;
        const { barHeight } = this;
        const getHorizontalAnchor = (anchor = 'default') => {
          const anchorList = {
            default: startValue ? startValue + value : value,
            center: startValue ? startValue + (value / 2) : value / 2,
          };
          if (anchorList[anchor]) {
            return anchorList[anchor];
          }
          return anchorList.default;
        };
        // const textXPosition = this.xScale(startValue ? startValue + value : value);
        const textXPosition = textPosX
          ? this.xScale(getHorizontalAnchor(textPosX))
          : this.xScale(getHorizontalAnchor());
        const textXPositionWithOffset = value >= 0
          ? textXPosition + +textOffset
          : textXPosition - +textOffset;
        this.svg
          .append('text')
          .text(() => `${Number(value) >= 0 ? '+' : ''}${this.toDivide(value)}`)
          .attr('y', () => {
            const yPositions = {
              top: yPosition,
              center: yPosition + this.barHeight / 2,
              bottom: yPosition + this.barHeight,
            };
            return yPositions[textPosY];
          })
          .attr('class', 'bar-text-caption')
          .attr('fill', textColor)
          .attr('text-anchor', value >= 0 ? 'start' : 'end')
          .attr('x', textPosX === 'center' ? textXPosition : textXPositionWithOffset)
        // eslint-disable-next-line func-names
          .attr('dy', function () {
            const textHeight = this.getBBox().height;
            const textPositionsY = {
              line: {
                top: textHeight - (textHeight * 1.15),
                bottom: textHeight * 0.6,
                center: textHeight * 0.3,
              },
              bar: {
                top: isFullHeight
                  ? textHeight - (textHeight * 1)
                  : textHeight - (textHeight * 1),
                bottom: isFullHeight
                  ? textHeight * 0.6
                  : textHeight - (textHeight * 2.2),
                center: isFullHeight
                  ? textHeight * 0.3
                  : textHeight * 1.25 * -1,
              },
            };
            return textPositionsY[type][textPosY];
          })
        // eslint-disable-next-line func-names
          .attr('dx', function () {
            const textWidth = this.getBBox().width;
            const textDX = {
              default: 0,
              center: value >= 0 ? (textWidth / 2) * -1 : textWidth / 2,
            };
            return type === 'line' ? textDX.default : textDX[textPosX];
          });
      }
    }

    prepareTextBlock({
      textPosY,
      textPosX,
      textColor,
      textOffset,
      xPosition,
      yPosition,
      value,
      startValue,
      isFullHeight = true,
      type,
      id,
    }) {
      this.textBlocks.push({
        textPosY,
        textPosX,
        textColor,
        textOffset,
        xPosition,
        yPosition,
        value,
        startValue,
        isFullHeight,
        type,
        id,
      });
    }

    createElements() {
      // eslint-disable-next-line no-restricted-syntax
      for (const part of this.barParts) {
        const { type } = part;
        // eslint-disable-next-line no-continue
        if (type === 'line') {
          this.createLines(part);
        }
        if (type === 'bar') {
          this.createBars(part);
        }
      }
      this.createTextBlocks();
    }

    createLines(part) {
      const {
        id,
        fill = 'var(--main_text)',
        textColor,
        type,
        isTitleShow = true,
        hideZeroValue = false,
        textPosY = 'center',
        textPosX = 'default',
        textOffset = 10,
      } = part;
        // eslint-disable-next-line for-direction
      for (let i = 0; i < this.dataRest.length; i += 1) {
        const data = this.dataRest[i];
        const value = data[id] || 0;
        const xPosition = this.xScale(value);
        const yPosition = this.yScale(i);
        const line = d3.line();
        const isZeroValue = value === 0 || `${value}` === '-0' || `${value}` === '+0';
        const isHideZeroValue = hideZeroValue && isZeroValue;
        if (!isHideZeroValue) {
          const strokeColor = hideZeroValue && value === 0 ? 'transparent' : fill;
          const strokeWidth = isHideZeroValue ? 5 : 3;
          this.svg
            .append('g')
            .attr('class', `element-${id}`)
            .append('path')
            .attr('class', 'line-elem')
            .attr('stroke', strokeColor)
            .attr('stroke-width', strokeWidth)
            .attr('d', line(
              [
                [xPosition, yPosition - 5],
                [xPosition, yPosition + this.barHeight + 5],
              ],
            ))
            .on('click', () => {
              if (this.setTokenFn) {
                this.setTokenFn(data);
              }
            });
          if (isTitleShow) {
            this.prepareTextBlock({
              textPosY,
              textPosX,
              textColor: textColor || fill,
              textOffset,
              xPosition,
              yPosition,
              value,
              type,
              id,
            });
          }
        }
      }
    }

    createBars(part) {
      const halfBarHeight = this.barHeight / 2;
      const {
        id,
        idStart,
        textPosY = 'center',
        textPosX = 'default',
        textColor,
        textOffset = 10,
        hideZeroValue = false,
        type,
        fill = 'var(--main_text)',
        isTitleShow = false,
        isFullHeight = true,
      } = part;
      const height = isFullHeight ? this.barHeight : halfBarHeight;
      // eslint-disable-next-line no-restricted-syntax
      for (let i = 0; i < this.dataRest.length; i += 1) {
        const data = this.dataRest[i];
        const value = data[id] || 0;
        // eslint-disable-next-line no-continue
        if (!(value === 0 && hideZeroValue)) {
          const xPosition = this.calcBarXPosition({
            value,
            data,
            id,
            idStart,
            hideZeroValue,
          });
          const yPosition = this.calcBarYPosition({
            height,
            index: i,
            isFullHeight,
          });
          const width = this.calcBarWidth({
            hideZeroValue,
            id,
            idStart,
            data,
          });
          this.svg.append('g')
            .attr('class', `element-${id}`)
            .append('rect')
            .attr('class', 'bar-elem')
            .attr('x', xPosition)
            .attr('y', yPosition)
            .attr('fill', fill)
            .attr('height', height)
            .attr('width', width)
            .on('click', () => {
              if (this.setTokenFn) {
                this.setTokenFn(data);
              }
            });
          if (isTitleShow) {
            this.prepareTextBlock({
              textPosY,
              textPosX,
              textColor: textColor || fill,
              textOffset,
              yPosition,
              xPosition,
              isFullHeight,
              value,
              type,
              startValue: data[idStart],
              id,
            });
          }
        }
      }
    }

    calcBarXPosition({
      value, data, id, idStart, hideZeroValue,
    }) {
      let valueStart = 0;
      if (idStart) {
        valueStart = data[idStart] || 0;
      }
      let xPosition = this.xScale(Math.min(valueStart, value + valueStart));
      if (data[id] === 0 && hideZeroValue) {
        xPosition = 0;
      }
      return xPosition;
    }

    calcBarYPosition({
      height, index, isFullHeight,
    }) {
      const y = this.yScale(index);
      return isFullHeight ? y : y + height / 2;
    }

    calcBarWidth({
      hideZeroValue,
      idStart,
      id,
      data,
    }) {
      const start = idStart ? data[idStart] : 0;
      const width = Math.abs(this.xScale(data[id] + start) - this.xScale(start));
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(width) || (data[id] === 0 && hideZeroValue)) {
        return 0;
      }
      if (width > 1) {
        return width;
      }
      return width + 1;
    }
}
