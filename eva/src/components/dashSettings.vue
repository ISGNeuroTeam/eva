<template>
  <v-navigation-drawer
    v-model="gearShow"
    fixed
    width="300"
    left
    class="left-dash-setting"
    :color="colorFrom.text"
    :style="{background: colorFrom.backElement, borderTop:`2px solid ${colorFrom.panel}`,borderBottom:`2px solid ${colorFrom.panel}`}"
    :permissions="permissions"
  >
    <div
      class="line-setting"
      :style="{background: colorFrom.panel}"
    />
    <div class="setting">
      <div class="labelSetting" :style="{color: colorFrom.text}">
        Режим редактирования
      </div>
      <v-switch  
        v-model="mode" 
        class="switch" 
        :color="colorFrom.controls" 
        :style="{color:colorFrom.text}" 
        :label="russianLabel(mode)" 
      />
      <div 
        class="divider-setting" 
        :style="{background: colorFrom.controls}"
      />
    </div>
    <div class="setting">
      <div class="labelSetting" :style="{color: colorFrom.text}">
        Размер сетки
      </div>
      <div class="sizeGrid">
        <v-text-field 
          v-model="sizeGrid.vert" 
          placeholder="24"  
          label="Вертикально"
          :color="colorFrom.text" 
          :style="{color:colorFrom.text, background: 'transparent', borderColor: colorFrom.text}" 
          outlined 
          class="sizeGridItem"  
          hide-details
          @blur="sendSizeGrid"
          @keyup.enter="sendSizeGrid"
        />
        <v-text-field 
          v-model="sizeGrid.hor" 
          placeholder="24"  
          label="Горизонтально"
          :color="colorFrom.text" 
          :style="{color:colorFrom.text, background: 'transparent', borderColor: colorFrom.text}" 
          outlined 
          class="sizeGridItem"  
          hide-details
          @blur="sendSizeGrid"
          @keyup.enter="sendSizeGrid"
        />
      </div>
      <div 
        class="divider-setting" 
        :style="{background: colorFrom.controls}"
      />
    </div>
    <div class="setting">
      <div class="labelSetting" :style="{color: colorFrom.text}">
        Перемещать/ изменять размер компонента
      </div>
      <v-switch  
        v-model="dragresable" 
        class="switch" 
        :color="colorFrom.controls" 
        :style="{color:colorFrom.text,}" 
        :label="russianLabel(dragresable)" 
      />
      <div 
        class="divider-setting" 
        :style="{background: colorFrom.controls}"
      />
    </div>
    
    <div class="setting">
      <div class="labelSetting" :style="{color: colorFrom.text}">
        Показывать сетку
      </div>
      <v-switch  
        v-model="gridShow" 
        class="switch" 
        :color="colorFrom.controls" 
        :style="{color:colorFrom.text,}" 
        :label="russianLabel(gridShow)"
      />
    </div>
  </v-navigation-drawer>
</template>


<script>


export default {
  props: {
    colorFrom: null,
    gearFrom: null,
    idDashFrom: null,
    permissionsFrom: null
  },
  data () {
    return {
      gearShow: false,
      settings: {},
      mode: true,
      sizeGrid: {
        vert: '32',
        hor: '18'
      },
      dragresable: true,
      gridShow: true
    } 
  },
  computed: {
    active: function() {  
      return this.showFrom 
    },
    permissions: function() {
      if (!this.permissionsFrom.includes('admin_all') && !this.permissionsFrom.includes('editdash')) {
        this.mode = false;
        this.dragresable = false;
        this.gridShow = false;   
      } else {
        this.mode = true;
        this.dragresable = true;
        this.gridShow = true;  
      }
      return true
    } 
  },  
  watch: {
    gearFrom: function (gear) {
      gear ? this.gearShow = true : this.gearShow = false;

    },
    mode: function() {
      this.$emit("changeMode");
    },
    dragresable: function() {
      this.$store.commit('setDragResize', {id: this.idDashFrom,item: String(this.dragresable)});
    },
    gridShow: function() {
      this.$store.commit('setGridShow', {id: this.idDashFrom,item: String(this.gridShow)});
    },
  },
  methods: {
    sendSizeGrid: function() {
      this.$store.commit('setSizeGrid', {id: this.idDashFrom,grid: JSON.parse(JSON.stringify(this.sizeGrid))});
    },
    russianLabel(value){
      if(value === true){
        return "да"
      } else {
        return "нет"
      }
    }
  },
  mounted() {
    let grid = this.$store.getters.getSizeGrid(this.idDashFrom);
    this.sizeGrid.vert = grid.vert;
    this.sizeGrid.hor = grid.hor;
    if (!this.permissionsFrom.includes('admin_all') && !this.permissionsFrom.includes('editdash')) {
      this.dragresable = false;
    } else {
      let dragRes = this.$store.getters.getDragResize(this.idDashFrom);
      dragRes == 'true' ? dragRes = true : dragRes = false;
      this.dragresable =  dragRes;
    }
    
  } 
}


</script>

<style lang="sass" > 
  
    @import '../sass/dashSettings.sass'

   
</style>