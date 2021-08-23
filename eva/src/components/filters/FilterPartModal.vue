<template>
  <v-card>
    <v-card-title class="text-h5"> Часть фильтра "{{ filter.id }}" </v-card-title>
    <v-card-subtitle>
      <v-tabs v-model="currentTab" centered grow>
        <v-tab v-for="tab in typeTabs" :key="tab">
          {{ tab | partTypeFilter }}
        </v-tab>
      </v-tabs>
    </v-card-subtitle>
    <v-card-text>
      <v-tabs-items v-model="currentTab">
        <v-tab-item>
          <v-row>
            <v-col>
              <v-select
                v-model="temp.token"
                :items="$store.getters.getTockens(filter.idDash)"
                item-text="name"
                label="Токены"
                return-object
                filled
              >
              </v-select>
            </v-col>
            <v-col>
              <v-select v-model="temp.operation" :items="operations" label="Операции" filled>
              </v-select>
            </v-col>
          </v-row>
        </v-tab-item>

        <v-tab-item> MANUAL </v-tab-item>
      </v-tabs-items>
      <v-btn @click="addFilterPart">save</v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    name: 'FilterPartModal',
    props: ['triggerFilterPartModal', 'filter'],
    data() {
      return {
        typeTabs: ['token', 'manual'],
        operations: ['OR', 'AND', 'REPLACE'],
        temp: {
          operation: 'OR',
          token: null,
          values: [],
        },
        currentTab: 0,
        tokens: [],
      };
    },
    methods: {
      addFilterPart(){
        this.filter.parts.push(this.temp)
        this.$emit('triggerFilterPartModal')
      }
    },
    filters: {
      partTypeFilter(tab) {
        let tabTextMap = {
          token: 'Токены',
          manual: 'Ручная настройка',
        };
        return tabTextMap[tab];
      },
    },
    mounted() {},
  };
</script>
