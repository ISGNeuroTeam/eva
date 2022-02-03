<template>
  <div class="notfound">
    <h1>К сожалению, страница не найдена</h1>
    <div class="img-block">
      <img :src="require('../images/notfound.gif')" alt="notfound" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
};
</script>

<style>
h1 {
  font-size: 40px;
  text-align: center;
  margin: 100px auto;
}
.img-block {
  width: 100%;
  height: auto;
  margin: 0 auto;
  text-align: center;
}
</style>
