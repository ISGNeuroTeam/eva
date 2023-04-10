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

  padding = 0.3

  svgContainer = null

  dataSet = []

  onClick = null;

  constructor(svgContainer, width, height, options = {}) {
    this.options = { ...this.options, ...options };
    this.width = width;
    this.height = height;
    this.svgContainer = svgContainer;
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
        acc.push({ ...item, lastValue: 0, total: item.value });
        return acc;
      }
      if (item.isTotal) {
        item.value = 0;
      }
      acc.push({
        ...item,
        lastValue: acc[idx - 1].total,
        total: acc[idx - 1].total + item.value,
      });
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

  createChart() {
    const { margin, padding, options } = this;
    const { width, height } = this;

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
      .text((d) => (d.isTotal ? d.total : d.value).toLocaleString('ru'));

    barGroup.append('line').filter((d, idx) => idx !== this.data.length - 1)
      .attr('class', 'connector')
      .attr('x1', this.x.bandwidth() + 2)
      .attr('y1', (d) => this.y(d.total))
      .attr('x2', this.x.bandwidth() / (1 - padding) - 4)
      .attr('y2', (d) => this.y(d.total))
      .attr('stroke', options.colorBarTotal)
      .attr('stroke-dasharray', '0 2 0');

    barGroup.append('foreignObject')
      .attr('x', this.x.bandwidth() - this.x.bandwidth() / 1.1)
      .attr('y', (d, idx) => (idx % 2 === 0 ? this.y(d.total) - this.y(Math.abs(d.total)) / 3 : this.y(d.total) + this.y(Math.abs(d.total)) / 3))
      .attr('font-size', '13')
      .attr('height', (d) => `${this.y(Math.abs(d.value))}px`)
      .attr('width', `${this.x.bandwidth()}px`)
      .style('overflow', 'inherit')
      .text((d) => (d?.comment || ''));

    barGroup.append('line').filter((d, idx) => idx !== this.data.length - 1)
      .attr('class', 'vertical')
      .attr('x1', this.x.bandwidth() - this.x.bandwidth())
      .attr('y1', this.y(0))
      .attr('x2', this.x.bandwidth() - this.x.bandwidth())
      .attr('y2', (d, idx) => idx % 2 === 0 ? this.y(d.total) - this.y(Math.abs(d.total)) / 2 : this.y(d.total) + this.y(Math.abs(d.total)) / 2)
      .attr('stroke', ({ title: barTitle, value }) => {
        if (this.options.barsOptions.length) {
          const opts = this.options.barsOptions.find(({ title }) => (title === barTitle));
          if (opts?.changeColor) {
            return opts.color;
          }
        }
        return value < 0 ? options.colorBarNegative : options.colorBarPositive;
      })
      .attr('stroke-dasharray', '1 4 0')
      .attr('stroke-width', '3px')
      .attr('stroke-opacity', (d) => (d?.comment ? '1' : '0'));
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
    const yHeight = this.height - this.margin.top - this.margin.bottom;
    const minMax = [
      d3.min(this.data, (d) => (d.total < 0 ? d.total : 0)) * 1.1,
      d3.max(this.data, (d) => (d.total > 0 ? d.total : 0)) * 1.1,
    ];

    this.y = d3.scaleLinear()
      .domain(minMax)
      .range([yHeight, 0]);

    this.yAxis = this.svg
      .append('g')
      .call(d3.axisLeft(this.y));
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
