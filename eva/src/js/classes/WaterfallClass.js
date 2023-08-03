import * as d3 from 'd3';

export default class WaterfallClass {
  options = {
    colorText: null,
    colorBarPositive: '#00dd00',
    colorBarNegative: '#dd0000',
    colorBarTotal: '#999999',
    xLabelRotate: true,
    barsOptions: [],
  }

  width = null

  height = null

  margin = {
    top: 20, right: 10, bottom: 30, left: 50,
  }

  innerVertOffset = [0, 0];

  padding = 0.2

  svgContainer = null

  dataSet = []

  onClick = null;

  constructor(svgContainer, width, height, options = {}) {
    this.options = { ...this.options, ...options };
    this.width = width;
    this.height = height;
    this.svgContainer = svgContainer;
    this.innerVertOffset = [0, 0];
    this.createChart();
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  get margin() {
    return this.margin;
  }

  set data(list) {
    this.dataSet = list.reduce((acc, item, idx) => {
      item.value = +item.value;
      if (idx === 0) {
        acc.push({ ...item, lastTotal: 0, total: item.value });
        return acc;
      }
      if (item.isTotal) {
        item.value = 0;
      }
      acc.push({
        ...item,
        lastTotal: acc[idx - 1].total,
        total: acc[idx - 1].total + item.value,
      });
      if (acc[idx - 1].comment) {
        // eslint-disable-next-line no-underscore-dangle
        acc[idx - 1]._next = {
          isTotal: acc[idx].isTotal,
          total: acc[idx].total,
        };
      }
      return acc;
    }, []);
  }

  get data() {
    return this.dataSet;
  }

  get groupedData() {
    if (this.data?.length === 0) {
      return [];
    }
    const groupedData = [];

    const group = {
      title: this.data[0].title,
      nextChildrenLength: null,
      children: [this.data[0]],
    };
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 1; i < this.data.length; i += 1) {
      const { title } = this.data[i];
      if (group.title === title) {
        group.children.push(this.data[i]);
      } else {
        groupedData.push(structuredClone(group));
        group.title = title;
        if (groupedData[groupedData.length - 2]) {
          groupedData[groupedData.length - 2].nextChildrenLength = group.children.length;
        }
        group.children = [this.data[i]];
      }
    }
    groupedData[groupedData.length - 1].nextChildrenLength = group.children.length;
    group.nextChildrenLength = null;
    groupedData.push(group);
    return groupedData;
  }

  update(data) {
    this.data = data;
    this.render();
  }

  updateOptions(options) {
    this.options = { ...this.options, ...options };
    this.render();
  }

  createChart(rerender = true) {
    if (!rerender) {
      this.svg.remove();
    }
    const { margin } = this;
    const { width, height } = this;

    this.svg = d3.select(this.svgContainer)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    // .style('outline', '1px dashed orange').style('outline-offset', '-1px');

    if (this.data.length === 0) {
      this.svg.append('text')
        .attr('x', this.width / 2 - 45)
        .attr('y', this.height / 2 - 20)
        .text('Нет данных');
    }

    this.createXAxis();
    this.createYAxis();

    // пересчет размеров осей
    const xAxisSizes = this.xAxis.node().getBBox();
    this.margin.bottom = xAxisSizes.height;
    const yAxisSizes = this.yAxis.node().getBBox();
    this.margin.left = yAxisSizes.width;

    // если ось х вышла за границу слева
    const { x } = this.svg.select('g.xAxis').node().getBBox();
    if (x < 0) {
      this.margin.left = -x + 10;
    }

    this.svg.attr('transform', `translate(${margin.left},${margin.top})`);
    this.xAxis.remove();
    this.createXAxis();
    this.yAxis.remove();
    this.createYAxis();
    this.createZeroLine();

    // add bar group=
    const barGroups = this.svg.selectAll('.bar')
      .data(this.groupedData)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', (d) => `translate(${this.x(d.title)},0)`)
    // TODO: Накинуть на элемент группы
      .on('click', (d) => this.onClick(d));
    this.createDefaultBars(barGroups, rerender);
    if (this.options.groupedBorder) {
      this.createGroupRect(barGroups);
    }
  }

