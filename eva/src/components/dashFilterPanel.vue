<template>
	<div class="">
		<v-btn @click="addFilter">Добавить фильтр</v-btn>
	</div>
</template>

<script>
export default {
	name:"DashFilterPanel",
	props:{
		idDashFrom:null
	},
	methods: {
		addFilter(){
			console.log(this.$store.state); 
			console.log(this.idDashFrom);
		}
	},
}
</script>

<style lang="sass" scoped>

@import '../sass/dashFilterPanel.sass'

</style>