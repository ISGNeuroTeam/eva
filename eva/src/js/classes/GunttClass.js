import * as d3 from 'd3';

class GunttClass {
  static calcTimeAxisDivider(fullWidth) {
    if (fullWidth < 600) {
      return 3;
    }
    if (fullWidth < 450) {
      return 4;
    }
    if (fullWidth < 400) {
      return 5;
    }
    if (fullWidth < 350) {
      return 6;
    }
    return 2;
  }

  static wrap(text) {
    text.each((_, index, node) => {
      const localText = d3.select(node[index]);
      let row = [];
      localText
        .node()
        .querySelectorAll('text')
        .forEach((item) => {
          row = item.innerHTML.split(' ').filter((rowItem) => rowItem !== '');
          if (row[1]) {
            row[0] = `<tspan x=0 y=10>${row[0]}</tspan>`;
            row[1] = `<tspan x=0 y=30>${row[1]}</tspan>`;
            item.innerHTML = row.join('');
          }
        });
    });
  }

  static checkCaption(name) {
    if (name.length > 6) {
      // если там больше 10 символов
      name = `${name.substring(0, 6)}...`; // обрезаем и добовляем троеточие
    }
    return name;
  }

  constructor({
    elem,
    width,
    height,
    margin,
    textColor,
    colors,
    paddings,
    timeAxisStyles,
    data,
    dateFormat,
    tooltipElem,
  }) {
    this.tooltip = tooltipElem;

    this.guntt = d3.select(elem)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'guntt-svg');

    const x = d3
      .scaleTime()
      .domain([
        d3.min(data, (d) => new Date(d.start_date)),
        d3.max(data, (d) => new Date(d.end_date)),
      ])
      .range([paddings.left, width - paddings.right]);

    // рассчитываем набор фаз (состояний)
    const { phases, ids } = data.reduce((acc, { phase, id }) => {
      if (phase && !acc.phases.includes(phase)) {
        acc.phases.push(phase);
      }
      if (!acc.ids.includes(id)) {
        acc.ids.push(id);
      }
      return acc;
    }, {
      phases: [],
      ids: [],
    });

    this.phases = phases;

    this.barHeight = Math.round((height - timeAxisStyles.height) / ids.length);

    const fullWidth = width + margin.left + margin.right;

    const timeAxisDivider = GunttClass.calcTimeAxisDivider(fullWidth);