  renderComments() {
    const { options } = this;
    const textVertOffset = 5;
    // eslint-disable-next-line max-len
    const textAreaLeftOffset = (this.x.bandwidth() * (this.padding / 4) + 2);
    const lineLeftOffset = textAreaLeftOffset - (textAreaLeftOffset * this.padding);
    const bandwidth1 = 1;
    const bandwidth2 = 2.1;
    const dataWithComments = this.data.filter((d) => d.comment);
    const barCommentParams = dataWithComments.map((d, idx) => {
      if (d.comment) {
        const elem = this.svg.append('foreignObject')
          .attr('width', () => `${this.x.bandwidth() * (idx + 1 === dataWithComments.length ? bandwidth1 : bandwidth2)}px`)
          .style('x', -1000)
          .style('overflow-y', 'scroll')
          .style('line-height', 1.15)
          .style('font-size', '12px')
          .style('padding-left', '4px')
          .html(() => this.formattedHtml(d));

        const elemText = this.svg.append('text')
          .style('x', -1000)
          .html(d.comment);

        const { scrollHeight } = elem.node();
        const heightLimit = this.height / 6; // 108
        const result = {
          scrollHeight,
          height: scrollHeight < heightLimit ? scrollHeight : heightLimit,
          width: elemText.node().scrollWidth,
        };
        elem.remove();
        elemText.remove();
        return result;
      }
      return 0;
    });
    const getForTwoColumns = (idx) => barCommentParams[idx].width > this.x.bandwidth() * 1.2
      && idx + 1 !== barCommentParams.length;

    this.svg.selectAll('.group-item')
      .filter((d) => d.comment)
      .append('rect')
      .attr('class', 'comment')
      .attr('x', 0)
      .attr('y', (d, idx) => {
        const { _next } = d;
        const points = [d.lastTotal, d.total];
        if (getForTwoColumns(idx)) {
          points.push(_next?.total);
        }
        if (d.isTotal || _next?.isTotal) {
          points.push(0);
        }
        const [min, max] = d3.extent(points);
        let pos = this.y(min);
        if (idx % 2 === 0) {
          pos = this.y(max) - barCommentParams[idx].height - textVertOffset - 10;
        } else {
          pos += textVertOffset + 10;
        }
        return pos;
      })
      .attr('width', (d, idx) => `${this.x.bandwidth() * ((getForTwoColumns(idx) ? bandwidth2 : bandwidth1) + 0.1)}px`)
      .attr('height', (d, idx) => {
        const opts = this.options.barsOptions.find(({ title }) => (title === d.title));
        return !opts?.hideComment ? barCommentParams[idx].height : 0;
      })
      .attr('fill', 'transparent');

    // верх низ графика
    const borders = { top: null, bottom: null };
    this.svg.selectAll('rect.comment').each((el, idx, els) => {
      const { y, height } = els[idx].getBBox();
      if (borders.top > y) borders.top = y;
      if (borders.bottom < y + height) borders.bottom = y + height;
    });
    this.svg.selectAll('rect.comment')
      .attr('height', (d, idx, els) => {
        const { scrollHeight, height } = barCommentParams[idx];
        if (scrollHeight > height) {
          const { y } = els[idx].getBBox();
          if (idx % 2) {
            /// если внизу
            // если блок влезет
            return scrollHeight + y <= borders.bottom ? scrollHeight : borders.bottom - y;
            // если не влезет
          }
          /// если вверху
          // если блок влезет
          if (y > 0) {
            if (y - scrollHeight + height > 0) {
              d3.select(els[idx]).attr('y', y - scrollHeight + height);
              return scrollHeight;
            }
            // если не влезет
            d3.select(els[idx]).attr('y', 0);
            return scrollHeight + y - scrollHeight + height;
          }
        }
        return height;
      });

    this.svg.selectAll('.group-item')
      .filter((d) => d.comment)
      .append('foreignObject')
      .attr('x', textAreaLeftOffset)
      .attr('y', (d, idx, els) => d3.select(els[idx].parentNode).select('.comment').node().getBBox().y)
      .attr('width', (d, idx) => `${this.x.bandwidth() * (getForTwoColumns(idx) ? bandwidth2 : bandwidth1)}px`)
      .attr('height', (d, idx, els) => d3.select(els[idx].parentNode).select('.comment').node().getBBox().height)
      .style('overflow-y', 'scroll')
      // .style('outline', '1px dashed red')
      .style('line-height', 1.15)
      .style('font-size', '12px')
      .style('padding-left', '4px')
      .attr('text-anchor', 'bottom')
      .html((d) => this.formattedHtml(d));

    this.svg.selectAll('.group-item')
      .filter((d) => d.comment)
      .append('line')
      .attr('class', 'vertical')
      .attr('x1', () => lineLeftOffset)
      .attr('x2', () => lineLeftOffset)
      .attr('y2', (d, idx, els) => {
        const { height, y } = d3.select(els[idx].parentNode).select('.comment').node().getBBox();
        return (idx % 2) ? (height + y) : y;
      })
      .attr('y1', (d, idx) => {
        const points = [d.lastTotal, d.total];
        if (d.isTotal) {
          points.push(0);
        }
        const [min, max] = d3.extent(points);
        let pos = this.y(min);
        if (idx % 2 === 0) {
          pos = this.y(max);
        }
        return pos;
      })
      .attr('stroke', ({
        title: barTitle, value, isTotal, color,
      }) => {
        if (this.options.barsOptions.length) {
          const opts = this.options.barsOptions.find(({ title }) => (title === barTitle));
          if (opts?.hideComment) {
            return 'transparent';
          }
          if (color) {
            return color;
          }
          if (opts?.changeColor) {
            return opts.color;
          }
        }
        if (isTotal) {
          return options.colorBarTotal;
        }
        return value < 0 ? options.colorBarNegative : options.colorBarPositive;
      })
      .attr('stroke-dasharray', '1 4 0')
      .attr('stroke-width', '2px');
  }

