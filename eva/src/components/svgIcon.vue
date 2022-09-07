<template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    iconName: {
      type: String,
      default: '',
    },
  },
};
</script>
