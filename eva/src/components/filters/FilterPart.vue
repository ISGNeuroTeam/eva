<template>
  <div>
    <v-container>
      <v-row>
        {{ filterPart.token.name }}
      </v-row>
      <v-row>
        <v-col>
          {{ filterPart.token.capture }} 
					({{ filterPart.values.length }})
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  export default {
    name: 'FilterPart',
    props: ['filterPart'],
  };
</script>

<style></style>
