<template>
  <div 
    ref="svgBlock"
    class="dash-csvg" 
    tabindex="0"
  >
    <div 
      v-show="noMsg==1"
      ref="csvg"
      class="csvg-block"
      @mouseover="positionTooltip"
      @click="clickSvg"
      @mouseout="mouseoutSvg" 
      :data-change="change" 
      :style="{width:isFullScreen?'100%':`${widthFrom-40}px`,height:isFullScreen?'100%':`${heightFrom-otstupBottom}px`}" 
      v-html="svg"
     
    />
    <div 
      v-show="noMsg==0"
      class="file-input" 
    >
      <v-file-input 
        :prepend-icon="image"
        :style="{color: color.text,fill: color.text}" 
        :color="color.controls" 
        class="file-itself" 
        hide-details  
        outlined 
        label="Загрузить изображение"
        @change="file=$event"
      />
      <button 
        class="file-btn" 
        :style="{color: 'white', background: color.controls}" 
        @click="setSvg"
      >
        {{ sendMsg }}
      </button>
      <div 
        class="answer-block" 
        :class="{answerShow:answerShow}" 
        :style="{color:answerColor}"
      >
        {{ answer }}
      </div>
    </div>
    <div 
      v-show="noMsg==2"
      class="errormsg"
    >
      {{ msgText }}
    </div>
    <v-icon
      v-if="dataModeFrom" 
      v-show="noMsg!=2" 
      class="icon file" 
      :color="colorMsg" 
      @click="noMsg==0?noMsg=1:noMsg=0"
    >
      {{ upload }}
    </v-icon>
    <div 
      ref="tooltip" 
      class="tooltip"
      :class="{tooltipShow:tooltipShow}" 
      :style="{backgroundColor:color.backElement, borderColor:color.text}"
    >
      <div 
        v-show="tooltipFrom.texts.length == 0 && tooltipFrom.links.length == 0 && tooltipFrom.buttons.length == 0"
        class="id-tooltip"
      >
        {{ idTooltip }}
      </div>
      <div class="text-block-tooltip">
        <p 
          v-for="i in tooltipFrom.texts.length" 
          :key="i+'texts'"
        >
          {{ checkTokenInTooltip(tooltipFrom.texts[i-1]) }}
        </p>
      </div>
      <div 
        v-show="tooltipFrom.links.length != 0"
        class="white-space"
      />
      <div class="link-block-tooltip">
        <a 
          v-for="i in tooltipFrom.links.length" 
          :key="i+'links'"
          :href="checkTokenInTooltip(tooltipFrom.links[i-1].url)" 
          target="_blank"
        >
          {{ tooltipFrom.links[i-1].name }}
          <span />
        </a>
      </div>
      <div 
        v-show="tooltipFrom.buttons.length != 0"
        class="white-space"
      />
      <div 
        class="button-block-tooltip" 
        :data-options="String(options)"
      >
        <button 
          v-for="i in tooltipFrom.buttons.length" 
          :key="i+'buttons'" 
          :data-id="tooltipFrom.buttons[i-1].id" 
          class="tooltip-button" 
          :style="{color: 'white', background: color.controls}"
          @click="setClick(tooltipFrom.buttons[i-1].id,'btn')" 
        >
          {{ tooltipFrom.buttons[i-1].name }}
        </button>
      </div>
    </div> 
    <div 
      class="link-canvas"  
      :class="{linkCanvasShow:linkCanvasShow}"
    >
      <canvas ref="link" />
    </div>
  </div>
</template> 


<script>

import {    mdiFileImageOutline, mdiUpload  } from '@mdi/js'


