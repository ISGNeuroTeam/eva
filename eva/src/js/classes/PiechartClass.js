import * as d3 from 'd3';

class PiechartClass {
  constructor({
    elem,
    elemForLegend,
    width,
    height,
    margin,
    data,
    colors,
  }) {
    this.piechart = d3
      .select(elem)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    this.legend = d3.select(elemForLegend);

    // устанавливаем цветовую схему для pie chart
    this.colors = d3
      .scaleOrdinal()
      .domain(data)
      .range(colors);

    const pie = d3.pie().value((d) => d.value);
    this.dataReady = pie(d3.entries(data));
    // радиус диаграммы это половина длины или ширины, смотря что меньше и еще отступ отнимаем
    const radius = Math.min(width, height) / 2 - margin;

    this.piechart.selectAll('pies')
      .data(this.dataReady)
      .enter()
      .append('path')
      .attr('d', d3.arc().innerRadius(0).outerRadius(radius))
      .attr('class', 'piepart')
      .attr('fill', (d) => this.colors(d.data.key))
      .attr('stroke', 'inherit')
      .style('stroke-width', '2px');
  }

  get getPiechart() {
    return this.piechart;
  }

  get getColors() {
    return this.colors;
  }

  selectActivePiepart(selectedPieIndex, legendLineIndex) {
    this.getPiechart.selectAll('.piepart')
      .each((_, i, nodes) => {
        const node = nodes[i];
        if (i === legendLineIndex) {
          node.classList.add('piepartSelect');
        } else if (
          node.classList.contains('piepartSelect')
              && selectedPieIndex !== i
        ) {
          node.classList.remove('piepartSelect');
        }
      });
  }

  selectActiveLegendLine(legendLineIndex, legendLineClass = 'legend-line') {
    this.legend
      .selectAll(`.${legendLineClass}`)
      .each((_, i, nodes) => {
        const node = nodes[i];
        if (legendLineIndex === i) {
          node.classList.add(`${legendLineClass}_hover`);
        } else if (node.classList.contains(`${legendLineClass}_hover`)) {
          node.classList.remove(`${legendLineClass}_hover`);
        }
      });
  }

  removePiechart() {
    this.getPiechart.remove();
  }

  setEvents(events) {
    events.forEach(({ eventName, callback }) => {
      this.piechart
        .selectAll('pies')
        .data(this.dataReady)
        .enter()
        .selectAll('path')
        .on(eventName, callback);
    });
  }
}

export default PiechartClass;
