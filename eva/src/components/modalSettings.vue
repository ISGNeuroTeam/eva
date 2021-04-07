<!-- Модальное окно для настройки дашборда -->

<template>
  <v-dialog  
    v-model="active"  
    width="1140"  
    persistent 
    @keydown="checkEsc($event)"
  > 
    <div class="settings-modal-block">
      <v-card :style="{background:color.backElement}">
        <v-card-text class="headline">
          <div 
            class="settings-title" 
            :style="{color:color.text,borderColor:color.text}"
          >
            Настройки 
            <p>{{ element }}</p> 
          </div>
        </v-card-text>
        <div 
          ref="options" 
          class="options-block" 
        >
          <div class="option-item">
            <div 
              class="name-option main item" 
              :style="{color:color.text, borderBottom: `1px solid ${color.text}`}"
            >
              Название
            </div>
            <div 
              class="discribe-option main item" 
              :style="{color:color.text, borderBottom: `1px solid ${color.text}`}"
            >
              Описание
            </div>
            <div 
              class="status-option main item" 
              :style="{color:color.text, borderBottom: `1px solid ${color.text}`}"
            >
              Статус
            </div>
          </div>
          <div 
            v-if="checkOptions('visible')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}" 
            >
              visible
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Показывает / скрывает элемент
            </div>
            <div class="status-option item">
              <v-switch   
                v-model="options.visible"  
                class="switch" 
                :color="color.controls" 
                :style="{color:color.text}" 
                :label="String(options.visible)" 
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('level')"
            class="option-item"
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}" 
            >
              level
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Установить слой отображения элемента
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.level"
                clearable  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber"  
                hide-details
              />  
            </div>
          </div>
          <div 
            v-if="checkOptions('boxShadow')"
            class="option-item"
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              boxShadow
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Добавляет / удаляет тень
            </div>
            <div class="status-option item">
              <v-switch  
                v-model="options.boxShadow"    
                class="switch" 
                :color="color.controls" 
                :style="{color:color.text,}"
                :label="String(options.boxShadow)" 
              />
            </div>
          </div>
          <!-- start lastResult-->
          <div 
            v-if="checkOptions('lastResult')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}" 
            >
              lastResult
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Вывод предыдущих результатов
            </div>
            <div class="status-option item">
              <v-switch   
                v-model="options.lastResult"  
                class="switch" 
                :color="color.controls" 
                :style="{color:color.text}" 
                :label="String(options.lastResult)" 
              />
            </div>
          </div>
          <!-- end lastResult-->
          <!-- start searchBtn-->
          <div 
            v-if="checkOptions('searchBtn')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}" 
            >
              searchBtn
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Показывать кнопку поиска
            </div>
            <div class="status-option item">
              <v-switch   
                v-model="options.searchBtn"  
                class="switch" 
                :color="color.controls" 
                :style="{color:color.text}" 
                :label="String(options.searchBtn)" 
              />
            </div>
          </div>
          <!-- end searchBtn-->
          <!-- start osmserver-->
          <div 
            v-if="checkOptions('osmserver')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}" 
            >
              osmserver
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Сервер для набора title Пример:
              http://192.168.4.209/osm/{z}/{x}/{y}.png
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.osmserver"   
                clearable  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber"  
                hide-details
              />
            </div>
          </div>
          <!-- end osmserver-->
          <!--start strokeWidth-->
          <div 
            v-if="checkOptions('strokeWidth')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}" 
            >
              strokeWidth
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Толщина линий
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.strokeWidth"   
                clearable  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber"  
                hide-details
              />
            </div>
          </div>
          <!--end strokeWidth-->
          <!--start thememultiline-->
          <div 
            v-if="checkOptions('thememultiline')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}" 
            >
              thememultiline
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Цветовая тема
            </div>
            <div class="status-option item">
              <v-select  
                v-model="options.thememultiline"
                :items="['default','Anna theme']" 
                :color="color.controls" 
                :style="{color:color.text, fill: color.text}"  
                hide-details  
                outlined  
                class="subnumber"
              /> 
            </div>
          </div>
          <!--end thememultiline-->
          <!--start maptheme-->
          <div 
            v-if="checkOptions('maptheme')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}" 
            >
              maptheme
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Цветовая тема
            </div>
            <div class="status-option item">
              <v-select  
                v-model="options.maptheme"
                :items="['default','black']" 
                :color="color.controls" 
                :style="{color:color.text, fill: color.text}"  
                hide-details  
                outlined  
                class="subnumber"
              /> 
            </div>
          </div>
          <!--end maptheme-->
          <div 
            v-if="checkOptions('subnumber')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              subnumber
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Выводит дополнительную надпись под числом
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.subnumber"   
                clearable  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber"  
                hide-details
              />  
            </div>
          </div>
          <div 
            v-if="checkOptions('rowcolor')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              rowcolor
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Выбрать цвет которым подсветится нужная строка
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.rowcolor"  
                clearable  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber"  
                hide-details
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('columncolor')"
            class="option-item"
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              columncolor
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Выбрать цвет которым подсветится нужный столбец
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.columncolor" 
                clearable  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}"
                outlined 
                class="subnumber"  
                hide-details
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('cellcolor')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              cellcolor
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Выбрать цвет которым подсветится нужная ячейка
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.cellcolor" 
                clearable  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber" 
                hide-details
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('color')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              color
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Выбрать цвет значения
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.color" 
                clearable  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber"  
                hide-details
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('backgroundcolor')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              backgroundcolor
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Выбрать цвет фона
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.backgroundcolor"
                clearable  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber"  
                hide-details
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('name')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              name
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Выбрать название кнопки
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.name"  
                clearable  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber" 
                hide-details
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('timeFormat')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              timeFormat
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Выбрать формат даты и времени
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.timeFormat" 
                clearable  
                placeholder="%Y-%m-%d %H:%M:%S"  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('widthTile')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              widthTile
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Введите ширину плитки
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.widthTile" 
                clearable  
                placeholder="100"  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber"  
                hide-details
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('heightTile')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              heightTile
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Введите высоту плитки
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.heightTile"
                clearable  
                placeholder="100"  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber"  
                hide-details
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('fontSize')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              fontSize
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Выбрать размер шрифта
            </div>
            <div class="status-option item">
              <v-text-field 
                v-model="options.fontSize"
                clearable  
                placeholder="30"  
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="subnumber"  
                hide-details
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('underline')"
            class="option-item"
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              underline
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Подчеркивает текст кнопки
            </div>
            <div class="status-option item">
              <v-switch  
                v-model="options.underline"    
                class="switch" 
                :color="color.controls" 
                :style="{color:color.text,}"
                :label="String(options.underline)" 
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('lastDot')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              lastDot
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Показывать последнее значение
            </div>
            <div class="status-option item">
              <v-switch  
                v-model="options.lastDot" 
                class="switch" 
                :color="color.controls" 
                :style="{color:color.text,}"
                :label="String(options.lastDot)" 
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('united')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              united
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Отображать ли все метрики на одной плоскости координат
            </div>
            <div class="status-option item">
              <v-switch  
                v-model="options.united" 
                class="switch" 
                :color="color.controls" 
                :style="{color:color.text,}"
                :label="String(options.united)" 
              />
            </div>
          </div>
         
          <v-card-text 
            v-if="!options.united && checkOptions('united')"
            class="headline" 
          >
            <div 
              class="settings-title" 
              :style="{color:color.text,borderColor:color.text}"
            >
              Настройки режима United 
            </div>
          </v-card-text>
          <div 
            v-if="!options.united && checkOptions('united')"
            class="options-block united-block"  
          > 
            <v-icon 
              v-if="metrics.length==0"
              class="icon-plus" 
              :color="color.controls" 
              @click="addMetrics"
            >
              {{ plus_icon }}
            </v-icon>
            <div 
              v-for="i in metrics.length" 
              :key="i"
              class="options-item-tooltip"  
            >
              <v-select  
                v-model="metrics[i-1].name"
                :items="metricsName" 
                :color="color.controls" 
                :style="{color:color.text, fill: color.text}"  
                hide-details  
                outlined  
                class="item-metric" 
                label="Имя метрики"
                @click="changeColor"
              /> 
              <v-select  
                v-model="metrics[i-1].type"
                :items="types" 
                :color="color.controls" 
                :style="{color:color.text, fill: color.text}"  
                hide-details  
                outlined  
                class="item-metric" 
                label="Тип графика"
                @click="changeColor"
              /> 
              <v-text-field 
                v-model="metrics[i-1].lowborder" 
                clearable  
                placeholder="0"  
                label="Нижняя граница (ось Y)"
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                :disabled="metrics[i-1].manual"
                outlined 
                class="item-metric border"  
                hide-details
              />
              <v-text-field 
                v-model="metrics[i-1].upborder" 
                clearable  
                placeholder="0"  
                label="Верхняя граница (ось Y)"
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                :disabled="metrics[i-1].manual"
                outlined 
                class="item-metric border"  
                hide-details
              />
              <v-checkbox
                v-model="metrics[i-1].manual"
                :color="color.controls" 
                :style="{color:color.text}"
                class="item-metric checkbox"
                label="Автоматически/Вручную"
                hide-details
              />
              <v-icon 
                class="icon-inside" 
                :color="color.controls" 
                @click="addMetrics"
              >
                {{ plus_icon }}
              </v-icon>
              <v-icon 
                class="icon-inside" 
                :color="color.controls"  
                @click="deleteMetrics(i-1)"
              >
                {{ minus_icon }}
              </v-icon>
            </div> 
          </div>
          <div 
            v-if="checkOptions('multiple')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              multiple
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Возможность выбора нескольких значений
            </div>
            <div class="status-option item">
              <v-switch  
                v-model="options.multiple" 
                class="switch" 
                :color="color.controls" 
                :style="{color:color.text,}" 
                :label="String(options.multiple)" 
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('showlegend')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              showlegend
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Показывать ли легенду
            </div>
            <div class="status-option item">
              <v-switch  
                v-model="options.showlegend" 
                class="switch" 
                :color="color.controls" 
                :style="{color:color.text,}" 
                :label="String(options.showlegend)" 
              />
            </div>
          </div>
          <div 
            v-if="checkOptions('positionlegend')"
            class="option-item" 
          >
            <div 
              class="name-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              positionlegend
            </div>
            <div 
              class="discribe-option item" 
              :style="{color:color.text, borderColor:color.text}"
            >
              Позиция легенды
            </div>
            <div class="status-option item">
              <v-select  
                v-model="options.positionlegend"
                :items="['top','left','right','bottom']" 
                :color="color.controls" 
                :style="{color:color.text, fill: color.text}"  
                hide-details  
                outlined  
                class="subnumber" 
                label="Позиция легенды"
                @click="changeColor"
              /> 
            </div>
          </div>
          <v-card-text 
            class="headline " 
          >
            <div 
              class="settings-title" 
              :style="{color:color.text,borderColor:color.text}"
            >
              Настройки круговой диаграммы 
            </div>
          </v-card-text>

          <div 
            ref="options" 
            class="options-block"  
          >
            <div 
              class="divider-tooltip-setting" 
              :style="{color:color.text}" 
            >
              <p>Соотношение метрик</p>
              <div 
                :style="{backgroundColor:color.text}" 
                class="divider-line"
              />
            </div>  
            <div 
              class="options-item-tooltip"  
            >
              <v-select  
                v-for="i in metricsRelation.metrics.length" 
                :key="i+'metric'"
                v-model="metricsRelation.relations[i-1]"
                :items="metricsRelation.metrics" 
                :color="color.controls" 
                :style="{color:color.text, fill: color.text}"  
                hide-details  
                outlined  
                class="item-metric" 
                :label="metricsRelation.namesMetric[i-1]"
                @click="changeColor"
              /> 
            </div>
            <div 
              class="divider-tooltip-setting" 
              :style="{color:color.text}" 
            >
              <p>Цветовая схема</p>
              <div 
                :style="{backgroundColor:color.text}" 
                class="divider-line"
              />
            </div> 
            <div 
              class="options-item-tooltip"  
            >
              <v-select  
                v-model="colorsPie.theme"
                :items="themesArr" 
                :color="color.controls" 
                :style="{color:color.text, fill: color.text}"  
                hide-details  
                outlined  
                class="item-metric" 
                label="Выберите схему"
                @click="changeColor"
              /> 
              <v-text-field 
                v-show="colorsPie.theme == 'custom'"
                v-model="colorsPie.nametheme" 
                clearable  
                placeholder="green"  
                label="Имя новой схема"
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="item-metric"  
                hide-details
              />
              <v-text-field 
                v-show="colorsPie.theme == 'custom'"
                v-model="colorsPie.colors" 
                clearable  
                placeholder="red,#5F27FF,rgb(95, 39, 255)"  
                label="Новая схема"
                :color="color.text" 
                :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
                outlined 
                class="item-metric"  
                hide-details
              />
            </div>
          </div>
        </div>
        <v-card-text 
          v-if="tooltipSettingShow"
          class="headline " 
        >
          <div 
            class="settings-title" 
            :style="{color:color.text,borderColor:color.text}"
          >
            Настройки tooltip 
          </div>
        </v-card-text>
        <div 
          v-if="tooltipSettingShow"
          ref="options" 
          class="options-block"  
        >
          <div 
            class="divider-tooltip-setting" 
            :style="{color:color.text}" 
          >
            <p>Текст</p>
            <div 
              :style="{backgroundColor:color.text}" 
              class="divider-line"
            />
          </div>  
          <v-icon 
            v-if="tooltip.texts.length==0"
            class="icon-plus" 
            :color="color.controls" 
            @click="addIntoTooltip('text')"
          >
            {{ plus_icon }}
          </v-icon>
          <div 
            v-for="i in tooltip.texts.length" 
            :key="i+'text'"
            class="options-item-tooltip"  
          >
            <v-text-field 
              v-model="tooltip.texts[i-1]" 
              clearable  
              placeholder="Введите текст tooltip"  
              :color="color.text" 
              :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
              outlined 
              class="item-text"  
              hide-details
            />
            <v-icon 
              class="icon-inside" 
              :color="color.controls" 
              @click="addIntoTooltip('text')"
            >
              {{ plus_icon }}
            </v-icon>
            <v-icon 
              class="icon-inside" 
              :color="color.controls"  
              @click="deleteFromTooltip('text',i-1)"
            >
              {{ minus_icon }}
            </v-icon>
          </div>
          <div 
            class="divider-tooltip-setting" 
            :style="{color:color.text}"
          >
            <p>Ссылка</p>
            <div 
              :style="{backgroundColor:color.text}" 
              class="divider-line"
            />
          </div>  
          <v-icon 
            v-if="tooltip.links.length==0"
            class="icon-plus" 
            :color="color.controls" 
            @click="addIntoTooltip('link')"
          >
            {{ plus_icon }}
          </v-icon>
          <div 
            v-for="i in tooltip.links.length" 
            :key="i+'links'"
            class="options-item-tooltip"  
          >
            <v-text-field 
              v-model="tooltip.links[i-1].name" 
              clearable  
              placeholder="Введите название ссылки"  
              :color="color.text" 
              :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
              outlined 
              class="item-link" 
              hide-details
            />
            <v-text-field 
              v-model="tooltip.links[i-1].url" 
              clearable  
              placeholder="Введите текст ссылки"  
              :color="color.text" 
              :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
              outlined 
              class="item-link" 
              hide-details
            />
            <v-icon 
              class="icon-inside" 
              :color="color.controls"  
              @click="addIntoTooltip('link')"
            >
              {{ plus_icon }}
            </v-icon>
            <v-icon 
              class="icon-inside" 
              :color="color.controls"  
              @click="deleteFromTooltip('link',i-1)"
            >
              {{ minus_icon }}
            </v-icon>
          </div>
          <div 
            class="divider-tooltip-setting" 
            :style="{color:color.text}"
          >
            <p>Кнопка</p>
            <div 
              :style="{backgroundColor:color.text}" 
              class="divider-line"
            />
          </div>  
          <v-icon 
            v-if="tooltip.buttons.length==0" 
            class="icon-plus" 
            :color="color.controls" 
            @click="addIntoTooltip('button')"
          >
            {{ plus_icon }}
          </v-icon>
          <div 
            v-for="i in tooltip.buttons.length" 
            :key="i+'button'"
            class="options-item-tooltip"  
          >
            <v-text-field 
              v-model="tooltip.buttons[i-1].name"
              clearable  
              placeholder="Введите название кнопки"  
              :color="color.text" 
              :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
              outlined 
              class="item-button"  
              hide-details
            />
            <v-text-field 
              v-model="tooltip.buttons[i-1].id"
              clearable  
              placeholder="Введите id кнопки"  
              :color="color.text" 
              :style="{color:color.text, background: 'transparent', borderColor: color.text}" 
              outlined 
              class="item-button"  
              hide-details
            />  
            <v-icon 
              class="icon-inside" 
              :color="color.controls"  
              @click="addIntoTooltip('button')"
            >
              {{ plus_icon }}
            </v-icon>
            <v-icon 
              class="icon-inside" 
              :color="color.controls"  
              @click="deleteFromTooltip('button',i-1)"
            >
              {{ minus_icon }}
            </v-icon>
          </div>   
        </div>
        <v-card-actions class="actions-settings">
          <v-spacer />
          <v-btn 
            small 
            :color="color.controlsSystem" 
            class="create-btn"
            @click="setOptions"
          >
            Подтвердить
          </v-btn>
          <v-btn 
            small 
            :color="color.controlsActive" 
            class="create-btn" 
            @click="cancelModal"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script> 

