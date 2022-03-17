<template>
  <div
    ref="svgBlock"
    class="dash-csvg"
    tabindex="0"
  >
    <div
      v-show="noMsg === 1"
      ref="csvg"
      class="csvg-block"
      :style="{ width: svgStyleWidth, height: svgStyleHeight }"
      @mouseover="positionTooltip"
      @click="clickSvg"
      @mouseout="mouseoutSvg"
      v-html="svg"
    />
    <div
      v-show="noMsg === 0"
      class="file-input"
    >
      <v-file-input
        :prepend-icon="image"
        :style="{ color: color.text, fill: color.text }"
        :color="color.controls"
        class="file-itself"
        hide-details
        outlined
        label="Загрузить изображение"
        @change="file = $event"
      />
      <button
        class="file-btn"
        :style="{ color: 'white', background: color.controls }"
        @click="setSvg"
      >
        {{ sendMsg }}
      </button>
      <div
        class="answer-block"
        :class="{ answerShow: answerShow }"
        :style="{ color: answerColor }"
      >
        {{ answer }}
      </div>
    </div>
    <div
      v-show="noMsg === 2"
      class="errormsg"
    >
      {{ msgText }}
    </div>
    <v-icon
      v-if="dataModeFrom"
      v-show="noMsg !== 2"
      class="icon file"
      :color="colorMsg"
      @click="noMsg === 0 ? (noMsg = 1) : (noMsg = 0)"
    >
      {{ upload }}
    </v-icon>
    <div
      ref="tooltip"
      class="tooltip"
      :class="{ tooltipShow: tooltipShow }"
      :style="{ backgroundColor: color.backElement, borderColor: color.text }"
    >
      <div
        v-show="
          tooltipFrom.texts &&
            tooltipFrom.texts.length === 0 &&
            tooltipFrom.links.length === 0 &&
            tooltipFrom.buttons.length === 0
        "
        class="id-tooltip"
      >
        {{ idTooltip }}
      </div>
      <div
        v-if="tooltipFrom.texts"
        class="text-block-tooltip"
      >
        <p
          v-for="i in tooltipFrom.texts.length"
          :key="i + 'texts'"
        >
          {{ checkTokenInTooltip(tooltipFrom.texts[i - 1]) }}
        </p>
      </div>
      <div
        v-show="tooltipFrom.links && tooltipFrom.links.length !== 0"
        class="white-space"
      />
      <div
        v-if="tooltipFrom.links"
        class="link-block-tooltip"
      >
        <a
          v-for="i in tooltipFrom.links.length"
          :key="i + 'links'"
          :href="checkTokenInTooltip(tooltipFrom.links[i - 1].url)"
          target="_blank"
        >
          {{ tooltipFrom.links[i - 1].name }}
          <span />
        </a>
      </div>
      <div
        v-show="tooltipFrom.buttons && tooltipFrom.buttons.length !== 0"
        class="white-space"
      />
      <div
        v-if="tooltipFrom.buttons"
        class="button-block-tooltip"
        :data-options="String(options)"
      >
        <button
          v-for="i in tooltipFrom.buttons.length"
          :key="i + 'buttons'"
          :data-id="tooltipFrom.buttons[i - 1].id"
          class="tooltip-button"
          :style="{ color: 'white', background: color.controls }"
          @click="setClick(tooltipFrom.buttons[i - 1].id, 'btn')"
        >
          {{ tooltipFrom.buttons[i - 1].name }}
        </button>
      </div>
    </div>
    <div
      class="link-canvas"
      :class="{ linkCanvasShow: linkCanvasShow }"
    >
      <canvas ref="link" />
    </div>
  </div>
</template>

<script>
import { mdiFileImageOutline, mdiUpload } from '@mdi/js';

