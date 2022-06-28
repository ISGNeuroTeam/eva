import * as d3 from 'd3';

export default class DialClass {
  options = {
    width: 0,
    height: 0,
    elem: '',
  }

  constructor({
    elem,
    width,
    height,
    data,
    colors,
  }) {
    this.options.width = width;
    this.options.height = height;
    this.options.elem = elem;

    this.createDial(data, colors);
  }

  get size() {
    return {
      width: this.options.width,
      height: this.options.height,
    };
  }

  set size(value) {
    this.options.width = value.width ?? this.options.width;
    this.options.height = value.height ?? this.options.height;

    this.changeSize();
  }

  get radius() {
    const { width, height } = this.size;
    return Math.min(width, height) / 2;
  }

  get getPiechart() {
    return this.piechart;
  }

  get elem() {
    return this.options.elem;
  }

  get innerRadius() {
    return this.radius / 1.15;
  }

  createDial(data, colors) {
    this.createPieChartSvg();

    this.createPieChartGroup();

    this.createColors(data, colors);

    this.createDataRedy(data);

    this.createPies();
  }

  createPieChartSvg() {
    const { width, height } = this.size;
    this.piechart = d3
      .select(this.elem)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  }

  createPieChartGroup() {
    const { width, height } = this.size;
    this.piechartG = this.piechart.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
  }

  createDataRedy(data) {
    const pie = d3.pie().value((d) => d.value);
    this.dataReady = pie(d3.entries(data));
  }

  createPies() {
    this.piechartG.selectAll('pies')
      .data(this.dataReady)
      .enter()
      .append('path')
      .attr('d', d3.arc().innerRadius(this.innerRadius).outerRadius(this.radius))
      .attr('class', 'piepart')
      .attr('fill', (d) => this.colors(d.data.key - 1))
      .attr('stroke', 'var(--main_bg)')
      .style('stroke-width', '10px');
  }

  changeSize() {
    const { width, height } = this.size;
    this.piechart
      .attr('width', width)
      .attr('height', height);

    this.piechartG.attr('transform', `translate(${width / 2},${height / 2})`);

    this.piechartG
      .selectAll('path')
      .attr('d', d3.arc().innerRadius(this.innerRadius).outerRadius(this.radius))
      .attr('class', 'piepart')
      .attr('fill', (d) => this.colors(d.data.key - 1))
      .attr('stroke', 'var(--main_bg)')
      .style('stroke-width', '10px');
  }

  removePiechart() {
    this.getPiechart.remove();
  }

  createColors(data, colors) {
    this.colors = d3
      .scaleOrdinal()
      .domain(data)
      .range(colors);
  }
}
