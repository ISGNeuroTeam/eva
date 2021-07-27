<template >
    <v-app >
        <v-content>
            <div class="form-panel-board">
                <div class="title-name" >EVA Формы</div>
            </div>
            <!--  Основная страница  -->
                <v-container  v-if="!permission" class="main-form-container" >
                    <div class="main-form">
                        <v-card  class="form-block"  @click="openMainRole('admin')">  
                            <v-card-text class="card-text">
                                <p>Администратор</p>
                                <v-icon class="role"  >{{adminRole}}</v-icon>
                            </v-card-text>
                        </v-card>
                         <v-card  class="form-block"  @click="openMainRole('user')">  
                            <v-card-text class="card-text">
                                <p>Пользователь</p>
                                <v-icon class="role"  >{{userRole}}</v-icon>
                            </v-card-text>
                        </v-card>
                    </div>
                </v-container>
            <!--  ---  -->
             

          
           <v-container  class="main-form-container" >
               <v-skeleton-loader  type="image" v-if="loading" height="300" width="100%"></v-skeleton-loader>
                <div class="main-form-forms">
                    <v-card  class="form-block"  @click="openForm(item,permission)" v-for="item in forms" :key="item[0]"> 
                        <v-card-text class="card-text">
                            <p>{{item[1].toUpperCase()}}</p>
                        </v-card-text>
                    </v-card>
                </div>
                <div class="divider" v-if="permission == 'admin'"></div>
                <div class="main-form" v-if="permission == 'admin'">
                     <v-card  class="form-block"  @click="createForm()">  
                        <v-card-text class="card-text">
                            <p>Создать новую форму</p>
                            <v-icon class="plus"  >{{plus}}</v-icon>
                        </v-card-text>
                    </v-card>
                </div>
           </v-container>
           


        </v-content>
        <modal-create-form :modalFrom="modal" @hideForm="createForm"></modal-create-form>
    </v-app>
</template>


<script>

import { mdiPlusCircleOutline, mdiHardHat , mdiHatFedora} from '@mdi/js'

export default {
    data () {
        return {
           plus: mdiPlusCircleOutline,
           adminRole: mdiHardHat ,
           userRole: mdiHatFedora,
           modal: false,
           permissionStatus: '',
           template: true,
           templateName: '',
           forms: [],
           loading: true, 
        } 
    },
     computed: {  // осоновные параметры, которые чатсо меняются и которы следует отслеживать
        permission: function() {    // позволяет понять в режима администратора вошли или пользователя
            return this.$route.params.id
         },
     },  
     methods: {
        getForms: async function() {  // метод который получает список всех шаблонов из базы данных
           let forms = await this.$store.form.getters.getAllTemplates; // получаем список
           this.forms =  forms;  // и заносим его в переменную
           this.loading = false;  // отключаем блок с загрузкой
       },
       createForm: function() {  // открываем модалку с созданием нового шаблона
           this.modal = !this.modal;
       },
       openForm: function(name,permission) {  // открываем существующий шаблон 
           if (permission == 'admin') {  // если открывает администратор
               this.$router.push(`/forms/open?editable=false&id=${name[0]}`);  //  то октрываем сам шаблон для просмотра
           } else {   // если пользователь
               this.$router.push(`/forms/openlist/${name[0]}?name=${name[1]}`);  // то откроется список форм данного шаблона
           }   
       },
    //    openFormUser: function(name){  // 
    //        this.template = false;
    //        this.templateName = name;
    //    },
       openMainRole: function(role) {   // понимаем какой режим нужно отобразить
           this.getForms();  // в любом случае забираем список форм из базы данных
           this.$router.push(`/forms/${role}`);  // и отображаем нужный режим
       }
     },
     mounted() {
         if (this.permission) {  // если страница не главная, а уже выбран какой-то режим
            this.getForms(); // нужно получить список всех форм
         }
     }

}


</script>

<style lang="scss" > 

    @import '../../sass/formMain.sass'

</style>