import  settings  from '../js/componentsSettings.js'

import {    mdiPlusBox, mdiMinusBox  } from '@mdi/js'

export default {
  props: {
    idDashFrom: null,
    colorFrom: null,
  },
  data () {
    return {
      element: '',
      options: {},
      optionsItems: [],
      tooltipSettingShow: false,
      plus_icon: mdiPlusBox,
      minus_icon: mdiMinusBox,
      tooltip: { 
        texts: [],                 
        links: [],
        buttons: [],
      },
      metricsRelation: {
        metrics: [],
        relations: [],
        namesMetric: ['Категория','Процентное соотношение','Выбрано']
      },
      colorsPie: {
        theme: 'neitral',
        colors: '',
        nametheme: ''
      },
      themesArr: [],
      themes: {},
      metrics: [],
      types: ['Line chart', 'Bar chart'],
      metricsName: [],
    }
  },
  computed: { 
    active: function() {  // тут понимаем нужно ли открыть окно с созданием или нет 
      if (this.$store.getters.getModalSettings(this.idDash).status){ // если окно должно быть открыто
        this.element = this.$store.getters.getModalSettings(this.idDash).element;  // получаем для каокго элемнета вывести настройки
        if (this.element.indexOf('csvg') != -1) { 
          this.tooltipSettingShow = true;
        } else {   
          this.tooltipSettingShow = false;
        }
        this.prepareOptions();  // и подготовливаем модалку на основе этого элемента
        this.metricsName = this.$store.getters.getMetricsMulti({idDash: this.idDash, id: this.element});
      }
      return this.$store.getters.getModalSettings(this.idDash).status;
    },
    idDash: function(){
      return this.idDashFrom
    },
    color: function() {
      return this.colorFrom
    },

  },
  methods: {  
    setOptions: function() {  // отправляем настройки в хранилище

      if(!this.options.level){
        this.options.level = 1;
      }
    
      if(typeof this.options.timeFormat != 'undefined' && this.options.timeFormat == null){
        this.options.timeFormat = '%Y-%m-%d %H:%M:%S';
      }
      if(typeof this.options.size != 'undefined') {
        if ( this.options.size == null){
          this.options.size = '100px';
        } else if (String(this.options.size).indexOf('px') == -1) {
          this.options.size = `${this.options.size}px`;
        }
      }
      //let options = {...{},...this.options};
      if (this.element.indexOf('csvg') != -1) {
        this.options.tooltip = this.tooltip;
      }
      if (this.element.indexOf('piechart') != -1) {
        this.options.metricsRelation = JSON.parse(JSON.stringify(this.metricsRelation));
        this.options.colorsPie = this.colorsPie;
        if (this.colorsPie.theme == 'custom') {
          this.themes[this.colorsPie.nametheme] = this.colorsPie.colors.split(',')
          this.colorsPie.theme = this.colorsPie.nametheme;
        }
        this.options.themes = this.themes;
      }
      if (this.element.indexOf('multiLine') != -1) {
        let updateMetrics = this.metrics.map( item => {
          return JSON.parse(JSON.stringify(item))
        })
        this.$set(this.options,'metrics',updateMetrics);
      }
      this.$store.commit('setOptions',  { idDash: this.idDash, id: this.element, options: this.options });
      this.cancelModal();
    },
    cancelModal: function() {  // если нажали на отмену создания
      this.$store.commit('setModalSettings',  { idDash: this.idDash, status: false, id: '' } );
    },
    checkEsc: function(event) {
      if (event.code =="Escape") {
        this.cancelModal();
      }
    },
    checkOptions: function(option) { // проверяет есть ли такая опция уже в массиве с опциями
      return this.optionsItems.includes(option)
    },
    addIntoTooltip: function(item) {
      if (item == 'text') {
        this.tooltip.texts.push('');
      } else if (item == 'link') {
        this.tooltip.links.push({name: '',url: ''});
      } else if (item == 'button') {
        this.tooltip.buttons.push({name: '',id: ''});
      }
    },
    addMetrics: function() {
      this.metrics.push({name: '', type: '', upborder: 0, lowborder: 0, manual: true})
    },
    deleteFromTooltip: function(item,i) {

      if (item == 'text') {
        this.tooltip.texts.splice(i, 1);
      }  else if (item == 'link') {
        this.tooltip.links.splice(i, 1);
      }  else if (item == 'button') {
        this.tooltip.buttons.splice(i, 1);
      }
    },
    deleteMetrics: function(i) {
      this.metrics.splice(i, 1);
    },
    changeColor: function() {
      if (document.querySelectorAll('.v-menu__content').length != 0){
        
        document.querySelectorAll('.v-menu__content').forEach( item => {
          
          item.style.boxShadow = `0 5px 5px -3px ${this.color.border},0 8px 10px 1px ${this.color.border},0 3px 14px 2px ${this.color.border}`;
          item.style.background = this.color.back;
          item.style.color = this.color.text;
          item.style.border = `1px solid ${this.color.border}`;
        })
      }
    },
    prepareOptions: function() {  //  понимает какие опции нужно вывести
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.element}); // получаем все опции 
      let elem = this.element.split('-')[0];  // понимаем какой тип элемента попал к нам
      this.options = {}; 
      this.optionsItems = settings.options[elem];
      this.optionsItems.forEach( item => {
        if (Object.keys(options).includes(item)) {
          if (item == 'tooltip') {
            this.tooltip = {};
            this.$set(this.tooltip,'texts', [...[],...options[item].texts]);
            this.$set(this.tooltip,'links', [...[],...options[item].links]);
            this.$set(this.tooltip,'buttons',[...[],...options[item].buttons]);
          } else if (item == 'metrics') {
            //this.$set(this,'metrics',options[item]);
            this.metrics = options[item];
          } else if (item == 'metricsRelation') {
            this.metricsRelation = {};
            this.$set(this.metricsRelation,'metrics', [...[],...options[item].metrics]);
            this.$set(this.metricsRelation,'relations', [...[],...options[item].relations]);
            this.$set(this.metricsRelation,'namesMetric', ['Категория','Процентное соотношение','Выбрано']);
          } else if (item == 'colorsPie') {
            this.colorsPie = {};
            this.$set(this.colorsPie,'theme', options[item].theme);
            this.$set(this.colorsPie,'colors', options[item].colors);
            this.$set(this.colorsPie,'nametheme', options[item].nametheme);
          } else if (item == 'themes') {
            this.themesArr = Object.keys(options[item]);
            this.themes = options[item];
          } else {
            this.$set(this.options,item,options[item]);
          }
        } else {
          this.$set(this.options,item,null);
          if (item == 'united') {
            this.$set(this.options,item,false);
          }
          if (item == 'lastDot') {
            this.$set(this.options,item,false);
          }
          if (item == 'showlegend') {
            this.$set(this.options,item,true);
          }
          if (item == 'positionlegend') {
            this.$set(this.options,item,'right');
          }
          // if (item == 'colorsPie') {
          //   this.colorsPie = {};
          //   this.$set(this.colorsPie,'theme', 'neitral');
          //   this.$set(this.colorsPie,'colors', '');
          //   this.$set(this.colorsPie,'nametheme', '');
          // }
          if (item == 'metrics') {
            this.metrics = [];
          } 
          if (item == 'multiple') {
            this.$set(this.options,item,false);
          }
          if (item == 'underline') {
            this.$set(this.options,item,false);
          }
        }
      })
      if (!this.options.change) {
        this.$set(this.options,'change',false);
      }


    }
         
  },
  mounted() {
    this.$store.commit('setModalSettings',  { idDash: this.idDash, status: false, id: '' } );  
  },
}
</script>

<style lang="sass" > 


    @import '../sass/modalSettings.sass'  

    
</style>