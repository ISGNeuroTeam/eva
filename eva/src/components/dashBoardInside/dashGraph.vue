<template>
  <div class="dash-graph-block">
    <div
      v-show="!nomsg"
      class="graph-block-itself"
    >
      <div
        ref="graph"
        class="dash-graphVis"
      />
      <v-tooltip
        bottom
        :color="colorFrom.controlsActive"
      >
        <template v-slot:activator="{ on }">
          <v-icon
            v-show="!errorData"
            class="change-direct"
            :color="colorFrom.controls"
            v-on="on"
            @click="changeDirect"
          >
            {{ changeIcon }}
          </v-icon>
        </template>
        <span>Повернуть граф</span>
      </v-tooltip>
      <div
        ref="tooltipName"
        class="tooltipName"
        :style="{ background: colorFrom.controlsActive }"
        v-html="tooltipName"
      />
      <div
        ref="changeName"
        class="changeName"
        :class="{ showchange: showChangeName }"
        :style="{
          border: `2px solid ${colorFrom.controlsActive}`,
          background: colorFrom.back,
        }"
      >
        <v-text-field
          v-model="newNameRect"
          :color="colorFrom.text"
          class="textarea-item"
          solo
          flat
          clearable
          hide-details
        />
        <div
          class="accept-btn"
          :style="{ background: colorFrom.controlsActive }"
          @click="setName"
        >
          <v-icon class="save">
            {{ saveicon }}
          </v-icon>
        </div>
      </div>
      <div
        ref="saveTree"
        class="saveTree"
        :style="{ background: colorFrom.controlsActive }"
        @click="saveTree"
      >
        Сохранить
      </div>
    </div>
    <div
      v-show="nomsg"
      class="nodata"
    >
      {{ nomsgtext }}
    </div>
  </div>
</template>

<script>
import * as joint from 'jointjs/src/core.mjs';

import * as standart from 'jointjs/src/shapes/standard.mjs';

import { mdiTransitDetour, mdiContentSave } from '@mdi/js';

