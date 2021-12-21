<template>
  <div v-if="optionsData.onButton">
    <div 
      class="name" 
      :class="{textDecoration:underline}"
      :style="{color:optionsData.colorText,height:`${height}px`,fontSize:`${fontSize}px`,lineHeight:`${height-dataMode}px`,background:optionsData.background}"
      @click="updateSearches">
        Подтвердить
    </div>
  </div>
  <div v-else
    ref="buttonEl"
    class="dash-button" 
    :options="options" 
    style="padding: 0" 
    @click="setClick"
  >
    <div 
      class="name" 
      :class="{textDecoration:underline}"
      :style="{color:optionsData.colorText,height:`${height}px`,fontSize:`${fontSize}px`,lineHeight:`${height-dataMode}px`,background:optionsData.background}"
    >
      {{ optionsData.name }}
      <!-- <div 
        v-if="underline"
        class="underline" 
        :style="{background:optionsData.colorText, width: `${underlineWidth}%`}"
      /> -->
    </div>
  </div>
</template>




<script>


export default {
  props: {  // переменные полученные от родителя
    idFrom: null,  // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда 
    colorFrom: null,  // цветовые переменные
    widthFrom: null, // ширина родительского компонента
    heightFrom: null, // выоста родительского компонента
    dataModeFrom: null,
  },
  data () {
    return {
      actions: [
        {name: 'click',
          capture: ['inverse']
        },
      ],
      optionsData: {
        'name': '',
        'background': '',
        'colorText': '',
        'onButton': false
      }, 
      underline: false,
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
    height: function() {
      return this.heightFrom
    },
    dataMode: function() {
      if (this.dataModeFrom) {
        return 35
      } else {
        return 0
      }
    },
    options: function() {
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.id});
      if (options.color) {
        this.optionsData.colorText = options.color;
      } else {
        this.optionsData.colorText = this.color.text;
      }
      if (options.backgroundcolor) {
        this.optionsData.background = options.backgroundcolor;
      } else {
        this.optionsData.background = 'transparent';
      }
      if (options.name) {
        this.optionsData.name = options.name;
      } else {
        this.optionsData.name = '';
      }
      this.underline = options.underline;
      this.optionsData.onButton = options?.onButton
      return true
    },
    fontSize: function() {
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.id});
      if(options.fontSize){
        return options.fontSize.split('px')[0]
      } else {
        return '30'
      }
    },
    underlineWidth: function() {
      let width = 70;
      if (this.fontSize > 30) {
        width = 90;
      } else if (this.fontSize > 20) {
        width = 70;
      } else if (this.fontSize > 10) {
        width = 50;
      } else {
        width = 30;
      }
      return width
    },
  },  
  methods: {
    updateSearches() {
      this.$store.commit("updateManualTokens", {idDash: this.idDash});
    },
    actionOpen: function(targetLink, header ,widthPersent, heightPersent) {
      //размер нового окна
      let _width = screen.width*widthPersent;
      let _height = screen.height*heightPersent;

      //устанавливаем положение нового окна.
      let _left = (screen.width - screen.width*widthPersent) / 2;
      let _top = (screen.height - screen.height*heightPersent) / 3;
      
      //адрес перехода
      let _link =`${window.location.origin}/dashboards/${targetLink}${header==='false'|| header==='0' ?'?header=false':''}`
      window.open(_link, '', `width=${_width}, height=${_height}, top=${_top}, left=${_left}`);
    },
    createReport: function(item,type) {
      this.getData(item.sid,item.file,type);
    },
    exportSearch: function(item,type) {
      item.searches.forEach( sid => {
        this.getData(sid,'',type);
      })
      
    },
    setClick: function() {

      let tockens = this.$store.getters.getTockens(this.idDash);
      let tocken = {};
      let value = false;

      Object.keys(tockens).forEach( i =>{
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        }
        if (tockens[i].elem == this.id && tockens[i].action == 'click' && tockens[i].capture == 'inverse') {

          switch (tockens[i].value) {
          case '':
            value = true;
            break
          case true:
            value = false;
            break
          case false:
            value = true;
            break
          }
          
          this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: value, store: this.$store });
        } 
      })


      let events = this.$store.getters.getEvents({idDash: this.idDash, event: 'onclick', element: this.id, partelement: 'empty'});
      if (events.length != 0) {
        events.forEach( item => {
          if(item.action == 'set'){
            this.$store.commit('letEventSet', {events: events, idDash: this.idDash,  });
          } else if (item.action == 'go') {
            this.$store.commit('letEventGo', {event: item, idDash: this.idDash, route: this.$router, store: this.$store });
          } else if (item.action.toLowerCase() == 'open'){//если экшен open
            this.actionOpen(item.target.toLowerCase(), item.header, item.widthPersent, item.heightPersent);
          }  else if (item.action.toLowerCase() == 'changeReport'.toLowerCase()){//если экшен open
            this.createReport(item,'report');
          } else if (item.action.toLowerCase() == 'exportSearch'.toLowerCase()){//если экшен open
            this.exportSearch(item,'search');
          }
        })
      }
    }, 
    downloadFile: function(fileLink) {
      let namefile = fileLink.split('/')[2];
      let url = `${window.location.protocol}//${window.location.host}/${fileLink}`;
      let link = this.$refs.buttonEl.parentElement.appendChild(document.createElement("a")); // создаем ссылку
      link.setAttribute('href', url); // указываем ссылке что надо скачать наш файл csv
      link.setAttribute("download", namefile); // указываем имя файла 
      link.click(); // жмем на скачку
      link.remove(); // удаляем ссылку 
    },
    getPaper: async function(file,data) {
      this.$emit('setLoading',true);
      let formData = new FormData();
      formData.append('file', file);
      formData.append('data', JSON.stringify(data));
      let result = await this.$store.getters.getPaper(formData);
      try {
        if (result.status == 'success') {
          this.$emit('setLoading',false);
          this.downloadFile(result.file);

        } else {
          return false
        }

      } catch (error) {
        //this.message(`Ошибка: ${error}`);
      }

    },
    getSearch: function(search,sid) {
      let csvContent = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,"; // задаем кодировку csv файла
      let keys = Object.keys(search[0]); // получаем ключи для заголовков столбцов
      csvContent += encodeURIComponent(keys.join(',') + "\n"); // добавляем ключи в файл
      csvContent += encodeURIComponent(search.map( item =>  Object.values(item).join(",")).join("\n")); // добовляем все значения по ключам в файл
      let link = this.$refs.buttonEl.parentElement.appendChild(document.createElement("a")); // создаем ссылку
      link.setAttribute('href',csvContent); // указываем ссылке что надо скачать наш файл csv
      link.setAttribute("download", `${this.idDash}-${sid}.csv`); // указываем имя файла 
      link.click(); // жмем на скачку
      link.remove(); // удаляем ссылку 
    }, 
    getData: function(sid,file,type) {


      let blob = new Blob([`onmessage=${this.getDataFromDb().toString()}`], { type: "text/javascript" }); // создаем blob объект чтобы с его помощью использовать функцию для web worker

      let blobURL = window.URL.createObjectURL(blob); // создаем ссылку из нашего blob ресурса

      let worker = new Worker(blobURL); // создаем новый worker и передаем ссылку на наш blob объект


      worker.onmessage = function(event) { // при успешном выполнении функции что передали в blob изначально сработает этот код
        if (event.data.length != 0) { 
          //this.data = event.data;
          if (type == 'report') {
            this.getPaper(file,event.data);
          } else {
            this.getSearch(event.data,sid)
          }
          
        } else {
          // this.errorMsg = "Получить данные для отчета не удалось.";
          // this.showError = true;
        }

        worker.terminate();

      }.bind(this);

      worker.postMessage(`${this.idDash}-${sid}`);   // запускаем воркер на выполнение


    },
    getDataFromDb: function() {
      return function(event)  {
        let db = null;

        let searchSid = event.data;

        let request = indexedDB.open("EVA",1);  

        request.onerror = function(event) {
          console.log("error: ",event);
        };

        request.onupgradeneeded = event => {
          console.log('create');
          db = event.target.result;
          if (!db.objectStoreNames.contains('searches')) { // if there's no "books" store
            db.createObjectStore('searches'); // create it
          }

          request.onsuccess = event => {
            db = request.result;
            console.log("successEvent: " + db);
          };
        }

        request.onsuccess =  event => {

          db = request.result;

          let transaction = db.transaction("searches"); // (1)

          // получить хранилище объектов для работы с ним
          let searches = transaction.objectStore("searches"); // (2)


          let query = searches.get(String(searchSid)); // (3) return store.get('Ire Aderinokun');


          query.onsuccess = event => { // (4)
            if (query.result) {
              self.postMessage(query.result);  // сообщение которое будет передаваться как результат выполнения функции
            } else {
              self.postMessage([]);  // сообщение которое будет передаваться как результат выполнения функции
            }
          };

          query.onerror = function() {
            console.log("Ошибка", query.error);
          };
    

        };   


      }
    },
  },
  mounted() {
    this.$emit('hideDS',this.id);
    this.$emit('hideLoading');
    this.$store.commit('setActions', {actions: this.actions, idDash: this.idDash, id: this.id });
  } 
}


</script>

<style lang="scss" > 
  
    @import '../../sass/dashButton.sass'

   
</style>