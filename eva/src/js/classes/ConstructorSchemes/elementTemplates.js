export default {
  'shape-type-0': {
    template: `
      <g>
        <template v-if="tag.shape === 0">
          <!--round-rectangle-->
          <rect 
            x="0" 
            y="0" 
            :width="layout.width" 
            :height="layout.height" 
            rx="10" 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
          />
        </template>
        <template v-else-if="tag.shape === 1">
          <!--rectangle-->
          <polygon 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
            :points="'0,0 ' + layout.width + ',0 ' + layout.width + ',' + layout.height + ' 0,' + layout.height"
          />
        </template>
        <template v-else-if="tag.shape === 2">
          <!--ellipse-->
          <ellipse 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
            :ry="layout.height / 2" 
            :cy="layout.height / 2" 
            :rx="layout.width / 2" 
            :cx="layout.width / 2"
          />
        </template>
        <template v-else-if="tag.shape === 3">
          <!--triangle-left-->
          <polygon 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
           :points="layout.width + ',' + layout.height + ' ' + '0,' + layout.height / 2 + ' ' + layout.width + ',0'"
          />
        </template>
        <template v-else-if="tag.shape === 4">
          <!--triangle-right-->
          <polygon 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
           :points="0 + ',' + layout.height + ' ' + layout.width + ',' + layout.height / 2 + ' ' + '0,0'"
          />
        </template>
      </g> 
    `,
    dataRest: {
      nodeId: 'shape-type-0',
      shape: 0,
      dataType: 'shape-type-0',
      fill: '#FFFFFF',
      strokeColor: '#F4F4F4',
      strokeSize: '1.5px',
    },
  },
  'data-type-0': {
    template: `
      <g class="b-data-node">
        <!--Area-->
        <defs>
          <!--Border-radius-bg-->
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect
              x="0"
              y="0"
              :width="layout.width"
              :height="layout.height"
              fill="transparent"
              rx="3"
              ry="3"
            />
          </clipPath>
          <!--Separator-line-->
          <rect
            :id="'separator-line-' + tag.nodeId"
            :width="layout.width"
            height="1"
            fill="#E0E0EC"
          />
        </defs>
        <template v-if="tag.widthLeft > 0">
        <!--Bg-left-->
        <rect
          x="0"
          y="0"
          :width="layout.width * (tag.widthLeft / 100)"
          :height="layout.height"
          fill="#FFFFFF"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-right-->
        <rect
          :x="layout.width * (tag.widthLeft / 100)"
          y="0"
          :width="layout.width - (layout.width * (tag.widthLeft / 100))"
          :height="layout.height"
          fill="#000000"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        </template>
        <template v-else>
         <!--Bg-left-->
        <rect
          x="0"
          y="0"
          :width="layout.width / 2"
          :height="layout.height"
          fill="#FFFFFF"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-right-->
        <rect
          :x="layout.width / 2"
          y="0"
          :width="layout.width / 2"
          :height="layout.height"
          fill="#000000"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        </template>
        <template v-if="tag && tag.items && tag.items.length > 0">
          <template v-for="(item, index) in tag.items">
            <text
              dx="0.5em"
              class="b-data-node__text b-data-node__text--left"
              fill="#3C3B45"
              :dy="(((layout.height / tag.items.length) * (index + 1)) - ((layout.height / tag.items.length) / 2))"
              alignment-baseline="middle"
              :key="'row-' + tag.nodeId + '-' + index + '-text-left'"
              :font-size="((layout.height / tag.items.length) * 0.8) + 'px'"
            >
              {{ item.textLeft }}
            </text>
            <text
              text-anchor="end"
              :dy="(((layout.height / tag.items.length) * (index + 1)) - ((layout.height / tag.items.length) / 2))"
              alignment-baseline="middle"
              :dx="(layout.width / 2) - 1"
              class="b-data-node__text b-data-node__text--right"
              :transform="'translate(' + (layout.width - 8) / 2 + ')'"
              fill="white"
              :key="'row-' + tag.nodeId + '-' + index + '-text-right'"
              :font-size="((layout.height / tag.items.length) * 0.8) + 'px'"
            >
              {{ item.textRight }}
            </text>
            <use
              v-if="index < (tag.items.length - 1)"
              :href="'#separator-line-' + tag.nodeId"
              x="0"
              :y="(layout.height / tag.items.length) * (index + 1)"
              :key="'row-' + tag.nodeId + '-' + index + '-separator'"
            />
          </template>
        </template>
      </g>
    `,
    width: 150,
    rowHeight: 16,
    dataRest: {
      // Уникальный идентификатор элемента для отсутствия проблем со стилизацией на графе
      nodeId: 'template-0',
      // Идентификатор для связки данных с элементом,
      // в дальнейшем должен приходить с сервера
      dataType: 'data-type-0',
      templateType: 'template-0',
      widthLeft: 50,
      items: [
        {
          id: '',
          textLeft: '-',
          textRight: '-',
        },
        {
          id: '',
          textLeft: '-',
          textRight: '-',
        },
        {
          id: '',
          textLeft: '-',
          textRight: '-',
        },
        {
          id: '',
          textLeft: '-',
          textRight: '-',
        },
      ],
    },
  },
  'data-type-1': {
    template: `
      <g class="b-data-node">
        <!--Area-->
        <defs>
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect 
              x="0" 
              y="0" 
              :width="layout.width" 
              :height="layout.height" 
              fill="transparent" 
              rx="3" 
              ry="3" 
            />
          </clipPath>
        </defs>
        <!--Bg-top-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height / 2"
          fill="#000000"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-bottom-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height / 2"
          fill="#FFFFFF"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
          :transform="'translate(' + layout.width + ',' + layout.height + '), rotate(180)'"
        />
        <text
         :dx="layout.width / 2"
         text-anchor="middle"
         class="b-data-node__text"
         fill="#FFFFFF"
         :dy="((layout.height / 2) - (layout.height / 4))"
         alignment-baseline="middle"
         :font-size="((layout.height / 2) * 0.8) + 'px'"
        >
          {{ tag.textFirst }}
        </text>
        <text
         :dx="layout.width / 2"
         text-anchor="middle"
         class="b-data-node__text"
         fill="#3C3B45"
         :dy="(layout.height - (layout.height / 4))"
         alignment-baseline="middle"
         :font-size="((layout.height / 2) * 0.8) + 'px'"
        >
          {{ tag.textSecond }}
        </text>
      </g>
    `,
    width: 150,
    rowHeight: 30,
    dataRest: {
      dataType: 'data-type-1',
      nodeId: 'template-1',
      templateType: 'template-1',
      id: '',
      textFirst: '-',
      textSecond: '-',
    },
  },
  'data-type-2': {
    template: `
      <g class="b-data-node">
        <!--Area-->
        <defs>
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect 
              x="0" 
              y="0" 
              :width="layout.width" 
              :height="layout.height" 
              fill="transparent" 
              rx="3" 
              ry="3" 
            />
          </clipPath>
        </defs>
        <!--Bg-left-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height"
          :fill="tag.maxValueColor"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-right-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="((layout.height / 100) * (tag.currentValue * 100 / tag.maxValue))"
          :fill="tag.currentValueColor"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
          :transform="'translate(' + layout.width + ',' + layout.height + '), rotate(180)'"
        />
        <text
          class="b-data-node__text"
          :dx="layout.width / 2"
          :dy="layout.height / 2"
          alignment-baseline="middle"
          text-anchor="middle"
          :fill="tag.textColor"
          :font-size="((layout.height / 2) * 0.8) + 'px'"
        >
          {{ tag.currentValue }}
        </text>
      </g>
    `,
    width: 150,
    height: 30,
    dataRest: {
      dataType: 'data-type-2',
      nodeId: 'template-2',
      id: '',
      templateType: 'template-2',
      currentValue: 1.5,
      currentValueColor: '#FFFFFF',
      maxValue: 3,
      maxValueColor: '#000000',
      textColor: 'red',
    },
  },
  'data-type-3': {
    template: `
      <g class="b-data-node">
        <!--Area-->
        <defs>
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect 
              x="0" 
              y="0" 
              :width="layout.width" 
              :height="layout.height" 
              fill="transparent" 
              rx="3" 
              ry="3" 
            />
          </clipPath>
        </defs>
        <template v-if="(tag.firstValue + tag.secondValue) > 0 && typeof (tag.firstValue + tag.secondValue) === 'number'">
          <!--Bg-left-->
          <rect
            x="0"
            y="0"
            :width="layout.width"
            :height="layout.height * (tag.firstValue / (tag.firstValue + tag.secondValue))"
            :fill="tag.firstValueColor"
            :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
          />
          <!--Bg-right-->
          <rect
            x="0"
            y="0"
            :width="layout.width"
            :height="layout.height * (tag.secondValue / (tag.firstValue + tag.secondValue))"
            :fill="tag.secondValueColor"
            :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
            :transform="'translate(' + layout.width + ',' + layout.height + '), rotate(180)'"
          />
          <text
            class="b-data-node__text"
            :dx="layout.width / 2"
            :dy="(layout.height / 6) * 2"
            alignment-baseline="middle"
            text-anchor="middle"
            :fill="tag.firstTextColor"
            :font-size="((layout.height / 3) * 0.8) + 'px'"
          >
              {{ tag.firstValue }}
          </text>
          <text
            class="b-data-node__text"
            :dx="layout.width / 2"
            :dy="(layout.height / 6) * 4"
            alignment-baseline="middle"
            text-anchor="middle"
            :fill="tag.secondTextColor"
            :font-size="((layout.height / 3) * 0.8) + 'px'"
          >
              {{ tag.secondValue }}
          </text>
        </template>
        <template v-else>
          <text
            class="b-data-node__text"
            :dx="layout.width / 2"
            :dy="(layout.height / 6) * 2"
            alignment-baseline="middle"
            text-anchor="middle"
            :style="'text-wrap:' + layout.width + 'px; text-extent: 3line'"
            :fill="tag.firstTextColor"
            :font-size="((layout.height / 3) * 0.8) + 'px'"
            >
              Выбраны некорректные значения
          </text>
        </template>
      </g>
    `,
    width: 150,
    height: 70,
    dataRest: {
      dataType: 'data-type-3',
      nodeId: 'template-3',
      idFirst: '',
      templateType: 'template-3',
      firstValue: 5,
      firstValueColor: '#3366FF',
      firstTextColor: '#FFFFFF',
      secondValue: 5,
      secondValueColor: '#FF5147',
      secondTextColor: '#FFFFFF',
      idSecond: '',
    },
  },
  'label-type-0': {
    template: `
      <g class="b-label-node">
        <!--Area-->
        <defs>
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect 
              x="0" 
              y="0" 
              :width="layout.width" 
              :height="layout.height" 
              fill="transparent" 
              :rx="tag.bordered && tag.borderSize / 2 || 3"
            />
          </clipPath>
        </defs>
        <!--Bg-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height"
          :fill="tag.bgColor.rgbaString || 'transparent'"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
          :stroke="tag.bordered && tag.borderColor.rgbaString || 'transparent'" 
          :stroke-width="tag.bordered && tag.borderSize || '0'" 
          :stroke-dasharray="tag.bordered && tag.borderDashed ? '4' : '0'" 
          :rx="tag.bordered && tag.borderSize / 2 || 3" 
        />
        <foreignObject 
          :height="layout.height" 
          :width="layout.width"
        >
          <div
           class="b-data-node__label" 
           :style="{
             height: '100%', 
             display: 'flex', 
             justifyContent: 'center', 
             alignItems: 'center',
           }" 
          >
            <div 
             class="b-data-node__text-label" 
             :style="{
              width: layout.width + 'px',
              height: layout.height + 'px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              writingMode: tag.isVertical ? 'vertical-rl' : 'horizontal-tb',
              textOrientation: 'mixed', 
              transform: tag.isVertical ? 'rotate(180deg)' : 'rotate(0deg)',
              color: tag.textColor,
              fontSize: tag.fontSize ? tag.fontSize + 'px' : '12px',
              fontFamily: tag.fontFamily,
             }"
            >
              {{ tag.text }}
            </div>
          </div>
        </foreignObject>
      </g>
    `,
    width: 150,
    height: 30,
    dataRest: {
      dataType: 'label-type-0',
      nodeId: 'label-template-0',
      id: '',
      textTemplateType: 'template-0',
      text: 'Text',
      isVertical: false,
      bordered: true,
      borderType: 'solid',
      borderSize: 1,
      borderDashed: true,
      borderColor: '#000000',
      bgColor: '#FFFFFF',
      textColor: '#000000',
      fontSize: 12,
    },
  },
};