export default {
  props: {
    // переменные полученные от родителя
    idFrom: {
      type: String,
      required: true,
    }, // id элемнета (table, graph-2)
    idDashFrom: {
      type: String,
      required: true,
    }, // id дашборда
    dataRestFrom: {
      type: Array,
      required: true,
    }, // данные полученые после выполнения запроса
    colorFrom: {
      type: Object,
      required: true,
    }, // цветовые переменные
    widthFrom: {
      type: Number,
      required: true,
    }, // ширина родительского компонента
    heightFrom: {
      type: Number,
      required: true,
    }, // выоста родительского компонента
    tooltipFrom: {
      type: Object,
      required: true,
    }, // объект тултипа
    dataModeFrom: {
      type: Boolean,
      required: true,
    }, // выключена ли шапка или включена
    activeElemFrom: {
      type: String,
      required: true,
    },
    dataReport: {
      type: Boolean,
      required: true,
    },
    isFullScreen: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      actions: [
        {
          name: 'click',
          capture: [],
        },
        {
          name: 'mouseover',
          capture: [],
        },
      ],
      captures: {},
      noMsg: 1,
      msgText: 'Нет данных для отображения',
      sendMsg: 'Отправить изображение',
      image: mdiFileImageOutline,
      file: '',
      upload: mdiUpload,
      dataFrom: {},
      token: '',
      answer: 'Изображение успешно загружено',
      answerShow: false,
      answerColor: '',
      otstupBottom: 45,
      tooltipShow: false,
      linkCanvasShow: false,
      tooltipPress: false,
      tooltipBody: '',
      tooltipOptions: false,
      idTooltip: '',
      svg: '',
      svgChanges: {},
    };
  },
  computed: {
    // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    svgStyleWidth() {
      return `${this.widthFrom - 40}px`;
    },
    svgStyleHeight() {
      return `${this.heightFrom - this.otstupBottom}px`;
    },
    color() {
      return this.colorFrom;
    },
    colorMsg() {
      if (this.noMsg === 1) {
        return this.color.controls;
      }
      return this.color.controlsActive;
    },
    dashFromStore() {
      return this.$store.state[this.idDash][this.id];
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.id, idDash: this.idDash });
      }

      if (!this.dashFromStore?.options.pinned) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pinned',
          value: false,
        }]);
      }

      if (!this.dashFromStore.options.lastDot) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'lastDot',
          value: false,
        }]);
      }
      if (!this.dashFromStore.options.stringOX) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'stringOX',
          value: false,
        }]);
      }
      if (!this.dashFromStore?.options.united) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'united',
          value: false,
        }]);
      }

      return this.dashFromStore.options;
    },
    updatedOptions() {
      return this.getOptions;
    },
    options() {
      return this.getOptions.change;
    },
  },
  watch: {
    updatedOptions: {
      immediate: true,
      deep: true,
      handler() {
        if (this.tooltipFrom.buttons) {
          // TODO: эта строка вызывает бесконечный цыкл, и наглухо вешает сайт
          // this.captures = this.tooltipFrom.buttons.map((item) => item.id);
        }
      },
    },
    dataRestFrom() {
      if (
        this.dataRestFrom
        && Object.keys(this.dataRestFrom).length !== 0
        && this.dataRestFrom[0].svg_filename
        && this.dataRestFrom[0].svg_filename !== ''
      ) {
        if (this.dataReport) {
          if (this.activeElemFrom === this.id) {
            [this.dataFrom] = this.dataRestFrom;
            this.getSvg(this.dataRestFrom[0].svg_filename);
            this.$store.commit('setActions', {
              actions: this.actions,
              idDash: this.idDash,
              id: this.id,
            });
          } else {
            this.svg = '';
          }
        } else {
          [this.dataFrom] = this.dataRestFrom;
          this.getSvg(this.dataRestFrom[0].svg_filename);
          this.$store.commit('setActions', {
            actions: this.actions,
            idDash: this.idDash,
            id: this.id,
          });
        }
      }
      if (window.screen.width <= 1600) {
        this.otstupBottom = 30;
      }
    },
    dataModeFrom(dataMode) {
      if (dataMode) {
        this.otstupBottom = window.screen.width <= 1600 ? 30 : 45;
      } else {
        this.otstupBottom = 10;
      }
    },
    widthFrom() {
      this.checkSize();
    },
    heightFrom() {
      this.checkSize();
    },
    captures(captures) {
      this.actions[0].capture = captures;
      this.$store.commit('setActions', {
        actions: this.actions,
        idDash: this.idDash,
        id: this.id,
      });
    },
  },
  mounted() {
    if (this.$refs.svgBlock) {
      this.$refs.svgBlock.addEventListener('keydown', (event) => {
        if (event.key === 'Control') {
          this.tooltipPress = !this.tooltipPress;
          if (!this.tooltipPress) {
            this.tooltipShow = false;
            this.linkCanvasShow = false;
          } else {
            this.tooltipShow = true;
            this.linkCanvasShow = true;
          }
        }
      });
    }
  },
  methods: {
    async getSvg(svg) {
      this.$emit('setLoading', true);
      const response = await this.$store.dispatch('setSvg', svg);
      if (response !== '') {
        this.$emit('setLoading', false);
        this.svg = response;
        this.noMsg = 1;
        this.checkSize();
        this.checkCapture();
      } else {
        this.msgText = 'Изображение получить не удалось';
        this.noMsg = 2;
        this.$emit('setLoading', false);
      }
    },
    checkSize() {
      // TODO: для чего здесь эта строка?
      this.$refs.csvg;
      if (this.svg !== 'Нет данных для отображения' && this.svg !== '') {
        let timeOut = setTimeout(
          function tick() {
            if (this.$refs.csvg.querySelector('svg') != null) {
              clearTimeout(timeOut);
              const svgElem = this.$refs.csvg.querySelector('svg');
              svgElem.setAttribute('width', this.widthFrom - 40);
              svgElem.setAttribute(
                'height',
                this.heightFrom - this.otstupBottom,
              );
            } else {
              timeOut = setTimeout(tick.bind(this), 1000);
            }
          }.bind(this),
          0,
        );
      }
    },
    async checkCapture() {
      // получаем объект свойства элементов из данных
      const captures = this.prepareCapture();
      let elem = '';
      let timeOut = setTimeout(
        // запускаем цикл повторений, ибо нам надо удостовериться что свг уже отрисовался
        function tick() {
          // и если уже отрисовался
          if (this.$refs.csvg.querySelector('svg') != null) {
            // прекращаем цикл
            clearTimeout(timeOut);

            // прбегаемся по  элементам
            Object.keys(captures).forEach((item) => {
              // получаем элемент для которого нужно проверить свойства
              elem = this.$refs.csvg
                .querySelector('svg')
                .querySelector(`#${item}`);

              // если данный элемнет вообще существует
              if (elem) {
                // пробегаемя по его свойствам
                Object.keys(captures[item]).forEach((capture) => {
                  // если свойство не id и не название файла, потмоу что они нам не интересны
                  if (capture !== 'id' && capture !== 'svg_filename') {
                    // так же проверяем что свойство не равно null (не пустое)
                    if (captures[item][capture] != null) {
                      // если в специальном объекте с только изменившимся свойствами
                      // нет еще этого элемента
                      if (!this.svgChanges[item]) {
                        // создаем его
                        this.svgChanges[item] = {};
                      }
                      // если у созданного элемнета нет еще такого свойства,
                      // то есть впервые оно изменилось
                      if (!this.svgChanges[item][capture]) {
                        // то сперва проверяем текст ли это
                        if (capture === 'tag_value') {
                          // и если текст то заносим в наш объект с измененными данными
                          // значение которое было изначально
                          this.svgChanges[item][capture] = elem.innerHTML;
                          // и потом уже в самой свг обновляем значение на то, что пришло из данных
                          elem.innerHTML = captures[item][capture];
                          // а если не еткст а другие свойства
                        } else {
                          // делаем тоже самое, заносим значение по умолчанию
                          this.svgChanges[item][capture] = elem.getAttribute(capture);
                          // а в самой свг меняем не значение из данных
                          elem.setAttribute(capture, captures[item][capture]);
                        }
                        // если значенеи по умолчанию уже занесено у нас в объект с изменениями
                      } else if (capture === 'tag_value') {
                        // то делаем тоже самое, толко не трогаем по умолчанию,
                        // меняем лишь значение в самой свг
                        elem.innerHTML = captures[item][capture];
                      } else {
                        elem.setAttribute(capture, captures[item][capture]);
                      }
                    } else {
                      // если значение пришло пустое
                      if (!this.svgChanges[item]) {
                        // то все ранво првоеряем есть ли такой элемент
                        // в нашем объекте с изменениями
                        this.svgChanges[item] = {};
                      }
                      if (this.svgChanges[item][capture]) {
                        // есть ли такое свойство
                        if (capture === 'tag_value') {
                          // и тут в свг заносим значение уже по умолчанию, а не из данных
                          elem.innerHTML = this.svgChanges[item][capture];
                        } else {
                          elem.setAttribute(
                            capture,
                            this.svgChanges[item][capture],
                          );
                        }
                      }
                    }
                  }
                });

                // осталось проверить не удалилось ли какое-то значение из данных вообще,
                // а до этого оно было
                // для этого пробегаемся по всему объекту с изменениями
                Object.keys(this.svgChanges[item]).forEach((change) => {
                  // если в измененном объекте есть значение а в данных его нет
                  if (!Object.keys(captures[item]).includes(change)) {
                    // то значение этого свойства выставим по умолчанию
                    elem.setAttribute(change, this.svgChanges[item][change]);
                  }
                });
              }
            });
            // теперь проверим может какой-то элемент менялся, а тепреь вообще не пришел в данных
            // для этого пробегаемся по всему объекту с изменениями
            Object.keys(this.svgChanges).forEach((change) => {
              // если в измененном объекте есть значение а в данных его нет
              if (!Object.keys(captures).includes(change)) {
                elem = this.$refs.csvg
                  .querySelector('svg')
                  .querySelector(`#${change}`);
                Object.keys(this.svgChanges[change]).forEach((defChange) => {
                  if (defChange === 'tag_value') {
                    elem.innerHTML = this.svgChanges[change][defChange];
                  } else {
                    // то значение этого свойства выставим по умолчанию
                    elem.setAttribute(
                      defChange,
                      this.svgChanges[change][defChange],
                    );
                  }
                });
              }
            });
            // если свг еще не отрисовался
          } else {
            timeOut = setTimeout(tick, 100); // прсото повторяем цикл
          }
          // здесь забайндил this чтобы он был доступен изнутри
        }.bind(this),
        0,
      );
    },
    prepareCapture() {
      const captures = {};
      this.dataRestFrom.forEach((item) => {
        captures[item.id] = item;
      });
      return captures;
    },
    checkTokenInTooltip(text) {
      const { tockens } = this.$store.state[this.idDash];
      let reg = '';
      Object.values(tockens).forEach((item) => {
        if (text.indexOf(item.name) !== -1) {
          reg = new RegExp(`\\$${item.name}\\$`, 'g');
          text = text.replace(reg, item.value);
        }
      });
      return text;
    },
    async setSvg() {
      if (this.file !== '') {
        const formData = new FormData();
        formData.append('file', this.file);

        const response = await this.$store.dispatch('setSvg', formData);
        try {
          if (JSON.parse(response).status === 'ok') {
            this.answerColor = this.color.controls;
            this.answer = 'Изображение успешно загружено';
          }
        } catch (err) {
          this.answerColor = this.color.controlsActive;
          this.answer = 'Изображение загрузить не удалось';
        }
      } else {
        this.answerColor = this.color.controlsActive;
        this.answer = 'Выберите изображение';
      }
      this.answerShow = true;
      setTimeout(() => {
        this.answerShow = false;
      }, 2000);
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
    setClick(token, item) {
      const { tockens } = this.$store.state[this.idDash];
      let tocken = {};
      const id = this.$refs.tooltip.getAttribute('data-id');

      Object.keys(tockens).forEach((i) => {
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        };

        if (tockens[i].elem === this.id && tockens[i].action === 'click') {
          if (item === 'object') {
            this.$store.commit('setTocken', {
              token: tocken,
              idDash: this.idDash,
              value: token,
              store: this.$store,
            });
          } else if (tockens[i].capture === token) {
            this.$store.commit('setTocken', {
              token: tocken,
              idDash: this.idDash,
              value: id,
              store: this.$store,
            });
          }
        }
      });

      if (item === 'object') {
        const events = this.getEvents({
          event: 'onclick',
          partelement: 'empty',
        });

        if (events.length !== 0) {
          events.forEach((event) => {
            if (event.action === 'set') {
              this.$store.commit('letEventSet', {
                events,
                idDash: this.idDash,
              });
            } else if (event.action === 'go') {
              this.$store.commit('letEventGo', {
                event,
                idDash: this.idDash,
                route: this.$router,
                store: this.$store,
              });
            }
          });
        }
      }
    },
    setOver(token) {
      const { tockens } = this.$store.state[this.idDash];
      let tocken = {};

      Object.keys(tockens).forEach((i) => {
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        };
        if (tockens[i].elem === this.id && tockens[i].action === 'mouseover') {
          this.$store.commit('setTocken', {
            token: tocken,
            idDash: this.idDash,
            value: token,
            store: this.$store,
          });
        }
      });
    },
    setLink(direction) {
      const context = this.$refs.link.getContext('2d');
      context.clearRect(0, 0, this.$refs.link.width, this.$refs.link.height);
      context.beginPath();
      switch (direction) {
        case 'normal':
          context.moveTo(0, 50);
          context.lineTo(20, 0);
          context.lineTo(30, 0);
          break;
        case 'right':
          context.moveTo(0, 0);
          context.lineTo(10, 0);
          context.lineTo(30, 50);
          break;
        case 'top-right':
          context.moveTo(0, 50);
          context.lineTo(10, 50);
          context.lineTo(30, 0);
          break;
        case 'top-left':
          context.moveTo(0, 0);
          context.lineTo(20, 50);
          context.lineTo(30, 50);
          break;
        default:
          break;
      }
      context.strokeStyle = this.color.text;
      context.stroke();
      context.lineWidth = 1;
    },
    positionTooltip(event) {
      const id = event.target.getAttribute('id');
      let token = '';
      const tooltipSize = this.$refs.tooltip.getBoundingClientRect();
      let tooltipLeft = event.offsetX + 40;
      let tooltipTop = event.offsetY - 50;

      const linkBlockSize = this.$refs.link.parentElement.getBoundingClientRect();
      let linkLeft = event.offsetX + 10;
      let linkTop = event.offsetY - 50;
      const csvgSize = this.$refs.csvg.getBoundingClientRect();
      let direction = 'normal';

      if (id && id.indexOf('overlay') !== -1) {
        [token] = id.split('overlay_');
        this.$refs.tooltip.setAttribute('data-id', token);

        if (this.tooltipOptions === false) {
          this.idTooltip = token;
        }

        // выходит справа
        if (event.offsetX + 40 + tooltipSize.width > csvgSize.width) {
          tooltipLeft = event.offsetX - 40 - tooltipSize.width;
          linkLeft = event.offsetX - 10 - linkBlockSize.width;
          direction = 'right';
        }

        // выходит сверху

        if (event.offsetY - 50 < 0) {
          tooltipTop = event.offsetY + 50;
          linkTop = event.offsetY;
          if (direction === 'right') {
            direction = 'top-right';
          } else {
            direction = 'top-left';
          }
        }

        // выходи снизу

        if (event.offsetY - 50 + tooltipSize.height > csvgSize.height) {
          tooltipTop = event.offsetY - 50 - tooltipSize.height;
        }

        this.$refs.tooltip.style.top = `${tooltipTop}px`;
        this.$refs.tooltip.style.left = `${tooltipLeft}px`;
        this.$refs.link.parentElement.style.top = `${linkTop}px`;
        this.$refs.link.parentElement.style.left = `${linkLeft}px`;

        this.linkCanvasShow = true;
        this.tooltipShow = true;

        this.setOver(token);
        this.setLink(direction);
      }
    },
    clickSvg(event) {
      let token = '';
      const id = event.target.getAttribute('id');
      if (id && id.indexOf('overlay') !== -1) {
        [token] = id.split('overlay_');
        this.setClick(token, 'object');
      }
    },

    mouseoutSvg(event) {
      if (this.timeout) clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        const id = event.target.getAttribute('id');
        if (id && id.indexOf('overlay') !== -1 && !this.tooltipPress) {
          this.tooltipShow = false;
          this.linkCanvasShow = false;
        }
      }, 1000);
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashCSvg.sass';
</style>
