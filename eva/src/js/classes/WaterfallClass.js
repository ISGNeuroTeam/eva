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

  padding = 0.3

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
    const { margin, padding, options } = this;
    const { width, height } = this;
    const { numberFormat = false } = this.options;

    this.svg = d3.select(this.svgContainer)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    this.createXAxis();
    this.createYAxis();

    // пересчет размеров осей
    const xAxisSizes = this.xAxis.node().getBBox();
    this.margin.bottom = xAxisSizes.height;
    const yAxisSizes = this.yAxis.node().getBBox();
    this.margin.left = yAxisSizes.width;
    this.svg.attr('transform', `translate(${margin.left},${margin.top})`);
    this.xAxis.remove();
    this.createXAxis();
    this.yAxis.remove();
    this.createYAxis();
    this.createZeroLine();

    // add bar group
    const barGroup = this.svg.selectAll('.bar')
      .data(this.data)
      .enter().append('g')
      .attr('class', 'bar')
      .attr('transform', (d) => `translate(${this.x(d.title)},0)`)
      .on('click', (d) => this.onClick(d));

    // add red/green bars
    barGroup.filter((d) => !d.isTotal).append('rect')
      .attr('y', (d) => this.y(d.value < 0 ? d.total - d.value : d.total))
      .attr('height', (d) => this.y(0) - this.y(Math.abs(d.value)))
      .attr('width', this.x.bandwidth())
      .attr('fill', ({ title: barTitle, value }) => {
        if (this.options.barsOptions.length) {
          const opts = this.options.barsOptions.find(({ title }) => (title === barTitle));
          if (opts?.changeColor) {
            return opts.color;
          }
        }
        return value < 0 ? options.colorBarNegative : options.colorBarPositive;
      });

    // add total bars
    barGroup.filter((d) => d.isTotal).append('rect')
      .attr('y', (d) => (d.total < 0 ? this.y(0) : this.y(d.total)))
      .attr('height', (d) => this.y(0) - this.y(Math.abs(d.total)))
      .attr('width', this.x.bandwidth())
      .attr('fill', ({ title: barTitle }) => {
        if (this.options.barsOptions.length) {
          const opts = this.options.barsOptions.find(({ title }) => (title === barTitle));
          if (opts?.changeColor) {
            return opts.color;
          }
        }
        return options.colorBarTotal;
      });

    barGroup.append('text')
      .attr('x', this.x.bandwidth() / 2)
      .attr('y', (d) => this.y(d.total) + 5)
      .attr('dy', (d) => `${(d.isTotal ? (d.total < 0) : d.value < 0) ? '-' : ''}.75em`)
      .attr('font-size', '13')
      .attr('text-anchor', 'middle')
      .attr('fill', options.colorText)
      .text((d) => (d.isTotal ? d.total : d.value).toLocaleString(numberFormat));

    barGroup.append('line').filter((d, idx) => idx !== this.data.length - 1)
      .attr('class', 'connector')
      .attr('x1', this.x.bandwidth() + 2)
      .attr('y1', (d) => this.y(d.total))
      .attr('x2', this.x.bandwidth() / (1 - padding) - 4)
      .attr('y2', (d) => this.y(d.total))
      .attr('stroke', options.colorBarTotal)
      .attr('stroke-dasharray', '0 2 0');

    if (this.data.filter((d) => d.comment).length) {
      this.renderComments(barGroup);

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
        this.createChart(false);
        this.innerVertOffset = [0, 0];
      }
    }
  }

  renderComments(barGroup) {
    const { options } = this;
    const textVertOffset = 10;
    const textAreaLeftOffset = this.x.bandwidth() * 0.1;
    const bandwidth1 = 1.3;
    const bandwidth2 = 2.3;
    const dataWithComments = this.data.filter((d) => d.comment);
    const barCommentParams = dataWithComments.map((d, idx) => {
      if (d.comment) {
        const elem = this.svg.append('foreignObject')
          .attr('width', () => `${this.x.bandwidth() * (idx + 1 === dataWithComments.length ? bandwidth1 : bandwidth2)}px`)
          .style('x', -1000)
          .style('overflow', 'inherit')
          .attr('font-size', '14')
          .html(d.comment);

        const elemText = this.svg.append('text')
          .style('x', -1000)
          .style('overflow', 'inherit')
          .attr('font-size', '14')
          .html(d.comment);

        const result = {
          height: elem.node().scrollHeight,
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

    barGroup.filter((d) => d.comment).append('rect')
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
          pos = this.y(max) - barCommentParams[idx].height - textVertOffset;
        } else {
          pos += textVertOffset;
        }
        return pos;
      })
      .attr('width', (d, idx) => `${this.x.bandwidth() * ((getForTwoColumns(idx) ? bandwidth2 : bandwidth1) + 0.1)}px`)
      .attr('height', (d, idx) => {
        const opts = this.options.barsOptions.find(({ title }) => (title === d.title));
        return !opts?.hideComment ? barCommentParams[idx].height : 0;
      })
      // .attr('fill', '#fff3')
      .attr('fill', 'transparent');

    barGroup.filter((d) => d.comment).append('foreignObject')
      .attr('x', textAreaLeftOffset)
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
          pos = this.y(max) - barCommentParams[idx].height - textVertOffset;
        } else {
          pos += textVertOffset;
        }
        return pos;
      })
      .attr('width', (d, idx) => `${this.x.bandwidth() * (getForTwoColumns(idx) ? bandwidth2 : bandwidth1)}px`)
      .attr('height', (d, idx) => `${barCommentParams[idx].height}px`)
      .style('overflow', 'inherit')
      .attr('font-size', '14')
      .attr('text-anchor', 'bottom')
      .html((d) => {
        const opts = this.options.barsOptions.find(({ title }) => (title === d.title));
        if (opts?.hideComment) {
          return '';
        }
        let color;
        if (opts?.changeColor) {
          color = opts.color;
        } else if (d.isTotal) {
          color = options.colorBarTotal;
        } else {
          color = d.value < 0 ? this.options.colorBarNegative : this.options.colorBarPositive;
        }
        return d.comment
          .replace(/(\(\s?[-+]?[\d\s.,]+\s?\))/g, `<tspan style="color: ${color}">$1</tspan>`);
      });

    barGroup.filter((d) => d.comment).append('line')
      .attr('class', 'vertical')
      .attr('x1', 1)
      .attr('x2', 1)
      .attr('y2', (d, idx) => {
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
          pos = this.y(max) - barCommentParams[idx].height - textVertOffset;
        } else {
          pos += barCommentParams[idx].height + textVertOffset;
        }
        return pos;
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
      .attr('stroke', ({ title: barTitle, value, isTotal }) => {
        if (this.options.barsOptions.length) {
          const opts = this.options.barsOptions.find(({ title }) => (title === barTitle));
          if (opts?.hideComment) {
            return 'transparent';
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
      .domain(this.data.map((d) => d.title))
      .range([0, xWidth])
      .padding(this.padding)
      .round(true);

    this.xAxis = this.svg
      .append('g')
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

    if (this.options.xLabelRotate) {
      this.xAxis
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-20)');
    }
  }

  createYAxis() {
    const { numberFormat = false } = this.options;
    const yHeight = this.height - this.margin.top - this.margin.bottom;
    const minMax = [
      d3.min(this.data, (d) => (d.total < 0 ? d.total : 0)) * 1.1,
      d3.max(this.data, (d) => (d.total > 0 ? d.total : 0)) * 1.1,
    ];

    this.y = d3.scaleLinear()
      .domain(minMax)
      .range([yHeight - this.innerVertOffset[1], this.innerVertOffset[0]]);

    this.yAxis = this.svg
      .append('g')
      .attr('class', 'yAxis')
      .call(d3.axisLeft(this.y)
        .tickFormat((val) => val.toLocaleString(numberFormat)));

    if (this.innerVertOffset[1]) {
      this.yAxis.append('line')
        .attr('stroke-width', 1)
        .attr('x1', 0.5)
        .attr('y1', this.y(minMax[0]))
        .attr('x2', 0.5)
        .attr('y2', this.y(minMax[0]) + this.innerVertOffset[1])
        .attr('stroke', 'currentColor');
    }
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
}