export default {
  props: {  // переменные полученные от родителя
    idFrom: null,  // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда 
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null,  // цветовые переменные
    widthFrom: null, // ширина родительского компонента
    heightFrom: null, // выоста родительского компонента
    tooltipFrom: null, // объект тултипа
    dataModeFrom: null, // выключена ли шапка или включена
    activeElemFrom: null,
    dataReport: null,
    isFullScreen:null,
  },
  data () {
    return {
      actions: [
        {
          name: 'click',
          capture: []
        },
        {
          name: 'mouseover',
          capture: []
        },
      ],
      captures: {},
      noMsg: 1,
      msgText: 'Нет данных для отображения',
      sendMsg: 'Отправить изображение',
      image: mdiFileImageOutline ,
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
    } 
  },
  computed: {  // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    id: function() { 
      return this.idFrom
    },
    idDash: function() { 
      return this.idDashFrom
    },
    color: function() {
      return this.colorFrom
    },
    colorMsg: function() {
      if (this.noMsg == 1) {
        return this.color.controls
      } else {
        return this.color.controlsActive
      }
    },
    options: function() {
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.id});
      let idsButton = this.tooltipFrom.buttons.map( item => {
        return item.id
      })
      
      this.captures = idsButton;

      return options.change
    },
    change: function() {
      if (this.dataRestFrom && Object.keys(this.dataRestFrom).length != 0  && this.dataRestFrom[0].svg_filename && this.dataRestFrom[0].svg_filename != '') {
        if (this.dataReport) {
          
          if (this.activeElemFrom == this.id) {
            this.dataFrom = this.dataRestFrom[0];
            this.getSvg(this.dataRestFrom[0].svg_filename);
            this.$store.commit('setActions', {actions: this.actions, idDash: this.idDash, id: this.id }); 
          } else {
            this.svg = '';
          }
        } else {
          this.dataFrom = this.dataRestFrom[0];
          this.getSvg(this.dataRestFrom[0].svg_filename);
          this.$store.commit('setActions', {actions: this.actions, idDash: this.idDash, id: this.id }); 
        }
        
      }
      if (screen.width <= 1600) {
        this.otstupBottom = 30;
      }
      return true  
    },

  },  
  watch: { 
    dataModeFrom: function(dataMode) {
      if (dataMode) {
        this.otstupBottom = 45;
        if (screen.width <= 1600) {
          this.otstupBottom = 30;
        }
      } else {
        this.otstupBottom = 10; 
      }
    },
    widthFrom: function() {
      this.checkSize();
    },
    heightFrom: function() {
      this.checkSize();
    },
    captures: function (captures) {
      this.actions[0].capture =  captures;
      this.$store.commit('setActions', {actions: this.actions, idDash: this.idDash, id: this.id });
    },
  },
  methods: {
    getSvg: async function(svg) {
      this.$emit('setLoading',true);
      let response = await  this.$store.getters.getSvg(svg);
      if (response != '') {
        console.log('create svg')
        this.$emit('setLoading',false);
        this.svg = response;
        this.noMsg = 1;
        this.checkSize();
        this.checkCapture();
        
      } else {
        this.msgText = "Изображение получить не удалось";
        this.noMsg = 2;
        this.$emit('setLoading',false);
      }
    },
    checkSize: function() {this.$refs.csvg
      if (this.svg != 'Нет данных для отображения' && this.svg != '') {
        let timeOut = setTimeout( function tick() {
          if (this.$refs.csvg.querySelector('svg') != null ) {
            clearTimeout(timeOut);
            let svgElem = this.$refs.csvg.querySelector('svg');
            svgElem.setAttribute("width", this.widthFrom-40);
            svgElem.setAttribute("height", this.heightFrom-this.otstupBottom);
          }  else {
            timeOut = setTimeout(tick.bind(this), 1000); 
          }
        }.bind(this), 0);   
          
      }
        
    },
    checkCapture: async function() {
      let captures = this.prepareCapture();  // получаем объект свойства элементов из данных 
      let elem = '';
      let timeOut = setTimeout( function tick() {  // запускаем цикл повторений, ибо нам надо удостовериться что свг уже отрисовался

        if ( this.$refs.csvg.querySelector('svg') != null ) { // и если уже отрисовался
          clearTimeout(timeOut);  // прекращаем цикл

          Object.keys(captures).forEach( item => {  // прбегаемся по  элементам
            elem = this.$refs.csvg.querySelector('svg').querySelector(`#${item}`); // получаем элемент для которого нужно проверить свойства
                
            if(elem) { // если данный элемнет вообще существует
              Object.keys(captures[item]).forEach( capture => { // пробегаемя по его свойствам
                        
                if (capture != 'id' && capture != 'svg_filename') { // если свойство не id и не название файла, потмоу что они нам не интересны
                  if (captures[item][capture] != null) { // так же проверяем что свойство не равно null (не пустое)
                    if (!this.svgChanges[item]) { // если в специальном объекте с только изменившимся свойствами нет еще этого элемента
                      this.svgChanges[item] = {}; // создаем его
                    }
                    if (!this.svgChanges[item][capture]) {  // если у созданного элемнета нет еще такого свойства ()то есть впервые оно изменилось 
                      if (capture == 'tag_value') { // то сперва проверяем текст ли это
                        this.svgChanges[item][capture] = elem.innerHTML; // и если текст то заносим в наш объект с измененными данными
                                                                        // значение которое было изначально
                        elem.innerHTML = captures[item][capture]; // и потом уже в самой свг обновляем значение на то, что пришло из данных
                      } else { // а если не еткст а другие свойства
                        this.svgChanges[item][capture] = elem.getAttribute(capture); // делаем тоже самое, заносим значение по умолчанию
                        elem.setAttribute(capture, captures[item][capture]);  // а в самой свг меняем не значение из данных
                      }  
                    } else { // если значенеи по умолчанию уже занесено у нас в объект с изменениями
                      if (capture == 'tag_value') {  // то делаем тоже самое, толко не трогаем по умолчанию, меняем лишь значение в самой свг
                        elem.innerHTML = captures[item][capture];
                      } else {
                        elem.setAttribute(capture, captures[item][capture]);
                      }  
                    }
                  } else { // если значение пришло пустое
                    if (!this.svgChanges[item]) {  // то все ранво првоеряем есть ли такой элемент в нашем объекте с изменениями
                      this.svgChanges[item] = {};
                    }
                    if (this.svgChanges[item][capture]) {  // есть ли такое свойство
                      if (capture == 'tag_value') {  // и тут в свг заносим значение уже по умолчанию, а не из данных
                        elem.innerHTML = this.svgChanges[item][capture];
                      } else {
                        elem.setAttribute(capture, this.svgChanges[item][capture]);
                      }  
                    }
                  }
                }   
              });

              // осталось проверить не удалилось ли какое-то значение из данных вообще, а до этого оно было       
              Object.keys(this.svgChanges[item]).forEach( change => {   // для этого пробегаемся по всему объекту с изменениями
                if (!Object.keys(captures[item]).includes(change)) { // если в измененном объекте есть значение а в данных его нет
                  elem.setAttribute(change, this.svgChanges[item][change]); // то значение этого свойства выставим по умолчанию
                } 
              })
              
            }   
          })
          // теперь проверим может какой-то элемент менялся, а тепреь вообще не пришел в данных
          Object.keys(this.svgChanges).forEach( change => {   // для этого пробегаемся по всему объекту с изменениями
            if (!Object.keys(captures).includes(change)) { // если в измененном объекте есть значение а в данных его нет
              elem = this.$refs.csvg.querySelector('svg').querySelector(`#${change}`);
              Object.keys(this.svgChanges[change]).forEach( defChange => {
                if (defChange == 'tag_value') {
                  elem.innerHTML = this.svgChanges[change][defChange];
                } else {
                  elem.setAttribute(defChange, this.svgChanges[change][defChange]); // то значение этого свойства выставим по умолчанию
                }
              })
            } 
          })
        }  else { // если свг еще не отрисовался
          timeOut = setTimeout(tick, 100);  // прсото повторяем цикл
        }
      }.bind(this), 0); // здесь забайндил this чтобы он был доступен изнутри
    },  
    prepareCapture: function() {
      let captures = {};
      this.dataRestFrom.forEach( item => {
        captures[item.id] = item;
      })
      return captures
    },
    checkTokenInTooltip: function(text) {
      let tockens = this.$store.getters.getTockens(this.idDash);
      let reg = '';
      Object.values(tockens).forEach(item => {
        if (text.indexOf(item.name) != -1) {
          reg = new RegExp( `\\$${item.name}\\$`, "g");
          text = text.replace(reg,item.value);
        } 
      }) 
      return text
    },
    setSvg: async function() {
      if (this.file != '') {
        let formData = new FormData();
        formData.append("file", this.file);
        
        let response = await  this.$store.getters.setSvg(formData); 
        try {

          if(JSON.parse(response).status == 'ok') {
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
      setTimeout( () => {
        this.answerShow = false; 
      },2000)
          
    },
    setClick: function(token,item) {

      let tockens = this.$store.getters.getTockens(this.idDash);
      let tocken = {};
      let id = this.$refs.tooltip.getAttribute('data-id');

      Object.keys(tockens).forEach( i =>{
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        }
            
        if (tockens[i].elem == this.id && tockens[i].action == 'click') {
          if (item == 'object') {
            this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: token, store: this.$store });
          } else {
            if (tockens[i].capture == token) {
              this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: id, store: this.$store });
            }
          }
                
        } 

      })

      if (item == 'object') {
        let events = this.$store.getters.getEvents({idDash: this.idDash, event: 'onclick', element: this.id, partelement: 'empty'});
    
        if (events.length != 0) {
          events.forEach( item => {
            if(item.action == 'set'){
              this.$store.commit('letEventSet', {events: events, idDash: this.idDash,  });
            } else if (item.action == 'go') {

              this.$store.commit('letEventGo', {event: item, idDash: this.idDash, route: this.$router, store: this.$store  });
            }
          }) 
        }
      }
    },
    setOver: function(token) {

      let tockens = this.$store.getters.getTockens(this.idDash);
      let tocken = {};

      Object.keys(tockens).forEach( i =>{
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        }
        if (tockens[i].elem == this.id && tockens[i].action == 'mouseover') {
          this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: token, store: this.$store });
        } 
      })
    },
    setLink: function(direction) {
      let context = this.$refs.link.getContext("2d");
      context.clearRect(0, 0, this.$refs.link.width, this.$refs.link.height);
      context.beginPath();
      switch (direction) {
      case 'normal': 
        context.moveTo(0, 50);
        context.lineTo(20, 0);
        context.lineTo(30, 0);
        break
      case 'right': 
        context.moveTo(0, 0);
        context.lineTo(10, 0);
        context.lineTo(30, 50);
        break
      case 'top-right': 
        context.moveTo(0, 50);
        context.lineTo(10, 50);
        context.lineTo(30, 0);
        break
      case 'top-left': 
        context.moveTo(0, 0);
        context.lineTo(20, 50);
        context.lineTo(30, 50);
        break

      }
      context.strokeStyle = this.color.text;
      context.stroke();
      context.lineWidth = 1;
    },
    positionTooltip(event){
      let id = event.target.getAttribute('id');
      let token = '';
      let tooltipSize = this.$refs.tooltip.getBoundingClientRect();
      let tooltipLeft = event.offsetX + 40;
      let tooltipTop = event.offsetY - 50;
      
      let linkBlockSize = this.$refs.link.parentElement.getBoundingClientRect();
      let linkLeft = event.offsetX + 10;
      let linkTop = event.offsetY - 50;
      let csvgSize = this.$refs.csvg.getBoundingClientRect();
      let direction = 'normal';
           
      if(id && id.indexOf('overlay') !=-1) {
        token = id.split('overlay_')[1];
        this.$refs.tooltip.setAttribute('data-id', token);

        this.tooltipOptions == false ? this.idTooltip = token : false;

        // выходит справа 
        if ((event.offsetX + 40 + tooltipSize.width) > csvgSize.width) {
          tooltipLeft = event.offsetX - 40 - tooltipSize.width;
          linkLeft = event.offsetX - 10 - linkBlockSize.width;
          direction = 'right';
        } 

        // выходит сверху

        if ((event.offsetY - 50) < 0) {
          tooltipTop = event.offsetY + 50;
          linkTop = event.offsetY;
          if (direction == 'right') {
            direction = 'top-right';
          } else {
            direction = 'top-left'; 
          }
                   
        } 

        // выходи снизу

        if ((event.offsetY - 50 + tooltipSize.height) > csvgSize.height) {
          tooltipTop = event.offsetY - 50 - tooltipSize.height;
        }

        this.$refs.tooltip.style.top = `${tooltipTop}px`;
        this.$refs.tooltip.style.left = `${tooltipLeft}px`;
        this.$refs.link.parentElement.style.top =  `${linkTop}px`;
        this.$refs.link.parentElement.style.left = `${linkLeft}px`;

        this.linkCanvasShow = true;
        this.tooltipShow = true;
             

        this.setOver(token);
        this.setLink(direction);
      }
    },
    clickSvg(event){
      let token = '';
      let id = event.target.getAttribute('id');
      if(id && id.indexOf('overlay') !=-1) {
        token = id.split('overlay_')[1];
        this.setClick(token,'object');
      }
    },

    mouseoutSvg(event){
      if (this.timeout) clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        let id = event.target.getAttribute('id');
        if(id && id.indexOf('overlay') !=-1 && !this.tooltipPress) {
          this.tooltipShow = false;
          this.linkCanvasShow = false;
        }
      }, 1000);
      
    } 

  },
  mounted() {
    this.$refs.svgBlock.addEventListener('keydown', event => {
      if(event.key == 'Control') {
        this.tooltipPress = !this.tooltipPress;
        if (!this.tooltipPress) {
          this.tooltipShow = false;
          this.linkCanvasShow = false;
        } else {
          this.tooltipShow = true;
          this.linkCanvasShow = true;
        }
      }
    })

  } 
}


</script>

<style lang="scss" > 
  
    @import '../../sass/dashCSvg.sass'

   
</style>