  formattedHtml(d) {
    const { options } = this;
    const opts = this.options.barsOptions.find(({ title }) => (title === d.title));
    if (opts?.hideComment) {
      return '';
    }
    let color;
    if (d.color) {
      color = d.color;
    } else if (opts?.changeColor) {
      color = opts.color;
    } else if (d.isTotal) {
      color = options.colorBarTotal;
    } else {
      color = d.value < 0 ? this.options.colorBarNegative : this.options.colorBarPositive;
    }
    return d.comment
      .replace(/(\(\s?[-+]?[\d\s.,]+\s?\))/g, (str) => {
        const {
          numberFormat = false,
          decimalPlacesLimits = 2,
        } = this.options;
        let printStr = str;
        const nums = str.match(/[-+]?[\d.]+/);
        if (nums.length === 1 && !Number.isNaN(Number(nums[0]))) {
          printStr = `(${Number(nums[0]).toLocaleString(numberFormat, {
            // minimumFractionDigits: decimalPlacesLimits,
            maximumFractionDigits: decimalPlacesLimits,
          })})`;
        }
        return `<tspan style="color: ${color}">${printStr}</tspan>`;
      });
  }

  render() {
    if (this.svg) {
      this.svg.remove();
    }
    this.createChart();
  }

  moveInNewContainer(container) {
    this.svgContainer = container;
    this.svg = d3.select(container)
      .append(() => this.svg.remove().node());
    this.render();
  }