export default {
  props: {
    idFrom: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    dataRestFrom: {
      type: Array,
      required: true,
    },
    // shouldFrom: null,
    colorFrom: {
      type: Object,
      required: true,
    },
    dataLoadingFrom: null,
    heightFrom: {
      type: Number,
      required: true,
    },
    widthFrom: {
      type: Number,
      required: true,
    },
    searchRep: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      nodes: [],
      tree: {
        vertical: {},
        horizontal: {},
      },
      links: [],
      actions: [
        {
          name: 'click',
          capture: ['node'],
        },
      ],
      rects: {},
      status: false,
      size: {},
      direct: 'vertical',
      changeIcon: mdiTransitDetour,
      saveicon: mdiContentSave,
      preperedData: {},
      firstNode: [],
      structure: {},
      tooltipName: '',
      customColor: [],
      lastData: [],
      errorData: false,
      mount: false,
      labels: {},
      changedRect: {
        name: '',
        leftColor: '',
        rightColor: '',
      },
      newNameRect: '',
      showChangeName: false,
      alies: {},
      nomsg: true,
      nomsgtext: '',
    };
  },
  computed: {
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    dataLoading() {
      return this.dataLoadingFrom;
    },
    width() {
      return this.widthFrom;
    },
    height() {
      return this.heightFrom;
    },
    dashFromStore() {
      return this.$store.state[this.idDash][this.id];
    },
    getGraphTree() {
      if (
        this.dashFromStore.tree
        && this.dashFromStore.direct
        && this.dashFromStore.alies
      ) {
        return {
          tree: this.dashFromStore.tree,
          direct: this.dashFromStore.direct,
          alies: this.dashFromStore.alies,
        };
      }
      // если нет, то возвращаем пустую заготовку
      return {
        tree: {
          vertical: {},
          horizontal: {},
        },
        direct: 'vertical',
        alies: {},
      };
    },
  },
  watch: {
    dataRestFrom(data) {
      if (data.length > 0) {
        this.stepByStep(data);
      } else {
        this.nomsg = true;
        this.nomsgtext = 'Нет данных для отображения';
      }
    },
  },
  // при первом появлении графа
  mounted() {
    const stateTree = this.getGraphTree; // забираем уже сохраненные данные из store
    this.tree = stateTree.tree; // добовляем сохраненный граф
    this.direct = stateTree.direct; // и его положение
    this.alies = stateTree.alies; // и его положение
    this.mount = true;

    //  В первый раз раскомментить чтобы создать события для элемнета,
    //  а затем лучше закоментить чтобы каждый раз не обращаться к store
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
  },
  methods: {
    // функция отрисовки графа
    createGraph(elem) {
      // сперва получаем размеры контейнера для графа
      const size = this.sizeGraph();

      // объект самого графа
      const graph = new joint.dia.Graph();

      // получаем тултип всплывающий при наведении мышки
      const { tooltipName } = this.$refs;

      // линии графа
      const { links } = this.preperedData;
      // ноды графа
      const { nodes } = this.preperedData;

      // объект полотна для графа
      const paper = new joint.dia.Paper({
        el: elem, // размещать будем в нашем нотбуке
        model: graph, // размещать будем граф
        width: size.width, // ширина нашего полотна равна ширине элемента
        height: size.height, // высота равна высоте элемнета
        gridSize: 1, // размер неких точек на полотне, но мы все ранво их не выводим
        interactive: true, // Флаг для отключения перетаскивания элемнетов
      });

      // модифицируем надпись в ноде
      function checkLabel(label, alies) {
        if (alies[label]) {
          label = alies[label];
          // если там больше 10 символов
        } else if (label.length > 10) {
          // обрезаем и добовляем троеточие
          label = `${label.substring(0, 10)}...`;
        }
        return label;
      }

      // конфиграция другая для поведения линий на графике с круглыми краями
      paper.options.defaultConnector = {
        name: 'rounded',
        args: {
          radius: 20,
        },
      };

      // при наведении на элемнет в полотне (ноду)
      paper.on('element:mouseover', (event) => {
        // пробегаемся по его детям
        Object.values(event.el.children).forEach((item) => {
          // и ищем надпись
          if (item.getAttribute('joint-selector') === 'label') {
            // получаем полное имя ноды из атрибута
            const name = item.getAttribute('data-name');
            // заносим это имя сперва в тултип
            this.tooltipName = `${name}<br>${nodes[name].label}`;
            // потом отражаем его
            tooltipName.style.opacity = '0.7';
            // и позиционируем
            tooltipName.style.left = `${this.rects[name].position().x + 70}px`;
            tooltipName.style.top = `${this.rects[name].position().y - 40}px`;
          }
        });
      });

      // а когда увели мышку с элемента
      paper.on('element:mouseout', (event) => {
        // снова находим надпись
        Object.values(event.el.children).forEach((item) => {
          if (item.getAttribute('joint-selector') === 'label') {
            // и скрываем тултип
            tooltipName.style.opacity = '0';
          }
        });
      });

      paper.on('element:pointerclick', (element) => {
        this.setClick(
          element.el.querySelector('text').getAttribute('data-name'),
        );
      });

      paper.on('element:contextmenu', (element, event, x, y) => {
        this.changeName(element, event, x, y);
      });

      // стандартный шаблон для стрелок
      let link = new standart.Link();
      // толщина стрелок
      link.attr('line/strokeWidth', '1');
      // форма самих стрелок, сейчас уже чем стандарт
      link.attr('line/targetMarker/d', 'M 10 -1.5 0 0 10 1.5 z');

      const RectClass = joint.dia.Element.define(
        'examples.CustomElement',
        // создаем кастомный шаблон для элемнетов, нужен для двухцветной раскраски
        {
          attrs: {
            // надпись внутри элемнета
            label: {
              fontSize: 12,
              fill: 'white',
              refX: '50%',
              refY: '50%',
              yAlignment: 'middle',
              xAlignment: 'middle',
            },
            // левый прямоугольник
            left: {
              refWidth: '50%',
              refHeight: '100%',
            },
            // белая обводка со слабым закруглением для красоты, не играет функциональной роли
            right: {
              // правый прямоугольник сдвинутый на центр
              refWidth: '51%',
              refX: '49%',
              refHeight: '100%',
            },
            // белая обводка со слабым закруглением для красоты, не играет функциональной роли
            outline: {
              refWidth: '100%',
              refHeight: '100%',
              stroke: this.colorFrom.back,
              strokeWidth: 3,
              rx: 5,
              ry: 5,
              fill: 'transparent',
            },
          },
        },
        {
          // именуем сущности для того, чтобы потом к ним обращаться
          markup: [
            {
              tagName: 'rect',
              selector: 'left',
            },
            {
              tagName: 'rect',
              selector: 'right',
            },
            {
              tagName: 'rect',
              selector: 'outline',
            },
            {
              tagName: 'text',
              selector: 'label',
            },
          ],
        },
      );

      // экземпляр нашего кастомного класса
      let rect = new RectClass();

      // дерево с элементами и их позициями на холсте
      const { tree } = this;
      // кнопка сохранить
      const saveBtn = this.$refs.saveTree;
      // обрезанное или нет имя ноды
      let label;

      // функция которая понимает стоит ли закрашивать узел одним цветом или двумя
      function paintNode(node, colorFrom) {
        // переменная с цветом
        let color = '';

        // если метрики вообще существуют
        if (nodes[node].met) {
          // сравниваем если метрика превышает порог
          if (nodes[node].met > nodes[node].tsh) {
            // красим в красный
            color = colorFrom.controlsActive;
            // если не превышает
          } else {
            // в зеленый
            color = colorFrom.controls;
          }
          // красим либо в один цвет либо другой
          rect.attr('left/fill', color);
          rect.attr('right/fill', color);
        } else {
          // красим либо в один цвет либо другой
          rect.attr('left/fill', colorFrom.controls);
          rect.attr('right/fill', colorFrom.controls);
        }
      }

      function paintLink(linkItem, colorFrom, j) {
        let color = '';
        if (linkItem.met) {
          // сравниваем если метрика превышает порог
          if (parseFloat(linkItem.met[j]) > parseFloat(linkItem.tsh[j])) {
            // красим в красный
            color = colorFrom.controlsActive;
            // если не превышает
          } else {
            // в зеленый
            color = colorFrom.controls;
          }
          link.attr('line/stroke', color);
        } else {
          link.attr('line/stroke', colorFrom.text);
        }
      }

      // функция для катсоматизации подписи на самих стрелках, в данный момнет не нужна.
      function linkOptions(localLabel, colorFrom) {
        return [
          {
            markup: [
              {
                tagName: 'rect',
                selector: 'labelBody',
              },
              {
                tagName: 'text',
                selector: 'labelText',
              },
            ],
            attrs: {
              labelText: {
                // стили самого текста
                fill: colorFrom.text,
                textAnchor: 'middle',
                text: localLabel,
                fontSize: 10,
              },
            },
          },
        ];
      }

      // для каждого узла из дерева элементов
      Object.keys(tree[this.direct]).forEach((item) => {
        // копируем шаблон узла
        rect = rect.clone();
        // модифицируем надпись чтобы она влезла
        label = checkLabel(item, this.alies);
        // задаем размер
        rect.resize(100 * nodes[item].size, 35 * nodes[item].size);
        // и положение на полотне
        rect.position(tree[this.direct][item][0], tree[this.direct][item][1]);
        // меняем текст узла
        rect.attr('label/text', label);
        // задаем дополнительный атрибут где будем хранить полное исходное имя узла
        rect.attr('label/data-name', item);
        paintNode(item, this.colorFrom);
        // добовляем узел в объект
        this.rects[item] = rect;
        // добовляем узел на полотно
        rect.addTo(graph);

        // при смене позиции элемента
        rect.on('change:position', (element, position) => {
          // меняем данные в нашем дереве
          this.tree[this.direct][element.attr('label/data-name')][0] = position.x;
          this.tree[this.direct][element.attr('label/data-name')][1] = position.y;
          // и появляется кнопка сохранить измененное положение
          saveBtn.style.opacity = '1';
        });
      });

      // сохраняем созданный объект в локлаьную переменную для удобства
      const { rects } = this;

      // пробегаемся по массиву линий
      links.forEach((item) => {
        // пробегаемся по всем детям (куда должна идти стрелка)
        item.to.forEach((itemChild, j) => {
          // клонируем объект стрелки
          link = link.clone();
          // если потомок находиться на уровень выше чем предок
          // (если то откуда должна идит стрелка находиться ниже чем куда должна идти)
          if (
            tree[this.direct][itemChild][2] < tree[this.direct][item.from][2]
          ) {
            // то меняем стиль стрелки
            link.router('metro', {
              padding: 10,
            });
          } else {
            // то обычный стиль прямой стрелки
            link.router('normal', {
              padding: 10,
            });
          }
          // задаем ширину стрелки
          link.attr('line/strokeWidth', item.thick[j]);
          // если стрелка слишком тонка - утолщаем
          if (item.thick[j] > 1) {
            link.attr('line/targetMarker/d', 'M 10 -3 0 0 10 3 z');
          } else {
            link.attr('line/targetMarker/d', 'M 10 -1.5 0 0 10 1.5 z');
          }
          paintLink(item, this.colorFrom, j);
          // откуда идет стрелка
          link.source(rects[item.from]);
          if (item.label) {
            link.labels(linkOptions(item.label[j], this.colorFrom));
          }
          // и куда
          link.target(rects[itemChild]);
          // добовляем стрелку в граф
          link.addTo(graph);
          // ставим стрелку как бы в начала дерева, чтобы она не перекрывала узлы
          link.toBack();
        });
      });
    },
    getEvents({ event, partelement }) {
      let result = [];
      if (!this.$store.state[this.idDash].events) {
        this.$store.commit('setState', [{
          object: this.$store.state[this.idDash],
          prop: 'events',
          value: [],
        }]);
        return [];
      }
      if (partelement) {
        result = this.$store.state[this.idDash].events.filter((item) => (
          item.event === event
          && item.element === this.id
          && item.partelement === partelement
        ));
      } else {
        result = this.$store.state[this.idDash].events.filter(
          (item) => item.event === event
            && item.target === this.id,
        );
      }
      return result;
    },
    setClick(name) {
      const { tockens } = this.$store.state[this.idDash];
      let tocken = {};

      Object.keys(tockens).forEach((i) => {
        if (
          tockens[i].elem === this.id
          && tockens[i].action === 'click'
          && tockens[i].capture === 'node'
        ) {
          tocken = {
            name: tockens[i].name,
            action: tockens[i].action,
            capture: tockens[i].capture,
          };
          this.$store.commit('setTocken', {
            token: tocken,
            idDash: this.idDash,
            value: name,
            store: this.$store,
          });
        }
      });

      const events = this.getEvents({
        event: 'onclick',
        partelement: 'node',
      });

      if (events.length !== 0) {
        events.forEach((item) => {
          if (item.action === 'set') {
            this.$store.commit('letEventSet', {
              events,
              idDash: this.idDash,
            });
          } else if (item.action === 'go') {
            this.$store.dispatch('letEventGo', {
              event: item,
              idDash: this.idDash,
            });
            this.$router.push(`/dashboards/${item.target.toLowerCase()}`);
          }
        });
      }
    },
    changeName(element, event) {
      let name;
      if (event.target.nodeName !== 'tspan') {
        name = event.target.parentElement
          .querySelector('text')
          .getAttribute('data-name');
      } else {
        name = event.target.parentElement.getAttribute('data-name');
      }
      const rect = this.rects[name];
      this.changedRect.name = name;
      this.changedRect.leftColor = rect.attr('left/fill');
      this.changedRect.rightColor = rect.attr('right/fill');
      rect.attr('left/fill', '#C0C0C0');
      rect.attr('right/fill', '#C0C0C0');
      this.showChangeName = true;
    },
    setName() {
      const rect = this.rects[this.changedRect.name];
      rect.attr('left/fill', this.changedRect.leftColor);
      rect.attr('right/fill', this.changedRect.rightColor);
      rect.attr('label/text', this.newNameRect);
      this.alies[this.changedRect.name] = this.newNameRect;
      this.newNameRect = '';
      this.showChangeName = false;
      this.$refs.saveTree.style.opacity = '1';
    },
    // получить размеры контейнера для графа
    sizeGraph() {
      // получаем размеры от родителя
      const size = { width: 0, height: 0 };
      size.width = this.width;
      size.height = this.height;
      // если он уже отрисован и размеры есть
      if (size.width > 0 && size.height > 0) {
        // то добовляем их в объект
        return { width: size.width, height: size.height };
      }
      return size;
    },
    // первичная подготовка данных
    prepareGraph(data) {
      if (!data[0].relations || !data[0].node) {
        this.nomsg = true;
        this.nomsgtext = 'Невозможно построить граф по этим данным';
        this.errorData = true;
        return;
      }
      this.errorData = false;

      // если данные получены
      if (data.length > 0) {
        // объект в котором узлы и связи и пути
        let result = {
          nodes: [],
          links: [],
        };

        // здесь будем хранить детей каждой записи данных
        let link = [];

        // промежуточный объект в котором будет нода и ее размер
        const nodeSizes = {};

        data.forEach((item) => {
          // пробегаемся по всем данным

          //  разбиваем его потомков в массив
          link = item.relations.split('#');
          // пробегаемся по всем потомкам
          link.forEach((itemLink) => {
            // если такого потомка у нас еще нет
            if (!result.nodes.includes(itemLink)) {
              // то заносим его в результирующий объект
              result.nodes.push(itemLink);
            }
          });

          // если нода не start
          if (item.node !== 'start') {
            nodeSizes[item.node] = {
              size: item.node_size,
            };
            if (item.node_metric) {
              nodeSizes[item.node].met = item.node_metric;
              nodeSizes[item.node].tsh = item.node_threshold;
            }
            if (item.label_n) {
              nodeSizes[item.node].label = item.label_n;
            }

            const linkObj = {
              from: item.node,
              to: link,
              thick: String(item.transition_thick).split('#'),
            };
            if (item.transition_metrics) {
              linkObj.met = String(item.transition_metrics).split('#');
              linkObj.tsh = String(item.transition_thresholds).split('#');
            }
            if (item.label_t) {
              linkObj.label = String(item.label_t).split('#');
            }

            // так же заполняем объект линий
            result.links.push(linkObj);
            // если нода с именем start  то есть от которой начнется граф
          } else {
            this.firstNode = link;
          }
        });

        // проверяем размер линий
        result = this.setSizeElements(result, [], 'links');

        // проверяем размер нодов
        result = this.setSizeElements(result, nodeSizes, 'nodes');

        // заносим в перменную наш результат
        this.preperedData = result;
        this.nomsg = false;
      }
    },
    // сохраняем размер элемнета
    setSizeElements(result, elementSizes, element) {
      // если это нода
      if (element === 'nodes') {
        // находим максимальное значение размера ноды
        let max = Object.values(elementSizes).map((item) => item.size);
        max = Math.max.apply(null, max);
        // создаем несоклько переменных
        let procent;
        let needSize;
        // пробегаемся по всем нодам
        result.nodes.forEach((item) => {
          // если нода есть и есть ее размер
          if (elementSizes[item]) {
            // высчитываем какой процент занимает ее размер
            // от максимального размера самой большой ноды
            procent = (elementSizes[item].size * 100) / max;
            // а затем берем тот же процент но уже
            // от числа 1.5 оптимлаьного размера большой ноды
            // а если размер слишком маленький то ставим единицу,
            // чтобы уж совсе мкрошечными не были ноды
            needSize = (procent * 1.5) / 100 < 1 ? 1 : (procent * 1.5) / 100;
            // если величина не указана ноды
          } else {
            // то сами ставим единицу
            needSize = 1;
          }
          if (!elementSizes[item]) {
            elementSizes[item] = {
              size: needSize,
              met: 0.5,
              tsh: 1,
            };
          } else {
            // заносим новую величину в объект
            elementSizes[item].size = needSize;
          }
        });
        // и обновляем объект в котором указаны уже наши размеры
        result.nodes = elementSizes;
        // если это линия
      } else {
        // переменная с массивом всех размеров всех линий
        const sizesLinks = [];
        // пробегаемся по всем линиям
        result.links.forEach((item) => {
          // и создаем массив со всеми размерами линий
          sizesLinks.push(...item.thick);
        });
        // несколько переменных
        let procent;
        let needSize;
        // находим самую толстую линию
        const max = Math.max.apply(...sizesLinks);
        // пробегаемся по всем линиям
        result.links.forEach((item, i) => {
          // пробегаемся по всем размерам этой линии
          item.thick.forEach((itemChild, j) => {
            // берем процент какой занимает размер этой линии от максимального размера
            procent = (Number(itemChild) * 100) / max;
            //  а затем берем тот же процент, но уже от числа 2 оптимального размера большой линии
            // а если размер слишком маленький то ставим единицу,
            // чтобы уж совсе мкрошечными не были ноды
            needSize = (procent * 2) / 100 < 0.5 ? 0.5 : (procent * 2) / 100;

            // и доболяем наши новые размеры в массив линий
            result.links[i].thick[j] = needSize;
          });
        });
      }

      return result;
    },
    // создаем структуру графа какие ноды на каком уровне располагать
    createStructure() {
      // берем сформированные ранее данные
      const data = this.preperedData;
      // несколько переменных
      const links = {};
      const structure = {};
      const use = [];

      // проверяем соседей
      function checkNeightbours(itemChild, i) {
        // вспомогательная переменная
        let k = -1;
        // если у потомков ноды есть свои потомки
        if (links[itemChild]) {
          // то пробегаемся по текущему уровню
          structure[i].forEach((item, j) => {
            // если потомки потомка есть на уровне
            if (links[itemChild].includes(item)) {
              // то заносим его порядковый номер
              k = j;
            }
          });
        }
        // если переменная изменилась
        if (k !== -1) {
          // проверяем если следующий уровнеь еще не создан
          if (!structure[i + 1]) {
            // то создаем его
            structure[i + 1] = [];
          }
          // а затем помещаем ноду на которую ссылается потомок ноды на уровень ниже
          structure[i + 1].push(structure[i][k]);
          // и выбрасываем его из текущего уровня
          structure[i].splice(k, 1);
        }
      }

      // если ноды и линии есть
      if (data.nodes || data.links) {
        // на нулевой уровень помещаем наши первые ноды
        structure['0'] = this.firstNode;
        // так же пробегаемся по первым нодам и заносим в массив уже исопльзованных
        this.firstNode.forEach((item) => {
          use.push(item);
        });

        // пробегаемся по всем связям
        data.links.forEach((item) => {
          // и в объект добовляем их в нужном нам виде
          links[item.from] = item.to;
        });

        // задаем цикл от единицы потому что у нас уже есть нулевой уровень до количества всех нодов
        for (let i = 1; i < Object.keys(data.nodes).length + 1; i += 1) {
          // если предыдущий уровень есть
          if (structure[i - 1]) {
            // смотрим если еще текущий уровнеь не создан
            if (!structure[i]) {
              // то создаем его
              structure[i] = [];
            }
            // пробегаемся по уровню выше
            structure[i - 1].forEach((item) => {
              // если в нашей ноде есть связи с друими
              if (links[item]) {
                // то пробегаемся по всем его детям
                links[item].forEach((itemChild) => {
                  // если нашей ноды еще нет в массиве уже использованных
                  if (!use.includes(itemChild)) {
                    // то проверяем есть ли у его детей соседи на этом уровне
                    checkNeightbours(itemChild, i);
                    // добовляем его в массив исопльзованных
                    use.push(itemChild);
                    // и помещаем на текушщий уровень
                    structure[i].push(itemChild);
                  }
                });
              }
            });
            // если уровнеь оказался пустой
            if (structure[i].length === 0) {
              // то удаляем его
              delete structure[i];
            }
          }
        }
        // заносим нашу стркутуру в переменную
        this.structure = structure;
      }
    },
    // создаем дерево с позициями нод относительно хоста
    createTree() {
      // понимаем скоько уровней вообще в структуре
      const levels = Object.keys(this.structure).length;
      // если уровни релаьно есть
      if (levels !== 0) {
        // заносим дерево в переменную для удобства
        const { tree } = this;
        // получаем размер контейнера
        const size = this.sizeGraph();
        // несоклько переменных
        let step;
        let otstup;
        let center;
        let odd;
        // если граф располагается вертикально
        if (this.direct === 'vertical') {
          // то рассчитываем шаг с которым будем прыгать по уровням
          step = Math.floor(size.height / levels);
          // рассчитываем цнетр полотна
          center = size.width / 2;
          // и отступ от этого начала полотна
          otstup = step - 70;

          // пробегаемся по структуре
          Object.values(this.structure).forEach((item, l) => {
            // если элемент один на уровне
            if (item.length === 1) {
              // добовляем его в дерево посередине отсутпив сверху сколько надо
              tree[this.direct][item[0]] = [center - 50, otstup, l];
              // если элемнетов несколько
            } else {
              // то сперва понимаем четное количество элемнетов или нет
              odd = item.length % 2 === 0;
              // затем высчитываем позицию центрального элемента
              const centerElem = Math.floor((item.length - 1) / 2);
              // счетчик
              let i = 0;
              // расстояние между нодами на уровне
              const between = [0, 30];

              // если четное число нодов
              if (odd) {
                // то запускаем цикл
                do {
                  // увеличиваем отступ  левого элемнета
                  between[0] += 150;
                  // добовляем левый элемнет
                  tree[this.direct][item[centerElem - i]] = [
                    center - between[0],
                    otstup,
                    l,
                  ];
                  // увеличиваем счетчик
                  i += 1;
                  // добавляем правый элемент
                  tree[this.direct][item[centerElem + i]] = [
                    center + between[1],
                    otstup,
                    l,
                  ];
                  // увеличиваем отступ правого элемента
                  between[1] += 150;
                  // пока у нас есть следующий элемнет слева
                } while (item[centerElem - i]);
                // если нечетное число элемнетов
              } else {
                // то ставим центральный элемент  по центру
                tree[this.direct][item[centerElem]] = [center - 50, otstup, l];
                // отступы сразу ставим
                between[0] = 150;
                between[1] = 150;
                // увеличиваем счетчик
                i += 1;
                do {
                  // увеличиваем отступ левого элемнета
                  between[0] += 150;
                  // добовляемы левый элемнет
                  tree[this.direct][item[centerElem - i]] = [
                    center - between[0],
                    otstup,
                    l,
                  ];
                  // добавляем правый элемент
                  tree[this.direct][item[centerElem + i]] = [
                    center + between[1],
                    otstup,
                    l,
                  ];
                  // увеличиваем отступ правого элемнета
                  between[1] += 150;
                  // увеличиваем счетчик
                  i += 1;
                } while (item[centerElem - i]);
              }
            }

            // увеличиваем отступ
            otstup += step;
          });
        } else {
          // если горизонатльное впринципе вс етоже самое
          // просто разные отступы и инверсия добовления отступов относительно оси
          step = Math.floor(size.width / levels);
          center = size.height / 2;

          otstup = 20;

          Object.values(this.structure).forEach((item, l) => {
            // если элемент один на уровне
            if (item.length === 1) {
              // добовляем его в дерево посередине отсутпив сверху сколько надо
              tree[this.direct][item[0]] = [otstup, center, l];
            } else {
              odd = item.length % 2 === 0;
              const centerElem = Math.floor((item.length - 1) / 2);
              let i = 0;
              const between = [0, 0];
              if (odd) {
                do {
                  // увеличиваем отступ в зависимости от размера добавленного узла
                  between[0] += 70;
                  // добовляем левый элемнет
                  tree[this.direct][item[centerElem - i]] = [
                    otstup,
                    center + between[0],
                    l,
                  ];
                  i += 1;
                  // добавляем правый элемент
                  between[1] += 70;
                  tree[this.direct][item[centerElem + i]] = [
                    otstup,
                    center - between[1],
                    l,
                  ];
                } while (item[centerElem - i]);
              } else {
                tree[this.direct][item[centerElem]] = [otstup, center, l];
                between[0] = 20;
                between[1] = 20;
                i += 1;
                do {
                  // увеличиваем отступ в зависимости от размера добавленного узла
                  between[0] += 70;

                  // добовляемы левый элемнет
                  tree[this.direct][item[centerElem - i]] = [
                    otstup,
                    center + between[0],
                    l,
                  ];
                  between[1] += 70;
                  // добавляем правый элемент
                  tree[this.direct][item[centerElem + i]] = [
                    otstup,
                    center - between[1],
                    l,
                  ];
                  i += 1;
                } while (item[centerElem - i]);
              }
            }

            otstup += step;
          });
        }

        // заносим сформированное дерево в переменную
        this.tree = tree;
      }
    },
    // изменение положение отрисовки графа
    changeDirect() {
      // собственно меняем перемненую с положением графа
      this.direct = this.direct === 'vertical' ? 'horizontal' : 'vertical';
      // и отображаем кнопку сохранить
      this.$refs.saveTree.style.opacity = '1';
    },
    // кнопка сохранения графа и его положения
    saveTree(event) {
      // отслыаем граф и его положение для соранения во store
      this.$store.commit('setGraphTree', {
        tree: this.tree,
        direct: this.direct,
        alies: this.alies,
        idDash: this.idDash,
        id: this.id,
      });
      // скрываем кнопку сохранить
      event.target.style.opacity = '0';
    },
    // функция выоплняющяя все шаги по созаднию графа
    stepByStep(data) {
      // создаем promise чтобы затем отрисовать график асинхронно
      const prom = new Promise((resolve) => {
        // получаем элемент графа
        const elem = this.$refs.graph;

        // если он уже создался на странице
        if (elem) {
          resolve(elem);
        }
      });

      // как раз тут делаем асинхронность
      prom.then((elem) => {
        // сперва подготовливаем данные
        this.prepareGraph(data);

        if (!this.errorData) {
          // потом смотрим если мы раньше уже сформировали дерево элемнетов,
          // то нет смысла каждый раз его рассчитывать
          if (Object.keys(this.tree[this.direct]).length === 0) {
            // а если еще не создано, то сперва создаем структуру какой элемнет на каком уровне
            this.createStructure();
            // а затем уже в каком месте на полотне
            this.createTree();
          }

          // собственно отрисовываем сам граф
          this.createGraph(elem);
        }
      });
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashGraph.sass';
</style>