    const xAxis = this.guntt
      .append('g')
      .attr('transform', `translate(0,${height - timeAxisStyles.height})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat(d3.timeFormat(dateFormat))
          .tickValues(
            x.ticks().filter((item, i) => i % timeAxisDivider === 0),
          ),
      )
      .call(GunttClass.wrap);

    xAxis.selectAll('line').attr('y2', `-${height}`).attr('opacity', '0.3');

    xAxis
      .selectAll('text')
      .attr('class', 'text-x')
      .attr('transform', `translate(${timeAxisStyles.paddingLeft},${timeAxisStyles.paddingTop})`)
      .style('color', textColor)
      .style('text-anchor', 'center');

    // горизонатьные значения (id)
    this.guntt
      .append('g')
      .selectAll('rect')
      .data(ids)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * this.barHeight)
      .attr('width', () => width)
      .attr('height', this.barHeight)
      .attr('stroke', 'none')
      .attr('opacity', 0.2);

    // сами строки данных относителньо времени
    this.bars = this.guntt.append('g').selectAll('rect').data(data).enter();

    this.lines = this.bars
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('x', (d, index) => x(Date.parse(d.start_date)) - (index % 2 === 0 ? 1 : 0))
      .attr('y', (d) => {
        let j = -1;
        ids.forEach((item, i) => {
          if (item === d.id) {
            j = i;
          }
        });
        return j * this.barHeight - (j === 0 ? 1 : 0);
      })
      .attr('width', (d) => x(Date.parse(d.end_date)) - x(Date.parse(d.start_date)))
      .attr('height', this.barHeight)
      .attr('stroke', 'none')
      .style('cursor', 'pointer')
      .attr('fill', (d) => {
        let j = 0;
        phases.forEach((item, i) => {
          if (item === d.phase) {
            j = i;
          }
        });

        return colors.filter(Boolean)[j];
      });

    this.texts = this.bars
      .append('text')
      .text((d) => {
        if (d.phase) {
          if (
            x(Date.parse(d.end_date)) - x(Date.parse(d.start_date))
            > d.phase.length * 8
          ) {
            return d.phase;
          }
        }
        return '';
      })
      .attr('x', (d) => (
        x(Date.parse(d.start_date))
        + (x(Date.parse(d.end_date)) - x(Date.parse(d.start_date))) / 2
      ))
      .attr('y', (d) => {
        let j = -1;
        ids.forEach((item, i) => {
          if (item === d.id) {
            j = i;
          }
        });
        return j * this.barHeight + this.barHeight / 2 + 3;
      })
      .attr('class', 'text-bar')
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .style('cursor', 'pointer')
      .attr('fill', '#fff');

    const idsCaption = this.guntt.append('g').selectAll('text').data(ids).enter();

    let currentPos = 0;

    idsCaption
      .append('text')
      .text((d) => GunttClass.checkCaption(d))
      .attr('x', 10)
      .attr('y', (d, i) => {
        if (i === 0) {
          currentPos = this.barHeight / 2 + 2;
        } else {
          currentPos += this.barHeight + 2;
        }
        return currentPos;
      })
      .attr('class', 'ids-caption')
      .attr('font-size', 11)
      .attr('text-anchor', 'start')
      .style('opacity', '0.8')
      .attr('fill', textColor);

    currentPos = 0;

    idsCaption
      .append('line')
      .attr('x1', 0)
      .attr('x2', width - paddings.right)
      .attr('y1', (d, i) => {
        let curPos;
        if (i !== ids.length - 1) {
          curPos = currentPos + this.barHeight;
          currentPos += this.barHeight;
        } else {
          curPos = currentPos + this.barHeight;
          currentPos = 0;
        }
        return curPos;
      })
      .attr('y2', () => {
        const curPos = currentPos + this.barHeight;
        currentPos += this.barHeight;
        return curPos;
      })
      .style('stroke', textColor)
      .attr('opacity', '0.3');

    // линия отделяющяя подписи (ids) от блока данных
    this.guntt
      .append('g')
      .append('line')
      .attr('x1', paddings.left)
      .attr('x2', paddings.left)
      .attr('y1', 0)
      .attr('y2', height - 50)
      .style('stroke', 'black')
      .attr('opacity', '0.3');

    // линия отделяющяя блоки данных от легенды
    this.guntt
      .append('g')
      .append('line')
      .attr('x1', width - paddings.right)
      .attr('x2', width - paddings.right)
      .attr('y1', 0)
      .attr('y2', height - 50)
      .style('stroke', 'black')
      .attr('opacity', '0.3');
  }

  get getGuntt() {
    return this.guntt;
  }
  // WIP(start)

  get getPhases() {
    return this.phases;
  }

  get getLines() {
    return this.lines;
  }

  get getBars() {
    return this.bars;
  }

  get getBarHeight() {
    return this.barHeight;
  }

  get getTexts() {
    return this.texts;
  }
  // WIP(end)

  moveTooltip(offsetX) {
    const localY = d3.event.offsetY;
    const localX = d3.event.offsetX + offsetX;
    this.tooltip.style.top = `${localY}px`;
    this.tooltip.style.left = `${localX}px`;
  }

  removeGuntt() {
    this.getGuntt.remove();
  }

  setEventsOnLines(events) {
    events.forEach((event) => {
      this.lines.on(event.name, event.callback);
    });
  }

  setEventsOnTexts(events) {
    events.forEach((event) => {
      this.texts.on(event.name, event.callback);
    });
  }
}

export default GunttClass;