  createXAxis() {
    const yHeight = this.height - this.margin.top - this.margin.bottom;
    const xWidth = this.width - this.margin.left - this.margin.right;

    this.x = d3.scaleBand()
      .domain(this.groupedData.map((d) => d.title))
      .range([0, xWidth])
      .padding(this.padding);

    this.xAxis = this.svg
      .append('g')
      // .style('outline', '1px dashed red').style('outline-offset', '-1px')
      .attr('transform', `translate(0,${yHeight})`)
      .attr('class', 'xAxis')
      .call(d3.axisBottom(this.x));

    // replace titles
    this.xAxis
      .selectAll('text')
      .text((barTitle) => {
        if (this.options.barsOptions.length) {
          const replace = this.options.barsOptions.find(({ title }) => (title === barTitle));
          if (replace && replace.newTitle) {
            return replace.newTitle;
          }
        }
        return barTitle;
      });

    const insertLinebreaks = (t, d, width) => {
      const el = d3.select(t);
      const p = d3.select(t.parentNode);
      const text = p.append('foreignObject')
        .attr('y', 5)
        .attr('x', -width / 2)
        .style('padding', '0 5px')
        .attr('width', width)
        .append('xhtml:p')
        .attr('style', 'word-wrap: break-word; text-align:center;')
        .html(d);
      d3.select(text.node().parentNode).attr('height', text.node().offsetHeight);
      el.remove();
    };

    if (this.options.xLabelRotate) {
      this.xAxis
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-20)');
    } else {
      const bandwidth = this.x.bandwidth();
      this.svg.selectAll('g.xAxis g text')
        .each(function () {
          insertLinebreaks(this, this.textContent, bandwidth * 1.3);
        });
    }
  }

  createYAxis() {
    const { numberFormat = false } = this.options;
    const yHeight = this.height - this.margin.top - this.margin.bottom;
    const minMax = [
      d3.min(this.data, (d) => (d.total < 0 ? d.total : 0)),
      d3.max(this.data, (d) => (d.total > 0 ? d.total : 0)),
    ];

    this.y = d3.scaleLinear()
      .domain(minMax)
      .range([yHeight - this.innerVertOffset[1], this.innerVertOffset[0]]);

    this.yAxis = this.svg
      .append('g')
      // .style('outline', '1px dashed yellow').style('outline-offset', '-1px')
      .attr('class', 'yAxis')
      .call(d3.axisLeft(this.y)
        .tickFormat((val) => val.toLocaleString(numberFormat)));

    if (this.innerVertOffset[1]) {
      this.yAxis.select('path.domain').attr('stroke', 'transparent');
      this.yAxis.append('line')
        .attr('stroke-width', 1)
        .attr('x1', 0.5)
        .attr('y1', 0)
        .attr('x2', 0.5)
        .attr('y2', this.y(minMax[0]) + this.innerVertOffset[1])
        .attr('stroke', 'currentColor');
    }
  }

  createGroupRect(barGroups) {
    const width = this.x.bandwidth() - (this.x.bandwidth() * (this.padding / 5));
    const wOffset = (width * this.padding) / 2;
    barGroups
      .append('rect')
      .attr('x', -wOffset)
      .attr('stroke', (d) => (d.children.length > 1 ? 'currentColor' : 'transparent'))
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '1 4 0')
      .attr('width', width + wOffset * 2)
      .attr('transform', `translate(${this.x.bandwidth() * (this.padding / 10)},0)`)
      .attr('fill', 'transparent')
      .attr('height', this.y.range()[0]);
  }

  createDefaultBars(barGroups, rerender) {
    // add all bars
    this.createBars(barGroups);

    this.createBarLabels(barGroups);
    //
    this.createBarLines(barGroups);
    //
    const isGrouped = this.groupedData.some((d) => d.children.length > 1);
    if (this.data.filter((d) => d.comment).length && !isGrouped) {
      this.renderComments(barGroups);

      // check comment cropped
      const { y: yCtn, height: heightCtn } = this.svg.select('g.yAxis path.domain').node().getBBox();
      this.innerVertOffset = this.svg.selectAll('rect.comment').nodes()
        .map((el) => {
          // eslint-disable-next-line no-shadow
          const { y, height } = el.getBBox();
          return [y - yCtn, heightCtn - (y + height)];
        })
        .reduce((acc, [top, bottom]) => {
          if (top < acc[0]) acc[0] = top;
          if (bottom < acc[1]) acc[1] = bottom;
          return acc;
        }, [0, 0])
        .map((val) => 0 - val.toFixed(0));

      if (this.innerVertOffset.join() !== '0,0' && rerender) {
        this.innerVertOffset[1] += 10;
        this.createChart(false);
        this.innerVertOffset = [0, 0];
      }
    }
  }

  createBars(barGroups) {
    barGroups.selectAll('g')
      .data((d) => {
        const children = [];
        for (let i = 0; i < d.children.length; i += 1) {
          children.push({
            ...d.children[i],
            childrenIndex: i,
            nextChildrenLength: d.nextChildrenLength,
            childrenCount: d.children.length,
          });
        }
        return children;
      })
      .enter()
      .append('g')
      // .style('outline', '1px dashed blue').style('outline-offset', '-1px')
      .attr('class', 'group-item')
      .append('rect')
      .attr('y', (d) => {
        if (d.isTotal) {
          return d.total < 0 ? this.y(0) : this.y(d.total);
        }
        return this.y(d.value < 0 ? d.total - d.value : d.total);
      })
      .attr('x', (d) => {
        const padding = ((this.x.bandwidth() / d.childrenCount) * this.padding);
        return (this.x.bandwidth() / d.childrenCount) * d.childrenIndex + (padding / 4);
      })
      .attr('height', (d) => {
        const height = this.y(0) - this.y(Math.abs(d.isTotal ? d.total : d.value));
        if (height === 0) {
          return 1;
        }
        return height;
      })
      .attr('width', (d) => this.x.bandwidth() / d.childrenCount - ((this.x.bandwidth() / d.childrenCount) * (this.padding / 2)))
      .attr('fill', ({
        title: barTitle, value, color, isTotal,
      }) => {
        if (color) {
          return color;
        }
        if (this.options.barsOptions.length) {
          const opts = this.options.barsOptions.find(({ title }) => (title === barTitle));
          if (opts?.changeColor) {
            return opts.color;
          }
        }
        if (isTotal) {
          return this.options.colorBarTotal;
        }
        return value < 0 ? this.options.colorBarNegative : this.options.colorBarPositive;
      });
  }

  createBarLabels(barGroup) {
    barGroup
      .selectAll('.group-item')
      .append('text')
      .attr('x', (d) => {
        const xPos = this.x.bandwidth() / d.childrenCount;
        return d.childrenIndex > 0 ? xPos * (d.childrenIndex + 1) - (xPos / 2) : xPos / 2;
      })
      .attr('y', (d) => this.y(d.total) + 4)
      .attr('dy', (d) => `${(d.isTotal ? (d.total < 0) : (d.value < 0)) ? '-' : ''}8px`)
      .attr('font-size', '13')
      .attr('text-anchor', 'middle')
      .attr('fill', this.options.colorText)
      .text((d) => (d.isTotal ? d.total : d.value)
        .toLocaleString(this.options.numberFormat || false));
  }

  createBarLines() {
    this.svg.selectAll('.group-item')
      .append('line')
      .filter((d, idx) => idx !== this.data.length - 1)
      .attr('class', 'connector')
      .attr('x1', (d) => {
        const elWidth = this.getElWidth(d);
        const padding = this.getElPadding(d);
        return elWidth + (elWidth * d.childrenIndex) - (padding / 4);
      })
      .attr('y1', (d) => this.y(d.total))
      .attr('x2', (d) => {
        const elWidth = this.getElWidth(d);
        const padding = this.padding * 4;
        const xPos = (elWidth + (elWidth * d.childrenIndex));
        const nextInGroup = d?.nextChildrenLength > 1;
        const currentInGroup = d.childrenCount > 1;
        const currentLast = !((d.childrenIndex + 1) < d.childrenCount);
        if (nextInGroup && currentInGroup && !currentLast) {
          return xPos + (padding / d.childrenCount);
        }
        /* if (nextInGroup && currentInGroup && currentLast) {
          return xPos + (padding / d.nextChildrenLength);
        }
        if (nextInGroup && !currentInGroup) {
          return xPos + (padding / (d.nextChildrenLength * 2));
        }
        if (!nextInGroup && currentLast && currentInGroup) {
          return xPos + padding;
        }
        if (!nextInGroup && !currentInGroup) {
          return xPos + padding / 4;
        } */
        if (!nextInGroup && !currentLast && currentInGroup) {
          return xPos + (padding / d.childrenCount);
        }
        return this.x.bandwidth() / (1 - this.padding) + 2;
      })
      .attr('y2', (d) => this.y(d.total))
      .attr('stroke', this.options.colorBarTotal)
      .attr('stroke-dasharray', '0 2 0');
  }

  createZeroLine() {
    const xWidth = this.width - this.margin.left - this.margin.right;
    const lines = [
      d3.min(this.data, (d) => (d.total < 0 ? d.total : 0)),
    ];
    this.svg
      .selectAll('line.zero')
      .data(lines)
      .enter().filter((d) => d < 0)
      .append('line')
      .attr('class', 'zero')
      .attr('stroke-width', 0.3)
      .attr('x1', 0)
      .attr('y1', this.y(0))
      .attr('x2', xWidth)
      .attr('y2', this.y(0))
      .attr('stroke', 'currentColor');
  }

  getElWidth(d) {
    return this.x.bandwidth() / d.childrenCount;
  }

  getElPadding(d) {
    return ((this.x.bandwidth() / d.childrenCount) * this.padding);
  }
}
