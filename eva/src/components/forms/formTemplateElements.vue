<template >
    <div class="block-of-elements" ref="elementBlock"  >
        <div class="element-block" v-if="editable=='true'" >
            <v-textarea  v-if="visionOpt.text" color="#333" outlined ref="textArea" placeholder="Текстовое поле" @blur="setValue"   :rows="heightFrom" :height="heightFrom*50" v-model="value"   hide-details></v-textarea>
            <v-select  :items="selectElems" v-if="visionOpt.select" color="#333"  v-model="value" @change="setValue" hide-details  outlined  ></v-select>
            <div class="number-block" v-if="visionOpt.number" >
                <v-text-field  class="number" color="#333" outlined   v-model="value" @blur="checkNumber" hide-details></v-text-field>
                <div class="warning-number-block" :class="{showWarning:showWarning}">Только числовое значение</div>
            </div>
                <!-- <v-radio-group   :mandatory="true" v-if="visionOpt.choose" name="radio"  v-model="value"> 
                    <v-radio    class="radiobtn" color="teal"   ></v-radio>
                </v-radio-group> -->
                <!-- <v-switch :v-model="value" color="teal" class="form-switch"  :data-switch="switchbox" :data-id="idFrom" v-if="visionOpt.choose" @change="checkSwitch()"></v-switch> -->
                <!-- <v-checkbox  v-model="value" color="teal" :data-checkbox="checkbox" v-if="visionOpt.choose" @update="checkRadio"></v-checkbox> -->
            <div class="radiobtn-block" v-if="visionOpt.choose" :name="radioname" :data-radious="radios" :data-id="idFrom" :class="{radioActive:value}" @click="checkRadio">
                    <div class="radiobtn-circle"></div>
            </div>  
            <!-- <input type="radio" v-if="visionOpt.choose" name="radio" color="teal" class="radiobtn"  :value="value" v-model="value" > -->
        </div>
        <div class="element-block-not-editable"    v-if="editable=='false'" >
             <div class="radiobtn-block" v-if="visionOpt.choose"   :class="{radioActive:value}">
                    <div class="radiobtn-circle"></div>
            </div>  
            <div class="just-text" v-if="!visionOpt.choose" >{{value}}</div> 
        </div>
    </div>
  
</template>


<script>


 
export default {
    props: {
        nameFrom : null,
        idFrom: null,
        nameFormFrom: null,
        radiosFrom: null,
        editable: null,
        heightFrom: null,
    },
    data () {
        return {
           visionOpt: {
               text: false,
               select: false,
               choose: false,
               number: false,
           },
           selectElems: [],
           value: '',
           showWarning: false,
           radioname: '',
           tooltip: null
        } 
    },
     computed: {  // осоновные параметры, которые чатсо меняются и которы следует отслеживать
          radios: function() {
              this.value = this.radiosFrom[this.idFrom];
              this.setValue();
              return this.radiosFrom[this.idFrom]
          },
     },  
     methods: {
         setValue: function() {
            let content = {id:this.idFrom, value: this.value };
            this.$emit("setValue",content);
         },
         checkNumber: function() {
             if (!Number(this.value)) {
                 this.showWarning = true;
                 setTimeout( () => {
                     this.showWarning = false; 
                 },2000)
             } else {
                 this.setValue();
             }
         },
         checkRadio: function() {
            //this.value == true ? this.value = false : this.value = true;
           // if (this.value && this.radioname != this.idFrom){
                this.$emit('checkSwitch',{id:this.idFrom, name: this.radioname});
            // } else {
            //     this.setValue();
            // }
         },
        //  toolTipShow: function() {
          
        //     let tooltip = null;
        //     let elem = this.$refs.elementBlock.querySelector('.element-block-not-editable');

        //     if (elem.parentElement.classList.contains('toobig')){
        //          // console.log(event.target.getBoundingClientRect().left);
        //          // console.log(event.clientX-30);
        //          // this.tooltip.style=`left: ${event.target.getBoundingClientRect().left-30}px; top: ${event.target.getBoundingClientRect().top}px; opacity: 1; visibility: visible;`;
        // //         //this.$emit('showTooltip',event);
        // //         console.log(elem);
        //      console.log('create');
        //      tooltip = elem.cloneNode(true); // дальше мы создаем как бы клон нашего элемнета 
        //      tooltip.classList.add('tooltip'); // даем ему класс
        //      tooltip.style.opacity="1";
        //      elem.parentElement.parentElement.parentElement.appendChild(tooltip);  // и его уже добовляем в body
        //      tooltip.parentElement.parentElement.style['z-index'] = "2";
        //      this.tooltip = tooltip;
             
             
        // //    console.log(tooltip);
        //     }

        //       if (tooltip != null) {
        //             tooltip.addEventListener("mouseout", () => {
        //                 console.log("delete");
        //                 tooltip.remove();
        //             });
        //       }

        // },


     },
    
     mounted() {
         let element = this.$store.form.getters.getFormLocal;
         let content = this.$store.form.getters.getContent(this.idFrom);
         if (content != 'empty') {
             if (content == 'True') {
                 content = true;
             }
             if (content == 'False') {
                 content = false;
             }  
             if (content == 'None') {
                 content = '';
             }
             this.value = content;
         }
          switch (this.nameFrom) {
              case 'Текстовое поле':
                  this.visionOpt.text = true;
              break
              case 'Выпадающий список':
                  this.visionOpt.select = true;
                  if (element[this.idFrom].options) {
                      this.selectElems = element[this.idFrom].options.select.split(';');
                  }
              break
              case 'Выбор одного варианта':
                  this.visionOpt.choose = true;
                    if (element[this.idFrom].options) {
                      if (element[this.idFrom].options.nameRadio != ''){
                         this.radioname = element[this.idFrom].options.nameRadio;
                      } else {
                          this.radioname = 'empty';
                      }
                    } else {
                        this.radioname = 'empty';
                    }
                //   if (element.options) {
                //       this.selectElems = element.options.select.split(';');
                //   }
              break
              case 'Числовое поле':
                  this.visionOpt.number = true;
                //   if (element.options) {
                //       this.selectElems = element.options.select.split(';');
                //   }
              break
          }
        if (this.editable == 'false') {
            setTimeout( ()=> {
                let blockell = this.$refs.elementBlock;
                let elemBlock = blockell.querySelector('.element-block-not-editable');
                let newValue = '';
            // console.log(this.$refs.blockElem.parentElement.getBoundingClientRect().height);
            
                if (elemBlock.getBoundingClientRect().height > blockell.getBoundingClientRect().height) {
                        elemBlock.style= "position:absolute;top:5px;left:5px";
                        blockell.classList.add('toobig');  
                    }
            },100)
       }
          
             
     },

}


</script>

<style lang="scss" > 

    // настройки стилей в файле formEdit.sass

</style>