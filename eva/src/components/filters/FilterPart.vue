<template>
  <div class="pa-1 filter-part">
    <div>
      {{ filterPart.token.name }}
    </div>
    <div>
      {{ filterPart.token.capture }}
      ({{ filterPart.values.length }})
    </div>
  </div>
</template>

<script>
  export default {
    name: 'FilterPart',
    props: ['filterPart'],
  };
</script>

<style scoped>
.filter-part{
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0;
}
</style>