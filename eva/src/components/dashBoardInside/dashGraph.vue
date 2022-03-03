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
    idFrom: null,
    idDashFrom: null,
    dataRestFrom: null,
    // shouldFrom: null,
    colorFrom: null,
    dataLoadingFrom: null,
    heightFrom: null,
    widthFrom: null,
    searchRep: null,
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
  mounted() {
    // при первом появлении графа

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
    createGraph(elem) {
      // функция отрисовки графа

      const size = this.sizeGraph(); // сперва получаем размеры контейнера для графа

      const graph = new joint.dia.Graph(); // объект самого графа

      const { tooltipName } = this.$refs; // получаем тултип всплывающий при наведении мышки

      const { links } = this.preperedData; // линии графа
      const { nodes } = this.preperedData; // ноды графа

      const paper = new joint.dia.Paper({
        // объект полотна для графа
        el: elem, // размещать будем в нашем нотбуке
        model: graph, // размещать будем граф
        width: size.width, // ширина нашего полотна равна ширине элемента
        height: size.height, // высота равна высоте элемнета
        gridSize: 1, // размер неких точек на полотне, но мы все ранво их не выводим
        interactive: true, // Флаг для отключения перетаскивания элемнетов
      });

      paper.options.defaultConnector = {
        // конфиграция другая для поведения линий на графике с круглыми краями
        name: 'rounded',
        args: {
          radius: 20,
        },
      };

      paper.on('element:mouseover', (event) => {
        // при наведении на элемнет в полотне (ноду)
        Object.values(event.el.children).forEach((item) => {
          // пробегаемся по его детям
          if (item.getAttribute('joint-selector') === 'label') {
            // и ищем надпись
            const name = item.getAttribute('data-name'); // получаем полное имя ноды из атрибута
            this.tooltipName = `${name}<br>${nodes[name].label}`; // заносим это имя сперва в тултип
            tooltipName.style.opacity = '0.7'; // потом отражаем его
            tooltipName.style.left = `${this.rects[name].position().x + 70}px`; // и позиционируем
            tooltipName.style.top = `${this.rects[name].position().y - 40}px`;
          }
        });
      });

      paper.on('element:mouseout', (event) => {
        // а когда увели мышку с элемента
        Object.values(event.el.children).forEach((item) => {
          // снова находим надпись
          if (item.getAttribute('joint-selector') === 'label') {
            tooltipName.style.opacity = '0'; // и скрываем тултип
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

      let link = new standart.Link(); // стандартный шаблон для стрелок
      link.attr('line/strokeWidth', '1'); // толщина стрелок
      link.attr('line/targetMarker/d', 'M 10 -1.5 0 0 10 1.5 z'); // форма самих стрелок, сейчас уже чем стандарт

      const rectClass = joint.dia.Element.define(
        'examples.CustomElement',
        {
          // создаем кастомный шаблон для элемнетов, нужен для двухцветной раскраски
          attrs: {
            label: {
              // надпись внутри элемнета
              fontSize: 12,
              fill: 'white',
              refX: '50%',
              refY: '50%',
              yAlignment: 'middle',
              xAlignment: 'middle',
            },
            left: {
              // левый прямоугольник
              refWidth: '50%',
              refHeight: '100%',
            },
            right: {
              // правый прямоугольник сдвинутый на центр
              refWidth: '51%',
              refX: '49%',
              refHeight: '100%',
            }, // белая обводка со слабым закруглением для красоты, не играет функциональной роли
            outline: {
              // белая обводка со слабым закруглением для красоты, не играет функциональной роли
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
          markup: [
            // именуем сущности для того, чтобы потом к ним обращаться
            {
              // именуем сущности для того, чтобы потом к ним обращаться
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

      let rect = new rectClass(); // экземпляр нашего кастомного класса

      const { tree } = this; // дерево с элементами и их позициями на холсте
      const saveBtn = this.$refs.saveTree; // кнопка сохранить
      let label; // обрезанное или нет имя ноды

      Object.keys(tree[this.direct]).forEach((item) => {
        // для каждого узла из дерева элементов

        rect = rect.clone(); // копируем шаблон узла
        label = checkLabel(item, this.alies); // модифицируем надпись чтобы она влезла
        rect.resize(100 * nodes[item].size, 35 * nodes[item].size); // задаем размер
        rect.position(tree[this.direct][item][0], tree[this.direct][item][1]); // и положение на полотне
        rect.attr('label/text', label); // меняем текст узла
        rect.attr('label/data-name', item); // задаем дополнительный атрибут где будем хранить полное исходное имя узла
        paintNode(item, this.colorFrom);
        this.rects[item] = rect; // добовляем узел в объект
        rect.addTo(graph); // добовляем узел на полотно

        rect.on('change:position', (element, position) => {
          // при смене позиции элемента
          this.tree[this.direct][element.attr('label/data-name')][0] = position.x; // меняем данные в нашем дереве
          this.tree[this.direct][element.attr('label/data-name')][1] = position.y;
          saveBtn.style.opacity = '1'; // и появляется кнопка сохранить измененное положение
        });
      });

      const { rects } = this; // сохраняем созданный объект в локлаьную переменную для удобства

      links.forEach((item) => {
        // пробегаемся по массиву линий
        item.to.forEach((itemChild, j) => {
          // пробегаемся по всем детям (куда должна идти стрелка)
          link = link.clone(); // клонируем объект стрелки
          if (
            tree[this.direct][itemChild][2] < tree[this.direct][item.from][2]
          ) {
            // если потомок находиться на уровень выше чем предок (если то откуда должна идит стрелка находиться ниже чем куда должна идти)
            link.router('metro', {
              // то меняем стиль стрелки
              padding: 10,
            });
          } else {
            link.router('normal', {
              // то обычный стиль прямой стрелки
              padding: 10,
            });
          }
          link.attr('line/strokeWidth', item.thick[j]); // задаем ширину стрелки
          item.thick[j] > 1
            ? link.attr('line/targetMarker/d', 'M 10 -3 0 0 10 3 z')
            : link.attr('line/targetMarker/d', 'M 10 -1.5 0 0 10 1.5 z'); // если стрелка слишком тонка - утолщаем
          paintLink(item, this.colorFrom, j);
          link.source(rects[item.from]); // откуда идет стрелка
          if (item.label) {
            link.labels(linkOptions(item.label[j], this.colorFrom));
          }
          link.target(rects[itemChild]); // и куда
          link.addTo(graph); // добовляем стрелку в граф
          link.toBack(); // ставим стрелку как бы в начала дерева, чтобы она не перекрывала узлы
        });
      });

      function checkLabel(label, alies) {
        // модифицируем надпись в ноде
        if (alies[label]) {
          label = alies[label];
        } else if (label.length > 10) {
          // если там больше 10 символов
          label = `${label.substring(0, 10)}...`; // обрезаем и добовляем троеточие
        }
        return label;
      }

      function paintLink(linkItem, colorFrom, j) {
        let color = '';
        if (linkItem.met) {
          if (parseFloat(linkItem.met[j]) > parseFloat(linkItem.tsh[j])) {
            // сравниваем если метрика превышает порог
            color = colorFrom.controlsActive; // красим в красный
          } else {
            // если не превышает
            color = colorFrom.controls; // в зеленый
          }
          link.attr('line/stroke', color);
        } else {
          link.attr('line/stroke', colorFrom.text);
        }
      }

      function paintNode(node, colorFrom) {
        // функция которая понимает стоит ли закрашивать узел одним цветом или двумя

        let color = ''; // переменная с цветом

        if (nodes[node].met) {
          // если метрики вообще существуют

          if (nodes[node].met > nodes[node].tsh) {
            // сравниваем если метрика превышает порог
            color = colorFrom.controlsActive; // красим в красный
          } else {
            // если не превышает
            color = colorFrom.controls; // в зеленый
          }
          rect.attr('left/fill', color); // красим либо в один цвет либо другой
          rect.attr('right/fill', color);
        } else {
          rect.attr('left/fill', colorFrom.controls); // красим либо в один цвет либо другой
          rect.attr('right/fill', colorFrom.controls);
        }
      }

      function linkOptions(label, colorFrom) {
        // функция для катсоматизации подписи на самих стрелках, в данный момнет не нужна.

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
                text: label,
                fontSize: 10,
              },
            },
          },
        ];
      }
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
            tocken,
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
    sizeGraph() {
      // получить размеры контейнера для графа
      const size = { width: 0, height: 0 }; // получаем размеры от родителя
      size.width = this.width;
      size.height = this.height;
      if (size.width > 0 && size.height > 0) {
        // если он уже отрисован и размеры есть
        return { width: size.width, height: size.height }; // то добовляем их в объект
      }
    },
    prepareGraph(data) {
      // первичная подготовка данных

      if (!data[0].relations || !data[0].node) {
        this.nomsg = true;
        this.nomsgtext = 'Невозможно построить граф по этим данным';
        this.errorData = true;
        return false;
      }
      this.errorData = false;

      if (data.length > 0) {
        // если данные получены

        let result = {
          // объект в котором узлы и связи и пути
          nodes: [],
          links: [],
        };

        let link = []; // здесь будем хранить детей каждой записи данных

        const nodeSizes = {}; // промежуточный объект в котором будет нода и ее размер

        data.forEach((item) => {
          // пробегаемся по всем данным

          link = item.relations.split('#'); //  разбиваем его потомков в массив
          link.forEach((itemLink) => {
            // пробегаемся по всем потомкам
            if (!result.nodes.includes(itemLink)) {
              // если такого потомка у нас еще нет
              result.nodes.push(itemLink); // то заносим его в результирующий объект
            }
          });

          if (item.node !== 'start') {
            // если нода не start
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

            result.links.push(linkObj); // так же заполняем объект линий
          } else {
            // если нода с именем start  то есть от которой начнется граф
            this.firstNode = link;
          }
        });

        result = this.setSizeElements(result, [], 'links'); // проверяем размер линий

        result = this.setSizeElements(result, nodeSizes, 'nodes'); // проверяем размер нодов

        this.preperedData = result; // заносим в перменную наш результат
        this.nomsg = false;
      }
    },
    setSizeElements(result, elementSizes, element) {
      // сохраняем размер элемнета
      if (element === 'nodes') {
        // если это нода
        let max = Object.values(elementSizes).map((item) => item.size);
        max = Math.max.apply(null, max); // находим максимальное значение размера ноды
        let procent; let
          needSize; // создаем несоклько переменных
        result.nodes.forEach((item) => {
          // пробегаемся по всем нодам
          if (elementSizes[item]) {
            // если нода есть и есть ее размер
            procent = (elementSizes[item].size * 100) / max; // высчитываем какой процент занимает ее размер от максимального размера самой большой ноды
            (procent * 1.5) / 100 < 1
              ? (needSize = 1)
              : (needSize = (procent * 1.5) / 100); // а затем берем тот же процент но уже от числа 1.5 оптимлаьного размера большой ноды
            // а если размер слишком маленький то ставим единицу, чтобы уж совсе мкрошечными не были ноды
          } else {
            // если величина не указана ноды
            needSize = 1; // то сами ставим единицу
          }
          if (!elementSizes[item]) {
            elementSizes[item] = {
              size: needSize,
              met: 0.5,
              tsh: 1,
            };
          } else {
            elementSizes[item].size = needSize; // заносим новую величину в объект
          }
        });
        result.nodes = elementSizes; // и обновляем объект в котором указаны уже наши размеры
      } else {
        // если это линия
        const sizesLinks = []; // переменная с массивом всех размеров всех линий
        result.links.forEach((item) => {
          // пробегаемся по всем линиям
          sizesLinks.push.apply(sizesLinks, item.thick); // и создаем массив со всеми размерами линий
        });
        let procent; let
          needSize; // несколько переменных
        const max = Math.max.apply(null, sizesLinks); // находим самую толстую линию
        result.links.forEach((item, i) => {
          // пробегаемся по всем линиям
          item.thick.forEach((itemChild, j) => {
            // пробегаемся по всем размерам этой линии
            procent = (Number(itemChild) * 100) / max; // берем процент какой занимает размер этой линии от максимального размера
            (procent * 2) / 100 < 0.5
              ? (needSize = 0.5)
              : (needSize = (procent * 2) / 100); //  а затем берем тот же процент, но уже от числа 2 оптимального размера большой линии
            // а если размер слишком маленький то ставим единицу, чтобы уж совсе мкрошечными не были ноды
            result.links[i].thick[j] = needSize; // и доболяем наши новые размеры в массив линий
          });
        });
      }

      return result;
    },
    createStructure() {
      // создаем структуру графа какие ноды на каком уровне располагать
      const data = this.preperedData; // берем сформированные ранее данные
      const links = {}; // несколько переменных
      const structure = {};
      const use = [];
      if (data.nodes || data.links) {
        // если ноды и линии есть

        structure['0'] = this.firstNode; // на нулевой уровень помещаем наши первые ноды
        this.firstNode.forEach((item) => {
          // так же пробегаемся по первым нодам и заносим в массив уже исопльзованных
          use.push(item);
        });

        data.links.forEach((item) => {
          // пробегаемся по всем связям

          links[item.from] = item.to; // и в объект добовляем их в нужном нам виде
        });

        for (let i = 1; i < Object.keys(data.nodes).length + 1; i++) {
          // задаем цикл от единицы потому что у нас уже есть нулевой уровень до количества всех нодов
          if (structure[i - 1]) {
            // если предыдущий уровень есть
            if (!structure[i]) {
              // смотрим если еще текущий уровнеь не создан
              structure[i] = []; // то создаем его
            }
            structure[i - 1].forEach((item) => {
              // пробегаемся по уровню выше
              if (links[item]) {
                // если в нашей ноде есть связи с друими

                links[item].forEach((itemChild) => {
                  // то пробегаемся по всем его детям
                  if (!use.includes(itemChild)) {
                    // если нашей ноды еще нет в массиве уже использованных
                    checkNeightbours(itemChild, i); // то проверяем есть ли у его детей соседи на этом уровне
                    use.push(itemChild); // добовляем его в массив исопльзованных
                    structure[i].push(itemChild); // и помещаем на текушщий уровень
                  }
                });
              }
            });
            if (structure[i].length === 0) {
              // если уровнеь оказался пустой
              delete structure[i]; // то удаляем его
            }
          }
        }
        this.structure = structure; // заносим нашу стркутуру в переменную
      }

      function checkNeightbours(itemChild, i) {
        // проверяем соседей
        let k = -1; // вспомогательная переменная
        if (links[itemChild]) {
          // если у потомков ноды есть свои потомки
          structure[i].forEach((item, j) => {
            // то пробегаемся по текущему уровню
            if (links[itemChild].includes(item)) {
              // если потомки потомка есть на уровне
              k = j; // то заносим его порядковый номер
            }
          });
        }
        if (k !== -1) {
          // если переменная изменилась
          if (!structure[i + 1]) {
            // проверяем если следующий уровнеь еще не создан
            structure[i + 1] = []; // то создаем его
          }
          structure[i + 1].push(structure[i][k]); // а затем помещаем ноду на которую ссылается потомок ноды на уровень ниже
          structure[i].splice(k, 1); // и выбрасываем его из текущего уровня
        }
      }
    },
    createTree() {
      // создаем дерево с позициями нод относительно хоста
      const levels = Object.keys(this.structure).length; // понимаем скоько уровней вообще в структуре
      if (levels !== 0) {
        // если уровни релаьно есть
        const { tree } = this; // заносим дерево в переменную для удобства
        const size = this.sizeGraph(); // получаем размер контейнера
        let step; let otstup; let center; let
          odd; // несоклько переменных
        if (this.direct === 'vertical') {
          // если граф располагается вертикально

          step = Math.floor(size.height / levels); // то рассчитываем шаг с которым будем прыгать по уровням
          center = size.width / 2; // рассчитываем цнетр полотна
          otstup = step - 70; // и отступ от этого начала полотна

          Object.values(this.structure).forEach((item, l) => {
            // пробегаемся по структуре

            if (item.length === 1) {
              // если элемент один на уровне
              tree[this.direct][item[0]] = [center - 50, otstup, l]; // добовляем его в дерево посередине отсутпив сверху сколько надо
            } else {
              // если элемнетов несколько
              item.length % 2 === 0 ? (odd = true) : (odd = false); // то сперва понимаем четное количество элемнетов или нет
              const centerElem = Math.floor((item.length - 1) / 2); // затем высчитываем позицию центрального элемента
              let i = 0; // счетчик
              const between = [0, 30]; // расстояние между нодами на уровне

              if (odd) {
                // если четное число нодов
                do {
                  // то запускаем цикл

                  between[0] += 150; // увеличиваем отступ  левого элемнета
                  tree[this.direct][item[centerElem - i]] = [
                    center - between[0],
                    otstup,
                    l,
                  ]; // добовляем левый элемнет
                  i++; // увеличиваем счетчик
                  tree[this.direct][item[centerElem + i]] = [
                    center + between[1],
                    otstup,
                    l,
                  ]; // добавляем правый элемент
                  between[1] += 150; // увеличиваем отступ правого элемента
                } while (item[centerElem - i]); // пока у нас есть следующий элемнет слева
              } else {
                // если нечетное число элемнетов
                tree[this.direct][item[centerElem]] = [center - 50, otstup, l]; // то ставим центральный элемент  по центру
                between[0] = 150; // отступы сразу ставим
                between[1] = 150;
                i++; // увеличиваем счетчик
                do {
                  between[0] += 150; // увеличиваем отступ левого элемнета
                  tree[this.direct][item[centerElem - i]] = [
                    center - between[0],
                    otstup,
                    l,
                  ]; // добовляемы левый элемнет
                  tree[this.direct][item[centerElem + i]] = [
                    center + between[1],
                    otstup,
                    l,
                  ]; // добавляем правый элемент
                  between[1] += 150; // увеличиваем отступ правого элемнета
                  i++; // увеличиваем счетчик
                } while (item[centerElem - i]);
              }
            }

            otstup += step; // увеличиваем отступ
          });
        } else {
          // если горизонатльное впринципе вс етоже самое просто разные отступы и инверсия добовления отступов относительно оси
          step = Math.floor(size.width / levels);
          center = size.height / 2;

          otstup = 20;

          Object.values(this.structure).forEach((item, l) => {
            if (item.length === 1) {
              // если элемент один на уровне

              tree[this.direct][item[0]] = [otstup, center, l]; // добовляем его в дерево посередине отсутпив сверху сколько надо
            } else {
              item.length % 2 === 0 ? (odd = true) : (odd = false);
              const centerElem = Math.floor((item.length - 1) / 2);
              let i = 0;
              const between = [0, 0];
              if (odd) {
                do {
                  between[0] += 70; // увеличиваем отступ в зависимости от размера добавленного узла
                  tree[this.direct][item[centerElem - i]] = [
                    otstup,
                    center + between[0],
                    l,
                  ]; // добовляем левый элемнет
                  i++;
                  between[1] += 70;
                  tree[this.direct][item[centerElem + i]] = [
                    otstup,
                    center - between[1],
                    l,
                  ]; // добавляем правый элемент
                } while (item[centerElem - i]);
              } else {
                tree[this.direct][item[centerElem]] = [otstup, center, l];
                between[0] = 20;
                between[1] = 20;
                i++;
                do {
                  between[0] += 70; // увеличиваем отступ в зависимости от размера добавленного узла
                  tree[this.direct][item[centerElem - i]] = [
                    otstup,
                    center + between[0],
                    l,
                  ]; // добовляемы левый элемнет
                  between[1] += 70;
                  tree[this.direct][item[centerElem + i]] = [
                    otstup,
                    center - between[1],
                    l,
                  ]; // добавляем правый элемент
                  i++;
                } while (item[centerElem - i]);
              }
            }

            otstup += step;
          });
        }

        this.tree = tree; // заносим сформированное дерево в переменную
      }
    },
    changeDirect() {
      // изменение положение отрисовки графа
      this.direct === 'vertical'
        ? (this.direct = 'horizontal')
        : (this.direct = 'vertical'); // собственно меняем перемненую с положением графа
      this.$refs.saveTree.style.opacity = '1'; // и отображаем кнопку сохранить
    },
    saveTree(event) {
      // кнопка сохранения графа и его положения
      this.$store.commit('setGraphTree', {
        tree: this.tree,
        direct: this.direct,
        alies: this.alies,
        idDash: this.idDash,
        id: this.id,
      }); // отслыаем граф и его положение для соранения во store
      event.target.style.opacity = '0'; // скрываем кнопку сохранить
    },
    stepByStep(data) {
      // функция выоплняющяя все шаги по созаднию графа

      const prom = new Promise((resolve) => {
        // создаем promise чтобы затем отрисовать график асинхронно

        const elem = this.$refs.graph; // получаем элемент графа

        if (elem) {
          // если он уже создался на странице

          resolve(elem);
        }
      });

      prom.then((elem) => {
        // как раз тут делаем асинхронность

        this.prepareGraph(data); // сперва подготовливаем данные

        if (!this.errorData) {
          if (Object.keys(this.tree[this.direct]).length === 0) {
            // потом смотрим если мы раньше уже сформировали дерево элемнетов, то нет смысла каждый раз его рассчитывать

            this.createStructure(); // а если еще не создано, то сперва создаем структуру какой элемнет на каком уровне
            this.createTree(); // а затем уже в каком месте на полотне
          }

          this.createGraph(elem); // собственно отрисовываем сам граф
        }
      });
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashGraph.sass';
</style>
